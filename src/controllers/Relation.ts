import {addDoc, arrayUnion, collection, doc, serverTimestamp, setDoc, Timestamp, updateDoc} from "firebase/firestore";
import {app, db} from "../config/firebase";
import {getAuth} from "firebase/auth";
import {AuthError} from "../utils/errors";
import {IChatMessage, IRelation} from "../models/Relation";


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

export async function createRelation(otherUserId: string, toolId: string) {

  const auth = getAuth(app);
  if (!auth.currentUser)
    throw new AuthError();

  const relationsCollection = collection(db, "relations");
  const docRef = doc(relationsCollection, getRelationId(auth.currentUser.uid, otherUserId));



  await setDoc(docRef, {
    createdAt: serverTimestamp(),
  } as IRelation);

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
