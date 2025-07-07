import {useEffect, useState} from 'react';
import {getAuth, onAuthStateChanged, signOut} from '@react-native-firebase/auth';
import {AuthError} from "../errors";
import {getUserFromAuth} from "../../controllers/auth";
import {LendrUser} from "../../models/lendrUser";
import { AuthUser } from '../firebase.utils';

const auth = getAuth();

/**
 * Custom hook that returns the current authenticated user and their corresponding LendrUser profile.
 * Initially, both values may be undefined while authentication state is being determined.
 * Components using this hook should handle the possibility of undefined values without early exits.
 * 
 * @returns {{
 *   authUser: AuthUser | undefined,
 *   user: LendrUser | undefined,
 *   initializing: boolean
 * }}
 */
export function useAuthentication() {
  
  const [user, setUser] = useState<LendrUser | undefined>(undefined);
  const [authUser, setAuthUser] = useState<AuthUser>();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribeFromAuthStatusChanged = onAuthStateChanged(auth, (foundUser) => {
      if (foundUser) {
        // User is signed in
        setAuthUser(foundUser);

        // Get the Lendr foundUser from Firestore
        getUserFromAuth(foundUser)
            .then(u => setUser(u as LendrUser))
            .catch(e => console.warn(e.message));

        if (initializing) setInitializing(false);

      } else {
        // User is signed out
        signOut(auth)
            .then(() => setAuthUser(undefined))
            .catch(() => {throw new AuthError("Somehow we failed to sign out 🤨")});
      }
    });
    return () => {unsubscribeFromAuthStatusChanged();};
  }, []);


  return {
    authUser,
    user,
    initializing
  };
}