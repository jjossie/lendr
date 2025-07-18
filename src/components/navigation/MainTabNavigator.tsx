import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LendStack from "./LendStack";
import Account from "../screens/Account";
import ChatStack from "./ChatStack";
import SearchStack from "./SearchStack";
import BorrowStack from './BorrowStack';
import {FontAwesome, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useTheme} from "native-base";

const Tab = createBottomTabNavigator();

interface Props {
}

const MainTabNavigator: React.FC<Props> = () => {

  const {colors} = useTheme();

  return (
      <Tab.Navigator backBehavior={"history"} screenOptions={{
        headerBackgroundContainerStyle: {
          borderBottomWidth: 0,
          opacity: 0,
        },
        tabBarActiveTintColor: colors.primary[500],

        // headerTransparent: true,
        // headerShadowVisible: true,
      }}>
        <Tab.Screen name="Search" component={SearchStack} options={{
          headerShown: false,
          tabBarIcon: ({color}) => {

            return <FontAwesome name="search" size={24} color={color}/>;
          },
        }}/>
        <Tab.Screen name="Borrow" component={BorrowStack} options={{
          headerShown: false,
          tabBarIcon: ({color}) => {
            return <FontAwesome6 name="hand-holding-hand" size={24} color={color} />;
          },
        }}/>
        <Tab.Screen name="Lend" component={LendStack} options={{
          headerShown: false,
          tabBarIcon: ({color}) => {
            return <FontAwesome6 name="toolbox" size={24} color={color} />;
          },
        }}/>
        <Tab.Screen name="Inbox" component={ChatStack} options={{
          headerShown: false,
          tabBarIcon: ({color}) => {
            return <Ionicons name="chatbox" size={24} color={color} />;
          },
        }}/>
        <Tab.Screen name="Account" component={Account}  options={{
          // headerShown: false,
          headerTitle: "",
          tabBarIcon: ({color}) => {
            return <MaterialCommunityIcons name="account-circle" size={24} color={color} />;
          },
        }}/>
      </Tab.Navigator>
  );
};

export default MainTabNavigator;