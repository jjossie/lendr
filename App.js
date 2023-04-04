import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Demo from "./src/components/screens/Demo";
import Details from "./src/components/screens/Details";
import ToolDetail from "./src/components/screens/ToolDetail";
import {CustomNativeBaseProvider} from "./src/components/CustomNativeBaseProvider";
import EditTool from "./src/components/screens/EditTool";
import {LogBox} from "react-native";
import LenderInventory from "./src/components/screens/LenderInventory";
import Login from "./src/components/screens/Login";


// import {auth} from "./src/models/firebase"
import {useEffect, useState} from "react";

const Stack = createNativeStackNavigator();


// For now will disable on-screen warning with:
LogBox.ignoreLogs([
  "We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320",
]);

export default function App() {

  // const [user] = useAuthState(auth);

  const [initializing, setInitializing] = useState(false);
  const [user, setUser] = useState(null);

  // const handleAuthStateChange = (user) => {
  //   setUser(user);
  //   setInitializing(false);
  // }

  useEffect(() => {

  }, [])

  if (initializing) return null;
  if (user) console.log(user.email);

  return (
    <CustomNativeBaseProvider>
      {user
        ? <NavigationContainer onLayout>
          <Stack.Navigator initialRouteName="LenderInventory">
            <Stack.Screen name="Detail" component={Details}/>
            <Stack.Screen name="Home" component={Demo}/>
            <Stack.Screen name="LenderInventory" component={LenderInventory}/>
            <Stack.Screen name="ToolDetail" component={ToolDetail}/>
            <Stack.Screen name="EditTool" component={EditTool}/>
          </Stack.Navigator>
        </NavigationContainer>
        : <Login/>
      }
    </CustomNativeBaseProvider>
  );
}
