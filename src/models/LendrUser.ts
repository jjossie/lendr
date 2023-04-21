import {Timestamp} from "firebase/firestore";


export interface LendrUser {
  createdAt: Timestamp | string,
  firstName: string,
  lastName: string
}