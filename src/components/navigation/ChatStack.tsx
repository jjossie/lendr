import React from 'react';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import ChatConversation from "../screens/ChatConversation";
import Chats from "../screens/Chats";


const Stack = createNativeStackNavigator();


const ChatStack: React.FC<BottomTabScreenProps<any>> = () => {
  return (
        <Stack.Navigator initialRouteName="Chats">
          <Stack.Screen name="Chats" component={Chats} options={{title: "Chats"}}/>
          <Stack.Screen name="ChatConversation" component={ChatConversation}/>
        </Stack.Navigator>
  );
};

export default ChatStack;