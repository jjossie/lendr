import React from 'react';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Login from "../screens/Login";
import Register from "../screens/Register";

export interface AuthStackProps {

}

const Stack = createNativeStackNavigator();


const AuthStack: React.FC<AuthStackProps> = (_props: AuthStackProps) => {
  return (
        <Stack.Navigator initialRouteName="LenderInventory">
          <Stack.Screen name="Login" component={Login}/>
          <Stack.Screen name="Register" component={Register}/>
        </Stack.Navigator>
  );
};

export default AuthStack;