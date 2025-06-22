import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  DocumentData,
  documentId,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";
import {auth, db} from "../config/firebase";
import {User} from "firebase/auth";
import {AuthError, LendrBaseError, NotFoundError, NotImplementedError, ObjectValidationError} from "../utils/errors";
import {ChatMessage, ChatViewListItem, Loan, Relation} from "../models/relation";
import { RelationSchema, ChatMessageSchema, LoanSchema, RelationValidated } from "../models/relation.zod";
import {getUserFromAuth, getUserFromUid} from "./auth";
import {LendrUser} from "../models/lendrUser";
import {Dispatch, SetStateAction} from "react";
import { callCloudFunction } from "../utils/firebase.utils";
import { LendrUserPreview } from "../models/lendrUser.zod";

// Constants
const MESSAGE_LOAD_LIMIT = 20;

export function getRelationId(currentUserId: string, otherUserId: string) {
  // Sort the two user IDs alphabetically to ensure that the relation is unique.
  const sortedUserIds = [currentUserId, otherUserId].sort();
  return `${sortedUserIds[0]}-${sortedUserIds[1]}`;
}

/**
 * This is always initiated by the borrower at time of chat conversation being initiated.
 * @param {string} otherUserId
 * @param {string} toolId
 * @returns {Promise<string>} the ID of the newly created Relation
 */
export async function createRelation(otherUserId: string, toolId: string): Promise<string> {
  // Get Auth
  if (!auth.currentUser) throw new AuthError();

  // Get the hydrated LendrUser objects
  const [user, otherUser] = await Promise.all([
    getUserFromAuth(auth.currentUser),
    getUserFromUid(otherUserId),
  ]);
  if (!user) throw new LendrBaseError("Couldn't get LendrUsers from UIDs");

  // Add the Relation to Firestore
  const relationsCollection = collection(db, "relations");
  const relationId = getRelationId(auth.currentUser.uid, otherUserId);
  console.log("🤝Creating Relation ID: ", relationId);
  const relationDocRef = doc(relationsCollection, relationId);
  const relationDoc = await getDoc(relationDocRef);
  if (!relationDoc.exists()) {
    await setDoc(relationDocRef, {
      users: [user, otherUser],
      createdAt: serverTimestamp() as Timestamp,
    } as Relation);
  } else {
    console.log("🤝Found existing relation");
  }

  // Create the loan record
  const loansCollection = collection(relationDocRef, "loans");
  const loan = await addDoc(loansCollection, {
    borrowerUid: auth.currentUser.uid,
    lenderUid: otherUserId,
    toolId,
    inquiryDate: serverTimestamp() as Timestamp,
  } as Loan);
  console.log("");

  // Add the other uid to each User's relations list
  const usersCollection = collection(db, "users");
  const userDocRef = doc(usersCollection, auth.currentUser.uid);
  const otherUserDocRef = doc(usersCollection, otherUserId);
  await updateDoc(userDocRef, {
    relations: arrayUnion(otherUserId),
  });
  await updateDoc(otherUserDocRef, {
    relations: arrayUnion(auth.currentUser.uid),
  });

  return relationId;
}

export async function getRelationById(relationId: string): Promise<RelationValidated> {
  const relationsCollection = collection(db, "relations");
  const relationDocRef = doc(relationsCollection, relationId);
  const relationDoc = await getDoc(relationDocRef);
  if (!relationDoc.exists())
    throw new NotFoundError(`Relation with id ${relationId} does not exist ⭕️`);

  const rawData = relationDoc.data();
  if (!rawData) {
    // Should be caught by !relationDoc.exists() but good for type safety
    throw new NotFoundError(`Relation data is undefined for id ${relationId} 🤷‍`);
  }

  const validationResult = RelationSchema.safeParse(rawData);

  if (!validationResult.success) {
    console.error("Validation failed for relation:", relationId, validationResult.error.flatten());
    throw new ObjectValidationError(`Relation data validation failed for id ${relationId} 😥`, validationResult.error);
  }

  // The id is from the document snapshot, not part of the schema-validated data initially
  return { id: relationId, ...validationResult.data };
}

export function getOtherUserInRelation(relation: Relation | RelationValidated, user: LendrUser | User): LendrUserPreview {
  // This assumes relation.users is always an array of two users, which is enforced by the schema.
  // Might need to be adjusted based on types and schema changes.
  return relation.users.filter((chatUser) => chatUser.uid != user.uid)[0] as LendrUserPreview;
}

export async function sendChatMessage(receiverUid: string,
                                      text: string,
                                      replyingToId?: string,
                                      media?: any) {
  console.log(`🤝sending chat "${text}" to ${receiverUid}`);
  if (!auth.currentUser)
    throw new AuthError();

  const relationsCollection = collection(db, "relations");
  const messagesCollection = collection(relationsCollection, getRelationId(auth.currentUser.uid, receiverUid), "messages");

  const newMessage: ChatMessage = {
    text,
    receiverUid,
    senderUid: auth.currentUser.uid,
    createdAt: serverTimestamp() as Timestamp,
  };
  if (replyingToId)
    newMessage.replyingToId = replyingToId;
  if (media)
    newMessage.media = media;

  await addDoc(messagesCollection, newMessage);
}

export async function acceptHandoff(relationId: string, loanId: string) {
  await callCloudFunction("acceptHandoff", {relationId, loanId});
}

export async function startHandoff(relationId: string, loanId: string) {
  await callCloudFunction("startHandoff", {relationId, loanId});
}

export async function requestReturn(relationId: string, loanId: string) {
  throw new NotImplementedError();
}


export function getLiveChatConversationsList(
  setChats: Dispatch<SetStateAction<ChatViewListItem[]>>,
  setIsLoaded: Dispatch<SetStateAction<boolean>>,
  authUser: User,
  lendrUser: LendrUser
): Unsubscribe {
  const relationIds = lendrUser.relations.map((id) =>
    getRelationId(authUser.uid, id)
  );
  if (!relationIds || relationIds.length === 0) return () => {}; // TODO double check early exit behavior
  const relationsQuery = query(
    collection(db, "relations"),
    where(documentId(), "in", relationIds)
  );

  const unsubscribe = onSnapshot(relationsQuery, async (snapshot) => {
    const docDataList: ChatViewListItem[] = [];
    const validRelationsData: { relation: RelationValidated; otherUser: LendrUserPreview; id: string }[] = [];
    const lastMessagePromises: Promise<QuerySnapshot<DocumentData>>[] = [];

    snapshot.forEach(async (relationDocument) => {
      if (!relationDocument || !relationDocument.exists()) {
        // This case might be redundant if Firestore snapshot never includes non-existent docs in a live listener
        console.warn(`Relation document ${relationDocument} does not exist or has no data, skipping.`);
        return;
      }

      const rawRelationData = relationDocument.data();
      if (!rawRelationData) {
        console.warn(`Relation data is undefined for document ${relationDocument.id}, skipping.`);
        return;
      }

      const relationValidationResult = RelationSchema.safeParse(rawRelationData);

      if (!relationValidationResult.success) {
        console.error("Validation failed for relation:", relationDocument.id, relationValidationResult.error.flatten());
        // Skip this relation
        return;
      }
      const validatedRelationData = relationValidationResult.data;

      // Get the info of the other user to be displayed in the chats list
      // Ensure validatedRelationData is used here
      const otherUser = getOtherUserInRelation({ id: relationDocument.id, ...validatedRelationData }, authUser);
      if (!otherUser) {
        console.error(`Could not determine other user for relation ${relationDocument.id}, skipping.`);
        return;
      }

      validRelationsData.push({
        id: relationDocument.id,
        relation: validatedRelationData,
        otherUser: otherUser,
      });

      // Get the most recent message for each relation
      const lastMessageQuery = query(
        collection(relationDocument.ref, "messages"),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      lastMessagePromises.push(getDocs(lastMessageQuery));
    });

    // Process valid relations and their last messages
    Promise.all(lastMessagePromises)
      .then((lastMessageSnapshots) => {
        const finalChatListItems: ChatViewListItem[] = validRelationsData.map((validRel, index) => {
          const lastMessageDoc = lastMessageSnapshots[index]?.docs[0];
          let lastMessageData: ChatMessage | undefined = undefined;

          if (lastMessageDoc?.exists()) {
            const rawMessageData = lastMessageDoc.data();
            const messageValidationResult = ChatMessageSchema.safeParse(rawMessageData);
            if (messageValidationResult.success) {
              lastMessageData = { id: lastMessageDoc.id, ...messageValidationResult.data };
            } else {
              console.error(
                "Validation failed for last message in relation:",
                validRel.id,
                messageValidationResult.error.flatten()
              );
              // lastMessageData remains undefined
            }
          }
          
          return {
            id: validRel.id,
            users: validRel.relation.users, // from validated relation data
            createdAt: validRel.relation.createdAt, // from validated relation data
            lastMessage: lastMessageData,
            otherUser: validRel.otherUser,
          };
        });

        // Sort or perform other operations if needed
        // finalChatListItems.sort((a, b) => (b.lastMessage?.createdAt?.seconds || 0) - (a.lastMessage?.createdAt?.seconds || 0));
        
        setChats(finalChatListItems);
        setIsLoaded((b) => !b); // Consider more robust loading state management
      })
      .catch(error => {
        console.error("Error processing last messages:", error);
        // Potentially set an error state for the UI
      });
  });

  return unsubscribe;
}

/**
 * Gets the messages for a relation and calls the setMessages function with the messages.
 * Supports the useChatMessages hook.
 *
 * @param {(messages: any) => any} setMessages The React setState function to set the messages
 * @param {User} authUser
 * @param {LendrUser} user
 * @param {Relation} relation
 */
export function getLiveMessages(setMessages: ((messages: any) => any),
                                authUser: User,
                                user: LendrUser,
                                relation: Relation): Unsubscribe | undefined {

  // This might run before user is initialized - just skip if that's the case
  if (!authUser || !user) return;
  if (!relation.id) throw new ObjectValidationError("Relation passed into getLiveMessages with no ID");

  // Identify parties ... for some reason?
  // const otherUser = relation.users.filter(u => u.uid != authUser.uid)[0];

  const messagesQuery = query(
      collection(db, "relations", relation.id, "messages"),
      orderBy("createdAt", "desc"),
      limit(MESSAGE_LOAD_LIMIT),
  );
  return onSnapshot(messagesQuery, (snapshot: QuerySnapshot<DocumentData>) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach(messageSnap => {
      const rawData = messageSnap.data();
      if (!rawData) {
        console.warn(`Message data is undefined for doc id ${messageSnap.id}, skipping.`);
        return; // Skip this document
      }

      const validationResult = ChatMessageSchema.safeParse(rawData);
      if (!validationResult.success) {
        console.error("Validation failed for chat message:", messageSnap.id, validationResult.error.flatten());
        return; // Skip this message
      }
      
      messages.push({
        id: messageSnap.id, // ID from the document snapshot
        ...validationResult.data, // Spread the validated data
      });
    });
    setMessages(messages.reverse());
  });
}

/**
 * Gets the loans for a relation and calls the setLoans function with the loans.
 * Supports the useChatMessages hook. Maybe I should have made it a separate hook lol
 *
 * @param {(loans: any) => any} setLoans The React setState function
 * @param {User} authUser The authenticated user
 * @param {Relation} relation The Relation object to get the loans for. Must have an ID.
 * @returns {Unsubscribe | undefined} The unsubscribe function if it was successful, undefined otherwise.
 */
export function getLiveLoans(setLoans: (loans: any) => any,
                             authUser: User,
                             relation: Relation): Unsubscribe | undefined {
  console.log("🤝getLiveLoans()");
  if (!authUser || !relation.id) return;

  const loansQuery = query(
      collection(db, "relations", relation.id, "loans"),
      orderBy("inquiryDate", "desc"), //TODO fix inquiry date problem: this rejects docs w/o an inquiry date
  );
  return onSnapshot(loansQuery, (snapshot: QuerySnapshot<DocumentData>) => {
    const loans: Loan[] = [];
    snapshot.forEach(async loanSnap => {
      const rawData = loanSnap.data();
      if (!rawData) {
        console.warn(`Loan data is undefined for doc id ${loanSnap.id}, skipping.`);
        return; // Skip this document
      }

      const validationResult = LoanSchema.safeParse(rawData);
      if (!validationResult.success) {
        console.error("Validation failed for loan:", loanSnap.id, validationResult.error.flatten());
        return; // Skip this loan
      }
      
      let validatedLoanData = validationResult.data;

      // The commented-out tool hydration logic can be revisited later.
      // For now, validatedLoanData.tool will be whatever z.any() parsed.
      // if (!validatedLoanData.tool && validatedLoanData.toolId) {
      //   console.log(`Attempting to hydrate tool for loan ${loanSnap.id}`);
      //   try {
      //     // Assuming getToolById is updated to return a ToolPreview compatible type or
      //     // a new function getToolPreviewById is created.
      //     // const toolPreview = await getToolById(validatedLoanData.toolId); // This needs to be adjusted for ToolPreview
      //     // if (toolPreview) {
      //     //   validatedLoanData.tool = toolPreview; // Or however ToolPreviewSchema is structured
      //     // }
      //   } catch (error) {
      //     console.error(`Error hydrating tool ${validatedLoanData.toolId} for loan ${loanSnap.id}:`, error);
      //   }
      // }

      loans.push({
        id: loanSnap.id, // ID from the document snapshot
        ...validatedLoanData, // Spread the validated data
      });
    });
    setLoans(loans.reverse()); // Note: forEach with async inside might not order correctly before reverse.
                               // If issues arise, consider Promise.all for async operations within loop.
                               // However, current async operation (tool hydration) is commented out.
  });
}