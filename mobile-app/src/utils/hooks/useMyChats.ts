import {useAuthentication} from "./useAuthentication";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {getLiveChatConversationsList, } from "../../controllers/relation";
import {ChatViewListItem} from "../../models/relation";

export function useMyChats(): { chats: ChatViewListItem[] | undefined, isLoaded: boolean, setIsLoaded: Dispatch<SetStateAction<boolean>>} {
  console.log("🛠️useMyChats() - Hook Called");

  // State
  const [chats, setChats] = useState<ChatViewListItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const {authUser, user} = useAuthentication();

  // Effects
  useEffect(() => {
    // This might run before user is initialized - just skip if that's the case
    if (!authUser || !user) return;
    return getLiveChatConversationsList(setChats, setIsLoaded, authUser, user);
  }, [authUser, user]);

  return {chats, isLoaded, setIsLoaded};
}