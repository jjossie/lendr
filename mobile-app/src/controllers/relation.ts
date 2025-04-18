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
import {getUserFromAuth, getUserFromUid} from "./auth";
import {LendrUser} from "../models/lendrUser";
import {Dispatch, SetStateAction} from "react";
import { callCloudFunction } from "../utils/firebase.utils";

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

export async function getRelationById(relationId: string): Promise<Relation> {
  const relationsCollection = collection(db, "relations");
  const relationDocRef = doc(relationsCollection, relationId);
  const relationDoc = await getDoc(relationDocRef);
  if (!relationDoc.exists())
    throw new NotFoundError(`Relation with id ${relationId} does not exist ⭕️`);

  const relationDocumentData = relationDoc.data();

  return {id: relationId, ...relationDocumentData} as Relation;
}

export function getOtherUserInRelation(relation: Relation, user: LendrUser | User): LendrUser {
  return relation.users.filter((chatUser) => chatUser.uid != user.uid)[0];
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
    const lastMessagePromises: Promise<any>[] = [];
    snapshot.forEach(async (relationDocument) => {
      if (!relationDocument || !relationDocument.exists())
        throw new NotFoundError(`🤝Relation not found ⁉️`);

      // Extract the data from the document
      const relationDocumentData: Relation =
        relationDocument.data() as Relation;

      // Get the info of the other user to be displayed in the chats list
      const otherUser = getOtherUserInRelation(relationDocumentData, authUser);

      // Get the most recent message for each relation
      const lastMessageQuery = query(
        collection(relationDocument.ref, "messages"),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      lastMessagePromises.push(getDocs(lastMessageQuery));

      // Add the (incomplete) relation to the list
      docDataList.push({
        id: relationDocument.id,
        otherUser: otherUser,
        ...relationDocumentData,
      } as ChatViewListItem);
    });

    // Tack on the data for the last message of each relation
    Promise.all(lastMessagePromises).then((lastMessages) => {
      for (let i = 0; i < docDataList.length; i++) {
        docDataList[i].lastMessage = lastMessages[i].docs[0]?.data();
      }
      // It appears that although we are properly setting the list here with newly hydrated
      // objects, JS thinks the list is unchanged. So we must also set loading state:
      setChats(docDataList);
      setIsLoaded((b) => !b);
    });

    // Don't use this yet because it will screw up the loop in the Promise.all() call.
    // docDataList.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds)

    setChats(docDataList);
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
    let messages: ChatMessage[] = [];
    snapshot.forEach(messageSnap => {
      messages.push({
        id: messageSnap.id,
        ...messageSnap.data(),
      } as ChatMessage);
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
    let loans: Loan[] = [];
    snapshot.forEach(async loanSnap => {
      let loanDoc = loanSnap.data() as Loan;
      // if (!loanDoc.tool) // Pretty sure it's actually not necessary 'cause they're hydrated on the backend now
      //   // Front-end Hydration necessary
      //   loanDoc.tool = await getToolById(loanDoc.toolId) as IToolPreview;

      loans.push({
        id: loanSnap.id,
        ...loanDoc,
      } as Loan);
    });
    setLoans(loans.reverse());
  });
}