import React from 'react';
import {getAuth, onAuthStateChanged, signOut, User} from 'firebase/auth';
import {AuthError} from "../errors";

const auth = getAuth();

/**
 * Custom hook that will return a React State variable that represents the currently logged-in user.
 * It's important to note that this will typically return undefined at first, then will run again
 * and return the properly initialized User object. Components (and, therefore, hooks) should be
 * able to handle this user object potentially being undefined. You can't just guard and early exit
 * a hook that depends on the user because it may break React's rules of t
 * @returns {{user: User | undefined}}
 */
export function useAuthentication() {
  const [user, setUser] = React.useState<User>();

  React.useEffect(() => {
    const unsubscribeFromAuthStatusChanged = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        setUser(user);
      } else {
        // User is signed out
        signOut(auth)
            .then(() => setUser(undefined))
            .catch(() => {throw new AuthError("Somehow we failed to sign out 🤨")});
      }
    });

    return unsubscribeFromAuthStatusChanged;
  }, [setUser]);

  return {
    user
  };
}