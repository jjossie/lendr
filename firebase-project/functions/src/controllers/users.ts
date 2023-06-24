import {getFirestore} from "firebase-admin/firestore";
import {ILendrUser} from "../models/ILendrUser";

export async function getUserFromUid(uid: string): Promise<ILendrUser | undefined> {
  const db = getFirestore();
  const docSnap = await db.doc("users/" + uid).get();
  return {
    uid: docSnap.id,
    ...docSnap.data(),
  } as ILendrUser;

}