import React from 'react';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import ToolDetail from "../screens/ToolDetail";
import BorrowerInventory from "../screens/BorrowerInventory";
import {useTheme} from "native-base";

const Stack = createNativeStackNavigator();

const BorrowStack: React.FC<BottomTabScreenProps<any>> = ({navigation, route}) => {
  const {colors} = useTheme();
  return (
      <Stack.Navigator screenOptions={{
        headerTitle: "",
        headerStyle: {
          backgroundColor: colors.light[100],
        },
        headerShadowVisible: false,
      }}>
        <Stack.Screen name="BorrowerInventory" component={BorrowerInventory}/>
        <Stack.Screen name="ToolDetail" component={ToolDetail}/>
      </Stack.Navigator>
  );
};

export default BorrowStack;