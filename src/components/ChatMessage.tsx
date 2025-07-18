import React from 'react';
import {Box, Card, Row, Text, theme} from 'native-base';
import {useAuthentication} from "../utils/hooks/useAuthentication";
import {ChatMessage} from "../models/relation";
import AvatarImage from "./AvatarImage";
import { RelationHydrated } from '../models/relation.zod';

export interface ChatMessageProps {
  message: ChatMessage,
  relation: RelationHydrated,
  // index: number
}

const ChatSingleMessage: React.FC<ChatMessageProps> = ({message, relation}) => {
  const {user} = useAuthentication()
  if (!user || !relation.otherUser) return null;

  const receivedMessage = message.receiverUid === user.uid;
  // const messageColor = receivedMessage ? 'blue.500' : 'green.500';
  // const messageBgColor = receivedMessage ? 'blue.50' : 'green.50';
  // const messageBorderColor = receivedMessage ? 'blue.200' : 'green.200';

  return (
      <Box mx={2} my={1}>

        <Row alignSelf={receivedMessage ? 'flex-start' : 'flex-end'}
             alignItems={"center"}
          space={2}>
          {receivedMessage ? <AvatarImage user={relation.otherUser}/> : null}
          {/*This should be the Sending user, not the receiving user ^^^*/}
          <Card
              bgColor={theme.colors.white}
              p={2}
              rounded="lg"
              maxW={64}
          >
            <Text textAlign={receivedMessage ? 'left' : 'right'}>
              {message.text}
            </Text>
          </Card>
        </Row>
      </Box>
  );
};

export default ChatSingleMessage;