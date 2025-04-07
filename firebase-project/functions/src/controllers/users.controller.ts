import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";
import {LendrUserInput, LendrUserPreview, lendrUserSchema, LendrUserValidated} from "../models/lendrUser.model";
import {auth} from "firebase-admin";
import UserRecord = auth.UserRecord;
import { LendrBaseError, NotFoundError, ObjectValidationError } from "../utils/errors";

export async function getUserFromUid(uid: string): Promise<LendrUserValidated | undefined> {
  const db = getFirestore();
  const docSnap = await db.doc("users/" + uid).get();
  if (!docSnap.exists) return undefined;
  return lendrUserSchema.parse({
    uid: docSnap.id,
    ...docSnap.data(),
  });
}

export async function createUser(userRecord: UserRecord) {
  const db = getFirestore();

  if (!userRecord.displayName) {
    throw new ObjectValidationError("User does not have a display name");
  }

  const userRef = db.doc("users/" + userRecord.uid);
  const lendrUser: LendrUserInput = {
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
  const validatedLendrUser = lendrUserSchema.parse(lendrUser);
  // TODO: merge: true or false could have implications for users that delete and recreate their accounts
  await userRef.set(validatedLendrUser);
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
    throw new NotFoundError();
  }
  const displayName = `${lender.firstName} ${lender.lastName}`;
  const hydroLender: LendrUserPreview = {
    uid: uid,
    displayName: displayName,
    photoURL: lender.photoURL,
  };
  return hydroLender;
}