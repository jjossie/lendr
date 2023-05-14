import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LendStack from "./LendStack";
import Account from "../screens/Account";
import BorrowStack from "./BorrowStack";
import AlgoliaSearch from "../screens/AlgoliaSearch";

const Tab = createBottomTabNavigator();

interface Props {}

const MainTabNavigator: React.FC<Props> = () => {
  return (
      <Tab.Navigator>
        <Tab.Screen name="Search" component={AlgoliaSearch} options={{ headerShown: false }}/>
        <Tab.Screen name="Borrow" component={BorrowStack} options={{ headerShown: false }}/>
        <Tab.Screen name="Lend" component={LendStack} options={{ headerShown: false }}/>
        <Tab.Screen name="Account" component={Account}/>
      </Tab.Navigator>
  );
};

export default MainTabNavigator;