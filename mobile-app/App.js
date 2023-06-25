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
  "AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from '@react-native-async-storage/async-storage' instead of 'react-native'. See https://github.com/react-native-async-storage/async-storage",
  `You specified \`onScroll\` on a <ScrollView> but not \`scrollEventThrottle\`. You will only receive one event. Using \`16\` you get all the events but be aware that it may cause frame drops, use a bigger number if you don't need as much precision.`,
  "Key \"cancelled\" in the image picker result is deprecated and will be removed in SDK 48, use \"canceled\" instead",
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
