import React from 'react';
import Details from "../screens/Details";
import Demo from "../screens/Demo";
import LenderInventory from "../screens/LenderInventory";
import ToolDetail from "../screens/ToolDetail";
import EditTool from "../screens/EditTool";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

export interface MainStackProps {

}

const Stack = createNativeStackNavigator();


const MainStack: React.FC<MainStackProps> = (props: MainStackProps) => {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LenderInventory">
          <Stack.Screen name="Detail" component={Details}/>
          <Stack.Screen name="Home" component={Demo}/>
          <Stack.Screen name="LenderInventory" component={LenderInventory}/>
          <Stack.Screen name="ToolDetail" component={ToolDetail}/>
          <Stack.Screen name="EditTool" component={EditTool}/>
        </Stack.Navigator>
      </NavigationContainer>
  );
};

export default MainStack;