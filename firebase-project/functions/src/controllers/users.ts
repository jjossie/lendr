import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";
import {LendrUser} from "../models/LendrUser";
import {auth} from "firebase-admin";
import UserRecord = auth.UserRecord;

export async function getUserFromUid(uid: string): Promise<LendrUser | undefined> {
  const db = getFirestore();
  const docSnap = await db.doc("users/" + uid).get();
  if (!docSnap.exists) return undefined;
  return {
    uid: docSnap.id,
    ...docSnap.data(),
  } as LendrUser;
}

export async function createUser(userRecord: UserRecord) {
  const db = getFirestore();

  const userRef = db.doc("users/" + userRecord.uid);
  const lendrUser: LendrUser = {
    createdAt: FieldValue.serverTimestamp() as Timestamp,
    firstName: userRecord.displayName.split(" ")[0],
    lastName: userRecord.displayName.split(" ")[1],
    uid: userRecord.uid,
    email: userRecord.email,
    photoURL: userRecord.photoURL,
    displayName: userRecord.displayName,
    relations: [],
    expoPushTokens: [],
    providerData: userRecord.providerData
  };
  // TODO: merge: true or false could have implications for users that delete and recreate their accounts
  await userRef.set(lendrUser);
}

export async function addRelationToUser(uid: string, relationId: string) {
  const db = getFirestore();
  const userRef = db.doc("users/" + uid);
  await userRef.update({relations: FieldValue.arrayUnion(relationId)});
}

export async function deleteUser(uid: string) {
  const db = getFirestore();
  const userRef = db.doc("users/" + uid);
  await userRef.delete();
}