import React, {useEffect, useRef, useState} from 'react';
import {Box, Center, ChevronRightIcon, Column, IconButton, Input, KeyboardAvoidingView, Row, Spinner, theme} from 'native-base';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useChatMessages} from "../../utils/hooks/useChatMessages";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import ChatSingleMessage from "../ChatMessage";
import {getOtherUserInRelation, sendChatMessage} from "../../controllers/relation";
import {LendrBaseError} from "../../utils/errors";
import {Platform, ScrollView} from "react-native";
import LoanContext from "../LoanContext";
// import { ParamListBase } from '@react-navigation/native';

// export interface ChatConversationProps extends ParamListBase {
//   chatConversationPropception?: {
//     title?: string;
//   }
// }

const ChatConversation: React.FC<NativeStackScreenProps<any>> = ({route, navigation}) => {

  if (!route.params?.relationId) {
    throw new LendrBaseError("❇️ChatConversation screen requires a relationId parameter");
  }

  // Content State
  const [messageText, setMessageText] = useState<string>(route.params?.draftMessage ?? "");
  const [screenTitle, setScreenTitle] = useState<string>(route.params?.title ?? "");
  const {messages, relation, loans} = useChatMessages(route.params.relationId);
  const {user} = useAuthentication();
  
  console.log("🌀 ChatConversation screen title: ", screenTitle);

  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Refs
  const scrollViewRef = useRef<ScrollView | null>(null);


  // Callbacks
  const handleSendMessage = async () => {
    if (!relation) throw new LendrBaseError("❇️Relation not initialized yet 🥸");
    if (!user) throw new LendrBaseError("❇️User not initialized yet 🥸");

    const receiverUid = getOtherUserInRelation(relation, user).uid;
    if (!receiverUid) throw new LendrBaseError("❇️Receiver didn't have a UID ☹️");

    setIsLoading(true);
    setMessageText("");
    await sendChatMessage(receiverUid, messageText);
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollViewRef && scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({animated: true});
      }
    }, 0);
  };

  // Side Effects
  useEffect(() => {
    scrollToBottom();
  }, [scrollViewRef]);

  useEffect(() => {
    if (relation && user)
      navigation.setOptions({title: getOtherUserInRelation(relation, user).displayName})
  }, [relation])

  // State Guards
   if (!user || !relation) {
    return (
        <Center flex={1}>
          <Spinner size="lg" accessibilityLabel="Loading messages"/>
        </Center>
    );
  }


  return (
      <KeyboardAvoidingView
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : -200}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{flex: 1}}
      >

        <Column
            w={"100%"}
            justifyContent={'flex-end'}
            alignContent={'flex-end'}
            style={{flex: 1}}
        >
          <LoanContext relation={relation} loans={loans}/>
          <ScrollView
              ref={(ref) => {
                scrollViewRef.current = ref;
              }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{flexGrow: 1}}
              onContentSizeChange={scrollToBottom}
          >
            {messages.map((message, index) => (
                <ChatSingleMessage message={message} relation={relation} key={index}/>
            ))
            }
          </ScrollView>

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
                  onFocus={()=> {
                    console.log("focused");
                    setTimeout(() => {
                      console.log("timed out");
                      scrollToBottom();
                    }, 100);
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
  );
};

export default ChatConversation;