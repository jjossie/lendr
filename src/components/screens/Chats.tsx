import React from 'react';
import {ScrollView} from 'native-base';
import {useMyChats} from "../../utils/hooks/useMyChats";
import ChatListItem from "./ChatListItem";

export interface ChatsProps {

}

const Chats: React.FC<ChatsProps> = (props: ChatsProps) => {

  const chats = useMyChats();

  return (
      <ScrollView>
        {chats?.map((chat) => (
            <ChatListItem key={chat.id} relation={chat}></ChatListItem>
        ))}
      </ScrollView>
  );
};

export default Chats;