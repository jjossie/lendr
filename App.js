import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Demo from "./src/components/screens/Demo";
import Details from "./src/components/screens/Details";
import ToolDetail from "./src/components/screens/ToolDetail";
import {CustomNativeBaseProvider} from "./src/components/CustomNativeBaseProvider";
import EditTool from "./src/components/screens/EditTool";


const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <CustomNativeBaseProvider>
      <NavigationContainer onLayout>
        <Stack.Navigator initialRouteName="EditTool">
          <Stack.Screen name="Detail" component={Details}/>
          <Stack.Screen name="Home" component={Demo}/>
          <Stack.Screen name="ToolDetail" component={ToolDetail}/>
          <Stack.Screen name="EditTool" component={EditTool}/>
        </Stack.Navigator>
      </NavigationContainer>
    </CustomNativeBaseProvider>
  );
}
