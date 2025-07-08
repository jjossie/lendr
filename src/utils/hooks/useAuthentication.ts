import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { getUserFromAuth } from "../../controllers/auth";
import { LendrUser } from "../../models/lendrUser";
import { AuthUser } from "../firebase.utils";

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
    const unsubscribeFromAuthStatusChanged = onAuthStateChanged(
      getAuth(),
      (foundUser) => {
        // EXPERIMENTAL
        setInitializing(true);

        if (foundUser) {
          // User is signed in
          console.log("👤[useAuthentication] User signed in:", foundUser);
          setAuthUser(foundUser);

          // Get the Lendr foundUser from Firestore
          getUserFromAuth(foundUser)
            .then((u) => {
              setUser(u as LendrUser);
            })
            .catch((e) =>
              console.warn(
                "👤[useAuthentication] Error loading LendrUser:",
                e.message
              )
            );
          if (initializing) {
            setInitializing(false);
          }
        } else {
          // User is signed out
          console.log("👤[useAuthentication] User signed out");
          setAuthUser(undefined);
          setInitializing(false);
        }
      }
    );
    return () => {
      unsubscribeFromAuthStatusChanged();
    };
  }, []);

  return {
    authUser,
    user,
    initializing,
  };
}
