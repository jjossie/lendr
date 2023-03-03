import {StatusBar} from 'expo-status-bar';
import {Button, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useState} from "react";
import Product from "./src/components/Product";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Demo from "./src/components/screens/Demo";
import Details from "./src/components/screens/Details";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Detail">
        <Stack.Screen name="Detail" component={Details}/>
        <Stack.Screen name="Home" component={Demo}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
