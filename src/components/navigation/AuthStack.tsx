import React from 'react';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import Login from "../screens/Login";
import Register from "../screens/Register";

export interface AuthStackProps {

}

const Stack = createNativeStackNavigator();


const AuthStack: React.FC<AuthStackProps> = (props: AuthStackProps) => {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LenderInventory">
          <Stack.Screen name="Login" component={Login}/>
          <Stack.Screen name="Register" component={Register}/>
        </Stack.Navigator>
      </NavigationContainer>
  );
};

export default AuthStack;