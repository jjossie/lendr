import {
  collection,
  DocumentData,
  documentId,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import {db} from "../../config/firebase";
import {useAuthentication} from "./useAuthentication";
import {useCallback, useEffect, useState} from "react";
import {getRelationId} from "../../controllers/Relation";
import {IChatViewListItem, IRelation} from "../../models/Relation";

export function useMyChats(): { chats: IChatViewListItem[] | undefined, isLoaded: boolean } {
  console.log("🛠️useMyChats() - Hook Called");

  // State
  const [chats, setChats] = useState<IChatViewListItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const {authUser, user} = useAuthentication();

  // Callbacks
  const handleRelationsQuerySnapshot = useCallback((snapshot: QuerySnapshot<DocumentData>): void => {
    console.log("🛠️useMyChats() - onSnapshot() called");

    if (!authUser) return;

    const docDataList: IChatViewListItem[] = [];
    const lastMessagePromises: Promise<any>[] = [];
    snapshot.forEach(async relationDocument => {
      // Extract the data from the document
      const relationDocumentData: IRelation = relationDocument.data() as IRelation;

      // Get the info of the other user to be displayed in the chats list
      const otherUser = relationDocumentData.users.filter((chatUser) => chatUser.uid != authUser.uid)[0];
      if (!otherUser) return null;

      // Get the most recent message for each relation
      const lastMessageQuery = query(collection(relationDocument.ref, "messages"),
          orderBy("createdAt", "desc"), limit(1));
      lastMessagePromises.push(getDocs(lastMessageQuery));

      // Add the (incomplete) relation to the list
      docDataList.push({
        id: relationDocument.id,
        otherUser: otherUser,
        ...relationDocumentData,
      } as IChatViewListItem);
    });

    // Tack on the data for the last message of each relation
    Promise.all(lastMessagePromises).then(lastMessages => {
      for (let i = 0; i < docDataList.length; i++) {
        docDataList[i].lastMessage = lastMessages[i].docs[0].data();
      }
      // It appears that although we are properly setting the list here with newly hydrated objects, JS things the list is unchanged.
      // So we must also set loading state:
      setChats((oldList) => {
        return docDataList;
      });
      setIsLoaded(true);
    });

    setChats(docDataList);
  }, [setChats, setIsLoaded, authUser, user]);

  // Effects
  useEffect(() => {
    // This might run before user is initialized - just skip if that's the case
    if (!authUser || !user) return;

    const relationIds = user?.relations?.map(id => getRelationId(authUser.uid, id));

    if (!relationIds) return;
    const relationsQuery = query(collection(db, "relations"), where(documentId(), "in", relationIds));

    const unsub = onSnapshot(relationsQuery, handleRelationsQuerySnapshot);

  }, [authUser, user]);

  return {chats, isLoaded};
}