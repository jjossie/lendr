import {IChatMessage, ILoan, IRelation} from "../../models/Relation";
import {useEffect, useState} from "react";
import {useAuthentication} from "./useAuthentication";
import {getLiveLoans, getLiveMessages, getOtherUserInRelation, getRelationById} from "../../controllers/Relation";

export function useChatMessages(relationId: string) {
  console.log("🛠️useChatMessages() - Hook Called");

  // State
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [relation, setRelation] = useState<IRelation>();
  const [loans, setLoans] = useState<ILoan[]>([]);
  const {authUser, user} = useAuthentication();

  // Effects
  useEffect(() => {
    // This might run before user is initialized - just skip if that's the case
    if (!authUser || !user || !relationId) return;

    // Get the relation object
    getRelationById(relationId)
        .then((relation) => {
          getLiveMessages(setMessages, authUser, user, relation);
          getLiveLoans(setLoans, authUser, relation);
          relation.otherUser = getOtherUserInRelation(relation, user);
          setRelation(relation);
        });

  }, [authUser, user]);
  console.log("🛠️useChatMessage() - Returning Loans: ", JSON.stringify(loans[0], null, 2));
  return {messages, relation, loans};
}