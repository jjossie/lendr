import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, FirebaseAuthTypes} from "@react-native-firebase/auth";
import {arrayRemove, arrayUnion, doc, getDoc, setDoc, Timestamp, updateDoc} from "@react-native-firebase/firestore";
import {db} from "../config/firebase";
import {LendrUser} from "../models/lendrUser"; // This is the TypeScript interface
import { LendrUserPreview, LendrUserPreviewSchema, LendrUserSchema, LendrUserValidated } from "../models/lendrUser.zod"; // Zod schema for validation
import { NotFoundError, ObjectValidationError } from "../utils/errors"; // For error handling
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

  try {
    if (token)
      await updateDoc(lendrUserDocRef, {expoPushTokens: arrayRemove(token)});
  } catch (e) {
    console.log("🧍Could not update lendrUser to remove expoPushToken");
  }

  signOut(auth).then(() => {
    console.log("Signed Out 🫡");
  });
}

/**
 * Right now this gets called every time we log in USING EMAIL AND PASSWORD. This doesn't get
 * called when we use Google Sign In.
 * @param {User} authUser
 * @param {string} firstName
 * @param {string} lastName
 * @returns {Promise<DocumentSnapshot<DocumentData> | void>}
 */
async function createUserInDB(authUser: FirebaseAuthTypes.User, firstName?: string, lastName?: string) {

  // Use the Firebase Auth UID as the document ID in Firestore
  const userDocRef = doc(db, "users", authUser.uid);
  const token = await registerForPushNotificationsAsync();
  let userDocSnap = await getDoc(userDocRef);

  const displayName = authUser.displayName ?? `${firstName} ${lastName}`;

  // Update the Firebase Auth Profile
  // await updateProfile(authUser, {
  //   displayName,
  // });

  // Create the user if it doesn't exist; otherwise, just update the Expo push tokens // TODO simplify that logic
  if (!userDocSnap.exists()) {
    console.log(`Creating user ${authUser.email} with uid ${authUser.uid} in firestore`);
    let lendrUser: LendrUser = {
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
      await updateDoc(userDocRef, {expoPushTokens: arrayUnion(token)});
    return userDocSnap;
  }
}

export async function getUserFromAuth(authUser: FirebaseAuthTypes.User): Promise<LendrUser | undefined> {
  const userDocRef = doc(db, "users", authUser.uid);
  const docSnap = await getDoc(userDocRef);

  if (!docSnap.exists()) {
    console.warn(`User document not found for uid: ${authUser.uid}`);
    return undefined; 
  }

  const rawData = docSnap.data();
  const validationResult = LendrUserSchema.safeParse(rawData);

  if (!validationResult.success) {
    console.error("Validation failed for user data (getUserFromAuth):", authUser.uid, validationResult.error.flatten());
    throw new ObjectValidationError(`User data validation failed for uid ${authUser.uid}`, validationResult.error);
  }
  // LendrUserSchema includes uid, so direct return of data is fine.
  return validationResult.data;
}

export async function getUserFromUid(uid: string): Promise<LendrUserValidated | undefined> { // TODO can we remove undefined from the signature?
  const userDocRef = doc(db, "users", uid);
  const docSnap = await getDoc(userDocRef);

  if (!docSnap.exists()) {
    console.warn(`User document not found for uid: ${uid}`);
    // Depending on desired behavior, could throw NotFoundError or return undefined.
    // Returning undefined is consistent with current signature.
    throw new NotFoundError(`User with uid ${uid} not found in Firestore.`);
  }

  const rawData = docSnap.data();
  // Note: The LendrUserSchema expects fields like firstName, lastName, displayName to be non-empty.
  // If data in Firestore can violate this, this parse step will fail.
  const validationResult = LendrUserSchema.safeParse(rawData);

  if (!validationResult.success) {
    console.error("Validation failed for user data (getUserFromUid):", uid, validationResult.error.flatten());
    throw new ObjectValidationError(`User data validation failed for uid ${uid}`, validationResult.error);
  }
  // LendrUserSchema includes uid, so direct return of data is fine.
  return validationResult.data;
}

export async function getUserPreviewFromUid(uid: string): Promise<LendrUserPreview | undefined> {
  const user = await getUserFromUid(uid);
  const validationResult = LendrUserPreviewSchema.safeParse(user);
  if (!validationResult.success) {
    console.error("Validation failed for user data (getUserPreviewFromUid):", uid, validationResult.error.flatten());
    throw new ObjectValidationError(`User data validation failed for uid ${uid}`, validationResult.error);
  } 
  return validationResult.data;
}
