import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  DocumentData,
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
  updateDoc,
} from "firebase/firestore";
import {app, db} from "../config/firebase";
import {getAuth, User} from "firebase/auth";
import {AuthError, LendrBaseError, NotFoundError, ObjectValidationError} from "common/utils/errors";
import {IChatMessage, IChatViewListItem, ILoan, IRelation} from "../models/Relation";
import {getUserFromAuth, getUserFromUid} from "./auth";
import {ILendrUser} from "../models/ILendrUser";

// Constants
const MESSAGE_LOAD_LIMIT = 20;


// TODO: This is all very stateful. Let's make it into a class.

// // CodeWhisperer nonsense
// class Relation {
//   private readonly relationId: string;
//   private otherUserId: string;
//   private toolId: string;
//   private messagesCollection: CollectionReference;
//
//   constructor(otherUserId: string, toolId: string) {
//     this.otherUserId = otherUserId;
//     this.toolId = toolId;
//     this.relationId = getRelationId(getAuth().currentUser.uid, otherUserId);
//     this.messagesCollection = collection(db, "relations", this.relationId, "messages");
//   }
//
//   public async sendMessage(text: string, replyingToId?: string, media?: any) {
//     const auth = getAuth(app);
//     if (!auth.currentUser)
//       throw new AuthError();
//
//     const newMessage: IChatMessage = {
//       text,
//       receiverUid: this.otherUserId,
//       senderUid: auth.currentUser.uid,
//       createdAt: serverTimestamp() as Timestamp,
//     };
//     if (replyingToId)
//       newMessage.replyingToId = replyingToId;
//     if (media)
//       newMessage.media = media;
// }


export function getRelationId(currentUserId: string, otherUserId: string) {
  // Sort the two user IDs alphabetically to ensure that the relation is unique.
  const sortedUserIds = [currentUserId, otherUserId].sort();
  return `${sortedUserIds[0]}-${sortedUserIds[1]}`;
}

/**
 * This is always initiated by the borrower at time of chat conversation being initiated.
 * @param {string} otherUserId
 * @param {string} toolId
 * @returns {Promise<void>}
 */
export async function createRelation(otherUserId: string, toolId: string) {

  // Get Auth
  const auth = getAuth(app);
  if (!auth.currentUser)
    throw new AuthError();

  // Get the hydrated LendrUser objects
  const user = await getUserFromAuth(auth.currentUser); // TODO wrap with promise.all
  const otherUser = await getUserFromUid(otherUserId);
  if (!user)
    throw new LendrBaseError("Couldn't get LendrUsers from UIDs");


  // Add the Relation to Firestore
  const relationsCollection = collection(db, "relations");
  const relationId = getRelationId(auth.currentUser.uid, otherUserId);
  console.log("Creating Relation ID: ", relationId);
  const relationDocRef = doc(relationsCollection, relationId);
  await setDoc(relationDocRef, {
    users: [user, otherUser],
    createdAt: serverTimestamp() as Timestamp,
  } as IRelation);

  // Create the loan record
  const loansCollection = collection(relationDocRef, "loans");
  await addDoc(loansCollection, {
    borrowerUid: auth.currentUser.uid,
    lenderUid: otherUserId,
    toolId,
    inquiryDate: serverTimestamp() as Timestamp,
  } as ILoan);

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
}

export async function getRelationById(relationId: string): Promise<IRelation> {
  const relationsCollection = collection(db, "relations");
  const relationDocRef = doc(relationsCollection, relationId);
  const relationDoc = await getDoc(relationDocRef);
  if (!relationDoc.exists())
    throw new NotFoundError(`Relation with id ${relationId} does not exist ⭕️`);

  const relationDocumentData = relationDoc.data();

  return {id: relationId, ...relationDocumentData} as IRelation;
}

export function getOtherUserInRelation(relation: IRelation, user: ILendrUser | User): ILendrUser {
  return relation.users.filter((chatUser) => chatUser.uid != user.uid)[0];
}

export async function sendChatMessage(receiverUid: string,
                                      text: string,
                                      replyingToId?: string,
                                      media?: any) {
  console.log(`sending chat "${text}" to ${receiverUid}`);
  const auth = getAuth(app);
  if (!auth.currentUser)
    throw new AuthError();

  const relationsCollection = collection(db, "relations");
  const messagesCollection = collection(relationsCollection, getRelationId(auth.currentUser.uid, receiverUid), "messages");

  const newMessage: IChatMessage = {
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


/**
 * Oops my abstraction is leaking 🫠 Anyway this takes a query snapshot of the relations
 * in the database and then hydrates them into a list of chat view objects.
 *
 * @param {QuerySnapshot<DocumentData>} snapshot
 * @param {User} authUser
 * @param {(chats: any) => any} setChats
 * @param {(isLoaded: boolean) => void} setIsLoaded
 */
export function handleRelationsQuerySnapshot(snapshot: QuerySnapshot<DocumentData>,
                                             authUser: User,
                                             setChats: ((chats: any) => any),
                                             setIsLoaded: (isLoaded: boolean) => void): void {
  console.log("🛠️useMyChats() - onSnapshot() called");

  if (!authUser) return;

  const docDataList: IChatViewListItem[] = [];
  const lastMessagePromises: Promise<any>[] = [];
  snapshot.forEach(async relationDocument => {
    // Extract the data from the document
    const relationDocumentData: IRelation = relationDocument.data() as IRelation;

    // Get the info of the other user to be displayed in the chats list
    const otherUser = getOtherUserInRelation(relationDocumentData, authUser);

    // Get the most recent message for each relation
    const lastMessageQuery = query(collection(relationDocument.ref, "messages"),
        orderBy("createdAt", "desc"), limit(1));
    lastMessagePromises.push(getDocs(lastMessageQuery));

    // Add the (incomplete) relation to the list
    docDataList.push({
      id: relationDocument.id,
      otherUser: otherUser,
      ...relationDocumentData,
    } as IChatViewListItem);
  });

  // Tack on the data for the last message of each relation
  Promise.all(lastMessagePromises).then(lastMessages => {
    for (let i = 0; i < docDataList.length; i++) {
      docDataList[i].lastMessage = lastMessages[i].docs[0].data();
    }
    // It appears that although we are properly setting the list here with newly hydrated
    // objects, JS thinks the list is unchanged. So we must also set loading state:
    setChats((_oldList: any) => {
      return docDataList;
    });
    setIsLoaded(true);
  });

  // Don't use this yet because it will screw up the loop in the Promise.all() call.
  // docDataList.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds)

  setChats(docDataList);
}


/**
 * Gets the messages for a relation and calls the setMessages function with the messages.
 * Supports the useChatMessages hook.
 *
 * @param {(messages: any) => any} setMessages The React setState function to set the messages
 * @param {User} authUser
 * @param {ILendrUser} user
 * @param {IRelation} relation
 */
export function getLiveMessages(setMessages: ((messages: any) => any),
                                authUser: User,
                                user: ILendrUser,
                                relation: IRelation): void {

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
  const unsub = onSnapshot(messagesQuery, (snapshot: QuerySnapshot<DocumentData>) => {
    let messages: IChatMessage[] = [];
    snapshot.forEach(messageSnap => {
      messages.push({
        id: messageSnap.id,
        ...messageSnap.data(),
      } as IChatMessage);
    });
    setMessages(messages.reverse());
  });
}