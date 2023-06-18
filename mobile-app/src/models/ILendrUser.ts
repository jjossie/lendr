import {doc, DocumentReference, Timestamp} from "firebase/firestore";
import {db} from "../config/firebase";
import {ObjectValidationError} from "../utils/errors";


export interface ILendrUser {
  createdAt: Timestamp | string,
  firstName: string,
  lastName: string,
  relations: string[],
  uid: string,
  providerData?: any
}


export function getRefFromUid(uid?: string): DocumentReference {
  if (!uid)
    throw new ObjectValidationError("getRefFromUid was given an empty value");
  return doc(db, `/users/${uid}`);
}

export function getUidFromRef(ref: DocumentReference): string {
  return ref.id;
}