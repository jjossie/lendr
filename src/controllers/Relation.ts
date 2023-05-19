import {collection, doc, serverTimestamp, setDoc} from "firebase/firestore";
import {app, db} from "../config/firebase";
import {getAuth} from "firebase/auth";
import {AuthError} from "../utils/errors";
import {IRelation} from "../models/Relation";


function getRelationId(currentUserId: string, otherUserId: string) {
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
  return await setDoc(docRef, {
    createdAt: serverTimestamp()
  } as IRelation);
}

