import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LendStack from "./LendStack";

const Tab = createBottomTabNavigator();

interface Props {}

const MainTabNavigator: React.FC<Props> = () => {
  return (
      <Tab.Navigator>
        <Tab.Screen name="Lend" component={LendStack}/>
      </Tab.Navigator>
  );
};

export default MainTabNavigator;