import {useEffect, useState} from 'react';
import {getAuth, onAuthStateChanged, signOut, User} from 'firebase/auth';
import {AuthError} from "../errors";
import {getUserFromAuth} from "../../controllers/auth";
import {ILendrUser} from "../../models/ILendrUser";

const auth = getAuth();

/**
 * Custom hook that will return a React State variable that represents the currently logged-in user.
 * It's important to note that this will typically return undefined at first, then will run again
 * and return the properly initialized User object. Components (and, therefore, hooks) should be
 * able to handle this user object potentially being undefined. You can't just guard and early exit
 * a hook that depends on the user because it may break React's rules of hooks to do a different order.
 * @returns {{user: User | undefined}}
 */
export function useAuthentication() {
  const [user, setUser] = useState<ILendrUser | undefined>(undefined);
  const [authUser, setAuthUser] = useState<User>();

  useEffect(() => {
    const unsubscribeFromAuthStatusChanged = onAuthStateChanged(auth, (foundUser) => {
      if (foundUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        setAuthUser(foundUser);

        // Get the Lendr foundUser from Firestore
        getUserFromAuth(foundUser)
            .then(u => setUser(u as ILendrUser))
            .catch(e => console.log(e.message));

      } else {
        // User is signed out
        signOut(auth)
            .then(() => setAuthUser(undefined))
            .catch(() => {throw new AuthError("Somehow we failed to sign out 🤨")});
      }
    });

    return unsubscribeFromAuthStatusChanged;
  }, []);

  return {
    authUser,
    user
  };
}