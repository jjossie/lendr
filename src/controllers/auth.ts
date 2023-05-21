import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, User} from "firebase/auth";
import {doc, getDoc, setDoc, Timestamp} from "firebase/firestore";
import {db} from "../config/firebase";
import {ILendrUser} from "../models/ILendrUser";


export function registerUser(firstName: string, lastName: string, email: string, password: string,) {
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        console.log('User account created & signed in 💯');
        console.log(userCredential);
        await createUserInDB(userCredential.user, firstName, lastName);
      })
      .catch(error => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            console.log('That email address is already in use 🗿');
            break;
          case 'auth/invalid-email':
            console.log('That email address is invalid 💀');
            break;
          case 'auth/weak-password':
            console.log('Password too weak bruh 😱');
            break;
        }
        console.error(error);
      });
}


export function logInUser(email: string, password: string) {
  const auth = getAuth();
  signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        console.log('User signed in ✅');
        await createUserInDB(userCredential.user);
      })
      .catch((error) => {
        console.log('User sign-in failed 🅱️');
        console.error(error);
      });
}

export function signOutUser() {
  const auth = getAuth();
  signOut(auth).then(() => {
    console.log("Signed Out 🫡");
  });
}

async function createUserInDB(authUser: User, firstName: string = "Joe", lastName: string = "Momma") {

  // Use the Firebase Auth UID as the document ID in Firestore
  const userDocRef = doc(db, "users", authUser.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    console.log(`Creating user ${authUser.uid} in firestore`);
    return setDoc(userDocRef, {
      providerData: {
        ...authUser.providerData[0]
      },
      firstName,
      lastName,
      createdAt: Timestamp.now(),
    });
  } else {
    console.log(`User ${authUser.uid} already exists in firestore`);
    return userDocSnap;
  }
}

export async function getUserFromAuth(authUser: User): Promise<ILendrUser| undefined> {
  const docSnap = await getDoc(doc(db, "users", authUser.uid));
  return docSnap.data() as ILendrUser;
}

export async function getUserFromUid(uid: string): Promise<ILendrUser| undefined> {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.data() as ILendrUser;
}