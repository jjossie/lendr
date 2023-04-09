import {CustomNativeBaseProvider} from "./src/components/CustomNativeBaseProvider";
import {LogBox} from "react-native";


import {useEffect, useState} from "react";
import MainStack from "./src/components/navigation/MainStack";
import AuthStack from "./src/components/navigation/AuthStack";
import {useAuthentication} from "./src/utils/hooks/useAuthentication";


// For now will disable on-screen warning with:
LogBox.ignoreLogs([
  "We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320",
]);

export default function App() {
  // "Initializing" state var might be necessary later, but doesn't seem essential rn
  const [initializing, setInitializing] = useState(false);

  const {user} = useAuthentication();

  useEffect(() => {

  }, [])

  if (initializing) return null;
  if (user) console.log(user.email);

  return (
    <CustomNativeBaseProvider>
      {user
        ? <MainStack/>
        : <AuthStack/>
      }
    </CustomNativeBaseProvider>
  );
}
