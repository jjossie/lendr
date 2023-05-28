import React from 'react';
import {Box, Column, Input, KeyboardAvoidingView, ScrollView} from 'native-base';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useChatMessages} from "../../utils/hooks/useChatMessages";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import ChatMessage from "../ChatMessage";


const ChatConversation: React.FC<NativeStackScreenProps<any>> = ({route, navigation}) => {
  console.log("Route parameters passed to < ChatConversation > : ", route.params);
  const {messages} = useChatMessages(route.params?.relationId);
  const {user} = useAuthentication();
  if (!user) return null;
  return (
      <ScrollView h={"100%"}>
        <Column h={"100%"}
                w={"100%"}
                p={4}
                justifyContent={'flex-end'}
                alignContent={'flex-end'}>
          {/*alignContent={messages.length > 0 ? 'flex-start' : 'center'}>*/}

          {messages.map((message, index) => (
            <ChatMessage message={message} key={index} />
          ))
          }

          <KeyboardAvoidingView>
            <Box>
              <Input
                placeholder={"Type a message..."}
                variant={"rounded"}>
              </Input>
            </Box>
          </KeyboardAvoidingView>

        </Column>
      </ScrollView>
  );
};

export default ChatConversation;