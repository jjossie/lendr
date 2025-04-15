import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";
import {LendrUserInput, LendrUserPreview, lendrUserInputSchema, LendrUserInputValidated, lendrUserModelSchema, LendrUserModelValidated} from "../models/lendrUser.model";
import { LendrBaseError, NotFoundError, ObjectValidationError } from "../utils/errors";
import { AuthUserRecord } from "firebase-functions/identity";

export async function getUserFromUid(uid: string): Promise<LendrUserModelValidated | undefined> {
  const db = getFirestore();
  const docSnap = await db.doc("users/" + uid).get();
  if (!docSnap.exists) return undefined;
  return lendrUserModelSchema.parse({
    uid: docSnap.id,
    ...docSnap.data(),
  });
}

export async function createUser(userRecord: AuthUserRecord) {
  const db = getFirestore();

  if (!userRecord.displayName) {
    throw new ObjectValidationError("User does not have a display name");
  }

  const userRef = db.doc("users/" + userRecord.uid);
  const validatedLendrUserInput = lendrUserInputSchema.parse({
    createdAt: FieldValue.serverTimestamp(),
    firstName: userRecord.displayName.split(" ")[0],
    lastName: userRecord.displayName.split(" ")[1],
    uid: userRecord.uid,
    email: userRecord.email,
    photoURL: userRecord.photoURL,
    displayName: userRecord.displayName,
    relations: [],
    expoPushTokens: [],
    providerData: userRecord.providerData
  });
  // TODO: merge: true or false could have implications for users that delete and recreate their accounts
  await userRef.set(validatedLendrUserInput);
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