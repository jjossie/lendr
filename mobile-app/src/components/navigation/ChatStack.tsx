import React from 'react';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import ChatConversation from "../screens/ChatConversation";
import Chats from "../screens/Chats";
import ToolDetail from "../screens/ToolDetail";
import {useTheme} from "native-base";
// import { ParamListBase } from '@react-navigation/native';


const Stack = createNativeStackNavigator();
// export interface ChatStackProps extends ParamListBase {
//   chatStackPropception?: {
//     chatConversationTitle?: string;
//   };
// }


const ChatStack: React.FC<BottomTabScreenProps<any>> = ({navigation}) => {
  const {colors} = useTheme();
  return (
        <Stack.Navigator initialRouteName="Chats" screenOptions={{
          headerTitle: "",
          headerStyle: {
            backgroundColor: colors.light[100],
          },
          headerShadowVisible: false,
        }}>
          <Stack.Screen name="Chats" component={Chats} options={{title: "Chats"}}/>
          <Stack.Screen name="ChatConversation" component={ChatConversation} options={{ 
            title: "Test?" // TODO figure out how to pass in the name of the other user here.
            // When we don't have a title element here, we end up stuck if we navigated to the 
            // chatConversation component directly (nothing in the back stack).
           }}/>
          <Stack.Screen name="ToolDetail" component={ToolDetail} />
        </Stack.Navigator>
  );
};

export default ChatStack;