import React, {useState} from 'react';
import {
  Box,
  ChevronRightIcon,
  Column,
  IconButton,
  Input,
  KeyboardAvoidingView,
  Row,
  ScrollView,
  theme,
} from 'native-base';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useChatMessages} from "../../utils/hooks/useChatMessages";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import ChatMessage from "../ChatMessage";
import {getOtherUserInRelation, sendChatMessage} from "../../controllers/Relation";
import {LendrBaseError} from "../../utils/errors";


const ChatConversation: React.FC<NativeStackScreenProps<any>> = ({route, navigation}) => {

  // State
  const [messageText, setMessageText] = useState<string>("");
  const {messages, relation} = useChatMessages(route.params?.relationId);
  const {user} = useAuthentication();

  // State Guards
  if (!user || !relation) return null;

  const handleSendMessage = async () => {
    if (!relation) throw new LendrBaseError("Relation not initialized yet");

    const receiverUid = getOtherUserInRelation(relation, user).uid;
    if (!receiverUid) throw new LendrBaseError("Receiver didn't have a UID :(");

    await sendChatMessage(receiverUid , messageText);
  };

  return (
      <ScrollView h={"100%"}>
        <Column h={"100%"}
                w={"100%"}
                justifyContent={'flex-end'}
                alignContent={'flex-end'}>

          {messages.map((message, index) => (
              <ChatMessage message={message} relation={relation} key={index}/>
          ))
          }

          <KeyboardAvoidingView>
            <Box w={"100%"}>
              <Row p={2} w={"100%"} space={2} justifyContent={"center"}>
                <Input
                    flexGrow={1}
                    bgColor={theme.colors.white}
                    size={"lg"}
                    placeholder={"Type a message..."}
                    rounded={"xl"}
                    variant={"solid"}
                    value={messageText}
                    onChangeText={(text) => {setMessageText(text)}}
                />
                <IconButton variant={"solid"}
                            rounded={"xl"}
                            icon={<ChevronRightIcon/>}
                            onPress={handleSendMessage}
                />
              </Row>
            </Box>
          </KeyboardAvoidingView>

        </Column>
      </ScrollView>
  );
};

export default ChatConversation;