import React from 'react';
import LenderInventory from "../screens/LenderInventory";
import ToolDetail from "../screens/ToolDetail";
import EditTool from "../screens/EditTool";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";


const Stack = createNativeStackNavigator();


const LendStack: React.FC<BottomTabScreenProps<any>> = () => {
  return (
        <Stack.Navigator initialRouteName="LenderInventory">
          <Stack.Screen name="LenderInventory" component={LenderInventory}/>
          <Stack.Screen name="ToolDetail" component={ToolDetail}/>
          <Stack.Screen name="EditTool" component={EditTool}/>
        </Stack.Navigator>
  );
};

export default LendStack;