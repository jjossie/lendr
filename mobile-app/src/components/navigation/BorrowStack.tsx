import React from 'react';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import BorrowBrowse from "../screens/BorrowBrowse";
import ToolDetail from "../screens/ToolDetail";

const Stack = createNativeStackNavigator();

const BorrowStack: React.FC<BottomTabScreenProps<any>> = ({navigation, route}) => {
  return (
      <Stack.Navigator>
        <Stack.Screen name="Browse" component={BorrowBrowse} />
        <Stack.Screen name="ToolDetail" component={ToolDetail} />
      </Stack.Navigator>
  );
};

export default BorrowStack;