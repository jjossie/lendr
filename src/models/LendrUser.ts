import {doc, DocumentReference, Timestamp} from "firebase/firestore";
import {db} from "../config/firebase";
import {ObjectValidationError} from "../utils/errors";


export interface LendrUser {
  createdAt: Timestamp | string,
  firstName: string,
  lastName: string
}


export function getRefFromUid(uid?: string): DocumentReference {
  if (!uid)
    throw new ObjectValidationError("getRefFromUid was given an empty value");
  return doc(db, `/users/${uid}`);
}
