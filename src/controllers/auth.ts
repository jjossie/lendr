import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, User} from "firebase/auth";
import {doc, getDoc, setDoc, Timestamp} from "firebase/firestore";
import {db} from "../config/firebase";


export function registerUser(email: string, password: string) {
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        console.log('User account created & signed in 💯');
        console.log(userCredential);
        await createUserInDB(userCredential.user, "Joe", "Momma");
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
        await createUserInDB(userCredential.user, "Joe", "Momma");
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

async function createUserInDB(authUserObj: User,  firstName: string, lastName: string) {

  // Use the Firebase Auth UID as the document ID in Firestore
  const userDocRef = doc(db, "users", authUserObj.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()){
    console.log(`Creating user ${authUserObj.uid} in firestore`);
    return setDoc(userDocRef, {
      firstName,
      lastName,
      createdAt: Timestamp.now()
    });
  }
  else {
    console.log(`User ${authUserObj.uid} already exists in firestore`);
    return userDocSnap;
  }
}