import React from 'react';
import {Box, Input, KeyboardAvoidingView, ScrollView} from 'native-base';

export interface RelationProps {

}

const ChatConversation: React.FC<RelationProps> = (props: RelationProps) => {
  return (
      <ScrollView>

        <KeyboardAvoidingView>
          <Box>
            <Input>
              Message
            </Input>
          </Box>
        </KeyboardAvoidingView>

      </ScrollView>
  );
};

export default ChatConversation;