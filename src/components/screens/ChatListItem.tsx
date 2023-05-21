import React from 'react';
import {Box} from 'native-base';
import {IRelation} from "../../models/Relation";

export interface ChatListItemProps {
  relation: IRelation
}

const ChatListItem: React.FC<ChatListItemProps> = ({relation}) => {
  return (
      <Box>
        {relation.id}
      </Box>
  );
};

export default ChatListItem;