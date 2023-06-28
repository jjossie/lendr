import {collection, DocumentData, documentId, onSnapshot, query, QuerySnapshot, where} from "firebase/firestore";
import {db} from "../../config/firebase";
import {useAuthentication} from "./useAuthentication";
import {useEffect, useState} from "react";
import {getRelationId, handleRelationsQuerySnapshot} from "../../controllers/Relation";
import {IChatViewListItem} from "../../models/Relation";

export function useMyChats(): { chats: IChatViewListItem[] | undefined, isLoaded: boolean } {
  console.log("🛠️useMyChats() - Hook Called");

  // State
  const [chats, setChats] = useState<IChatViewListItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const {authUser, user} = useAuthentication();

  // Callbacks

  const onHandleRelationsQuerySnapshot = (snapshot: QuerySnapshot<DocumentData>) => {
    handleRelationsQuerySnapshot(snapshot, authUser!, setChats, setIsLoaded);
  }

  // Effects
  useEffect(() => {
    // This might run before user is initialized - just skip if that's the case
    if (!authUser || !user) return;

    // TODO fix this garbage nonsense. Why Abstract the "firebase logic" into the controller
    // but then leave the query here? We got firebase controller logic in react AND react logic in the controller.
    const relationIds = user?.relations?.map(id => getRelationId(authUser.uid, id));

    if (!relationIds) return;
    const relationsQuery = query(collection(db, "relations"), where(documentId(), "in", relationIds));

    const unsub = onSnapshot(relationsQuery, onHandleRelationsQuerySnapshot);

  }, [authUser, user]);

  return {chats, isLoaded};
}