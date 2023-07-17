import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";
import {ILendrUser} from "../models/ILendrUser";
import {auth} from "firebase-admin";
import UserRecord = auth.UserRecord;

export async function getUserFromUid(uid: string): Promise<ILendrUser | undefined> {
  const db = getFirestore();
  const docSnap = await db.doc("users/" + uid).get();
  return {
    uid: docSnap.id,
    ...docSnap.data(),
  } as ILendrUser;

}

export async function createUser(userRecord: UserRecord) {
  const db = getFirestore();

  const userRef = db.doc("users/" + userRecord.uid);
  const lendrUser: ILendrUser = {
    createdAt: FieldValue.serverTimestamp() as Timestamp,
    firstName: userRecord.displayName.split(" ")[0],
    lastName: userRecord.displayName.split(" ")[1],
    uid: userRecord.uid,
    email: userRecord.email,
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