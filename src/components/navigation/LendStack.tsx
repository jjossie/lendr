import React from 'react';
import LenderInventory from "../screens/LenderInventory";
import ToolDetail from "../screens/ToolDetail";
import EditTool from "../screens/EditTool";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {useTheme} from "native-base";


const Stack = createNativeStackNavigator();


const LendStack: React.FC<BottomTabScreenProps<any>> = () => {
  const {colors} = useTheme();
  return (
        <Stack.Navigator initialRouteName="LenderInventory" screenOptions={{
          headerTitle: "",
          headerStyle: {
            backgroundColor: colors.light[100],
          },
          headerShadowVisible: false,
        }}>
          <Stack.Screen name="LenderInventory" component={LenderInventory} options={{title: "Inventory"}}/>
          <Stack.Screen name="ToolDetail" component={ToolDetail}/>
          <Stack.Screen name="EditTool" component={EditTool}/>
        </Stack.Navigator>
  );
};

export default LendStack;