import {Timestamp} from "firebase-admin/firestore";


export interface LendrUser {
  createdAt: Timestamp | string,
  firstName: string,
  lastName: string,
  displayName?: string,
  relations: string[],
  expoPushTokens: string[]
  uid: string,
  providerData?: any,
  photoURL?: string,
  email?: string,
}

export interface LendrUserPreview {
  uid: string,
  displayName: string,
  firstName?: string,
  lastName?: string,
  photoURL?: string,
}