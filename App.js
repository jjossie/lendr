import {app} from "./src/config/firebase";

import {CustomNativeBaseProvider} from "./src/components/CustomNativeBaseProvider";
import {LogBox} from "react-native";


import {useEffect, useState} from "react";
import AuthStack from "./src/components/navigation/AuthStack";
import {useAuthentication} from "./src/utils/hooks/useAuthentication";
import {NavigationContainer} from "@react-navigation/native";
import MainTabNavigator from "./src/components/navigation/MainTabNavigator";

import "./src/config/algolia";

// For now will disable on-screen warning with:
LogBox.ignoreLogs([
  "We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320",
  "AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from '@react-native-async-storage/async-storage' instead of 'react-native'. See https://github.com/react-native-async-storage/async-storage"
]);

export default function App() {
  // "Initializing" state var might be necessary later, but doesn't seem essential rn
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (!app) {
      setInitializing(true);
    }
  }, [])

  const {authUser} = useAuthentication();

  if (initializing) return null;
  if (authUser) console.log(authUser.email);

  return (
    <CustomNativeBaseProvider>
      <NavigationContainer>
        {authUser
          ? <MainTabNavigator/>
          : <AuthStack/>
        }
      </NavigationContainer>
    </CustomNativeBaseProvider>
  );
}
