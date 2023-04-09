import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut} from "firebase/auth";


export function createUser(email: string, password: string) {
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User account created & signed in 💯');
        console.log(userCredential);
        const user = userCredential.user;
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use 🗿');
        }
        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid 💀');
        }
        console.error(error);
      });
}


export function signInUser(email: string, password: string) {
  const auth = getAuth();
  signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log('User signed in ✅');
        // ...
      })
      .catch((error) => {
        console.log('User sign-in failed 🅱️');
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(error);
      });
}

export function signOutUser() {
  const auth = getAuth();
  signOut(auth).then(() => {
    console.log("Signed Out 🫡");
  });
}