import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LendStack from "./LendStack";
import Account from "../screens/Account";
import ChatStack from "./ChatStack";
import SearchStack from "./SearchStack";
import BorrowStack from './BorrowStack';

const Tab = createBottomTabNavigator();

interface Props {}

const MainTabNavigator: React.FC<Props> = () => {
  return (
      <Tab.Navigator backBehavior={"history"} screenOptions={{
        headerBackgroundContainerStyle: {
          borderBottomWidth: 0,
          opacity: 0
        },
        // headerTransparent: true,
        // headerShadowVisible: true,
      }}>
        <Tab.Screen name="Search" component={SearchStack} options={{ headerShown: false }}/>
        <Tab.Screen name="Borrow" component={BorrowStack} options={{ headerShown: false }}/>
        <Tab.Screen name="Lend" component={LendStack} options={{ headerShown: false }}/>
        <Tab.Screen name="Chat" component={ChatStack} options={{ headerShown: false }}/>
        <Tab.Screen name="Account" component={Account}/>
      </Tab.Navigator>
  );
};

export default MainTabNavigator;