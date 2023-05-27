import React from 'react';
import {Box, Column, Input, KeyboardAvoidingView, ScrollView, Text} from 'native-base';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useChatMessages} from "../../utils/hooks/useChatMessages";
import {useAuthentication} from "../../utils/hooks/useAuthentication";


const ChatConversation: React.FC<NativeStackScreenProps<any>> = ({route, navigation}) => {
  console.log("Route parameters passed to < ChatConversation > : ", route.params);
  const {messages} = useChatMessages(route.params?.relationId);
  const {user} = useAuthentication();
  if (!user) return null;
  return (
      <ScrollView>
        <Column h={"100%"}
                justifyContent={'flex-end'}
                alignContent={'flex-end'}>
          {/*alignContent={messages.length > 0 ? 'flex-start' : 'center'}>*/}

          {messages.map((message, index) => (
              <Box key={index}>
                <Text textAlign={message.receiverUid === user.uid ? 'right' : 'left'}>
                  {message.text}
                </Text>
              </Box>
          ))
          }

          <KeyboardAvoidingView>
            <Box>
              <Input>
                Message
              </Input>
            </Box>
          </KeyboardAvoidingView>

        </Column>
      </ScrollView>
  );
};

export default ChatConversation;