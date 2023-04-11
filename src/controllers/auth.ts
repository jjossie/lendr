import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut} from "firebase/auth";


export function registerUser(email: string, password: string) {
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User account created & signed in 💯');
        console.log(userCredential);
        const user = userCredential.user;
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