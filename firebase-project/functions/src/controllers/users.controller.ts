import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";
import {LendrUser, LendrUserPreview} from "../models/lendrUser.model";
import {auth} from "firebase-admin";
import UserRecord = auth.UserRecord;
import { LendrBaseError, NotFoundError } from "../utils/errors";
import { logger } from "firebase-functions/v1";

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

export async function getHydratedUserPreview(uid:string): Promise<LendrUserPreview> {
  if (!uid) throw new LendrBaseError('uid not provided');
  const lender = await getUserFromUid(uid);
  if (!lender){
    // logger.error("Lender does not exist: ", uid);
    // Delete the document if the lender does not exist
    // await event.data.ref.delete();
    // return;
    throw new NotFoundError();
  }
  const displayName = `${lender.firstName} ${lender.lastName}`;
  const hydroLender: LendrUserPreview = {
    uid: uid,
    displayName: displayName,
    photoURL: lender.photoURL,
  };
  // logger.info("Found Lender: ", displayName);
  return hydroLender;
}