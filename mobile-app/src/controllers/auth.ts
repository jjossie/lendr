import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import {arrayRemove, arrayUnion, doc, getDoc, setDoc, Timestamp, updateDoc} from "firebase/firestore";
import {db} from "../config/firebase";
import {ILendrUser} from "../models/ILendrUser";
import {registerForPushNotificationsAsync} from "../config/device/notifications";


export function registerUser(firstName: string, lastName: string, email: string, password: string) {
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password.trim())
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
  signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password.trim())
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

export async function signOutUser() {
  const auth = getAuth();
  if (!auth.currentUser)
    return; // No need to sign out

  // Remove the expoPushToken from the user's document in Firestore
  // to prevent them from getting notifications while signed out
  const lendrUserDocRef = doc(db, "users", auth.currentUser.uid);
  const token = await registerForPushNotificationsAsync();
  if (token)
    await updateDoc(lendrUserDocRef, {expoPushTokens: arrayRemove(token)});

  signOut(auth).then(() => {
    console.log("Signed Out 🫡");
  });
}

/**
 * Right now this gets called every time we log in.
 * @param {User} authUser
 * @param {string} firstName
 * @param {string} lastName
 * @returns {Promise<DocumentSnapshot<DocumentData> | void>}
 */
async function createUserInDB(authUser: User, firstName: string = "Joe", lastName: string = "Momma") {

  // Use the Firebase Auth UID as the document ID in Firestore
  const userDocRef = doc(db, "users", authUser.uid);
  const token = await registerForPushNotificationsAsync();
  let userDocSnap = await getDoc(userDocRef);

  // Update the Firebase Auth Profile
  const displayName = `${firstName} ${lastName}`;
  await updateProfile(authUser, {
    displayName,
  });

  // Create the user if it doesn't exist; otherwise, just update the Expo push tokens // TODO simplify that logic
  if (!userDocSnap.exists()) {
    console.log(`Creating user ${authUser.email} with uid ${authUser.uid} in firestore`);
    let lendrUser: ILendrUser = {
      relations: [],
      uid: authUser.uid,
      providerData: {
        ...authUser.providerData[0],
      },
      firstName, // TODO authProfileRefactoring
      lastName,
      displayName: displayName,
      expoPushTokens: [],
      createdAt: Timestamp.now(),
      photoURL: authUser?.photoURL ?? undefined,
    };
    if (token)
      lendrUser.expoPushTokens.push(token);

    // Add the user to the users collection (this will automatically create the user document in Firestore with the ID
    // from the UID above)
    return setDoc(userDocRef, lendrUser);
  } else {

    // Add the token to the user's list of tokens (arrayUnion will do a set-style union, ignoring duplicates)
    console.log(`Found user ${authUser.email} with uid: ${authUser.uid}`);
    if (token)
      await updateDoc(userDocRef, {expoPushTokens: arrayUnion(token), photoURL: authUser?.photoURL ?? undefined});
    return userDocSnap;
  }
}

export async function getUserFromAuth(authUser: User): Promise<ILendrUser | undefined> {
  const docSnap = await getDoc(doc(db, "users", authUser.uid));
  return {
    uid: docSnap.id,
    ...docSnap.data(),
  } as ILendrUser;
}

export async function getUserFromUid(uid: string): Promise<ILendrUser | undefined> {
  const docSnap = await getDoc(doc(db, "users", uid));
  return {
    uid: docSnap.id,
    ...docSnap.data(),
  } as ILendrUser;
}
