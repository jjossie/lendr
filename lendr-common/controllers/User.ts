import {User} from "firebase/auth";
import {ILendrUser} from "lendr/src/models/ILendrUser";
import {doc, getDoc} from "firebase/firestore";
import {db} from "lendr-common/config/firebase";
import {FirestoreNotInitializedError} from "../utils/errors";

export async function getUserFromAuth(authUser: User): Promise<ILendrUser | undefined> {
  if (!db) throw new FirestoreNotInitializedError();
  // @ts-ignore
  const docSnap = await getDoc(doc(db, "users", authUser.uid));
  return {
    uid: docSnap.id,
    ...docSnap.data(),
  } as ILendrUser;
}

export async function getUserFromUid(uid: string): Promise<ILendrUser | undefined> {
  if (!db) throw new FirestoreNotInitializedError();
  // @ts-ignore
  const docSnap = await getDoc(doc(db, "users", uid));
  return {
    uid: docSnap.id,
    ...docSnap.data(),
  } as ILendrUser;
}