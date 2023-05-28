import React from 'react';
import {Box, Card, Row, Text, theme} from 'native-base';
import {useAuthentication} from "../utils/hooks/useAuthentication";
import {IChatMessage} from "../models/Relation";
import AvatarImage from "./AvatarImage";

export interface ChatMessageProps {
  message: IChatMessage,
  // index: number
}

const ChatMessage: React.FC<ChatMessageProps> = ({message}) => {
  const {user} = useAuthentication();
  if (!user) return null;

  const receivedMessage = message.receiverUid !== user.uid;
  const messageColor = receivedMessage ? 'blue.500' : 'green.500';
  const messageBgColor = receivedMessage ? 'blue.50' : 'green.50';
  const messageBorderColor = receivedMessage ? 'blue.200' : 'green.200';

  return (
      <Card>

        <Row alignSelf={receivedMessage ? 'flex-start' : 'flex-end'}
             alignItems={"center"}
          space={2}>
          {receivedMessage ? <AvatarImage user={user}/> : null}
          {/*This should be the Sending user, not the receiving user ^^^*/}
          <Box
              bgColor={theme.colors.white}
              p={2}
              rounded="lg"
              maxW={64}
          >
            <Text textAlign={receivedMessage ? 'left' : 'right'}>
              {message.text}
            </Text>
          </Box>
        </Row>
      </Card>
  );
};

export default ChatMessage;