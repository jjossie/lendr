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
import {Platform} from "react-native";


const ChatConversation: React.FC<NativeStackScreenProps<any>> = ({route, navigation}) => {

  // Content State
  const [messageText, setMessageText] = useState<string>("");
  const {messages, relation} = useChatMessages(route.params?.relationId);
  const {user} = useAuthentication();

  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // State Guards
  if (!user || !relation) return null;

  // Callbacks
  const handleSendMessage = async () => {
    if (!relation) throw new LendrBaseError("Relation not initialized yet");

    const receiverUid = getOtherUserInRelation(relation, user).uid;
    if (!receiverUid) throw new LendrBaseError("Receiver didn't have a UID :(");

    setIsLoading(true);
    await sendChatMessage(receiverUid, messageText);
    setIsLoading(false);
    setMessageText("");
  };

  return (
      <ScrollView contentContainerStyle={{height: "100%"}}
                  keyboardShouldPersistTaps="handled"
                  h={"100%"}
      >
        <KeyboardAvoidingView
            h={{
              base: "100%",
              lg: "300px"
            }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >

          <Column h={"100%"}
                  w={"100%"}
                  justifyContent={'flex-end'}
                  alignContent={'flex-end'}>

            {messages.map((message, index) => (
                <ChatMessage message={message} relation={relation} key={index}/>
            ))
            }
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
                    onChangeText={(text) => {
                      setMessageText(text);
                    }}
                />
                <IconButton variant={"solid"}
                            rounded={"xl"}
                            isDisabled={isLoading}
                    // icon={isLoading ? <Spinner/> : <ChevronRightIcon/>}
                            icon={<ChevronRightIcon/>}
                            onPress={handleSendMessage}
                />
              </Row>
            </Box>
          </Column>
        </KeyboardAvoidingView>
      </ScrollView>
  );
};

export default ChatConversation;