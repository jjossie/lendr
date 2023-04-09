import {createUserWithEmailAndPassword, getAuth} from "firebase/auth";


export function createUser(email: string, password: string) {
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User account created & signed in!');
        console.log(userCredential);
        const user = userCredential.user;
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }
        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }
        console.error(error);
      });
}

