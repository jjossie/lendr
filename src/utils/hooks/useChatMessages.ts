import {IChatMessage} from "../../models/Relation";
import {useEffect, useState} from "react";
import {useAuthentication} from "./useAuthentication";
import {getLiveMessages, getRelationById} from "../../controllers/Relation";

export function useChatMessages(relationId: string) {
  console.log("🛠️useChatMessages() - Hook Called");

  // State
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const {authUser, user} = useAuthentication();

  // Effects
  useEffect(() => {
    // This might run before user is initialized - just skip if that's the case
    if (!authUser || !user || !relationId) return;

    // Get the relation object
    const relation = getRelationById(relationId)
        .then((relation) => getLiveMessages(setMessages, authUser, user, relation));

  }, [authUser, user]);

  return {messages};
}