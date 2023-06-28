import {Timestamp} from "firebase-admin/firestore";


export interface ILendrUser {
  createdAt: Timestamp | string,
  firstName: string,
  lastName: string,
  relations: string[],
  expoPushTokens: string[]
  uid: string,
  providerData?: any
}


// export function getRefFromUid(uid?: string): DocumentReference {
//   if (!uid)
//     throw new ObjectValidationError("getRefFromUid was given an empty value");
//   const db = getFirestore();
//   return db.doc(`/users/${uid}`);
// }
//
// export function getUidFromRef(ref: DocumentReference): string {
//   return ref.id;
// }