import {Timestamp} from "firebase-admin/firestore";


export interface ILendrUser {
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

export interface ILendrUserPreview {
  uid: string,
  displayName: string,
  firstName?: string,
  lastName?: string,
  photoURL?: string,
}