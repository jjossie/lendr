import {doc, DocumentReference, Timestamp} from "firebase/firestore";
import {db} from "../config/firebase";
import {ObjectValidationError} from "../utils/errors";


export interface LendrUser {
  createdAt: Timestamp | string,
  firstName?: string,
  lastName?: string,
  displayName: string;
  relations: string[],
  expoPushTokens: string[]
  uid: string,
  providerData?: any,
  photoURL?: string,
}

export interface LendrUserPreview {
  uid: string,
  displayName: string,
  firstName?: string,
  lastName?: string,
  photoURL?: string,
  // providerData?: any
}


export function getRefFromUid(uid?: string): DocumentReference {
  if (!uid)
    throw new ObjectValidationError("getRefFromUid was given an empty value");
  return doc(db, `/users/${uid}`);
}

export function getUidFromRef(ref: DocumentReference): string {
  return ref.id;
}