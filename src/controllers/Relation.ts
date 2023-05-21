import {addDoc, arrayUnion, collection, doc, serverTimestamp, setDoc, Timestamp, updateDoc} from "firebase/firestore";
import {app, db} from "../config/firebase";
import {getAuth} from "firebase/auth";
import {AuthError, LendrBaseError} from "../utils/errors";
import {IChatMessage, ILoan, IRelation} from "../models/Relation";
import {getUserFromAuth, getUserFromUid} from "./auth";


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
