import {collection, documentId, getDocs, limit, onSnapshot, orderBy, query, where} from "firebase/firestore";
import {db} from "../../config/firebase";
import {useAuthentication} from "./useAuthentication";
import {useEffect, useState} from "react";
import {getRelationId} from "../../controllers/Relation";
import {IRelation} from "../../models/Relation";

export function useMyChats(): IRelation[] | undefined {

  const [list, setList] = useState<IRelation[]>([]);
  const {authUser, user} = useAuthentication();

  console.log("🛠️useMyChats()");

  useEffect(() => {
    // This might run before user is initialized - just skip if that's the case
    if (!authUser || !user) return;

    const relationIds = user?.relations?.map(id => getRelationId(authUser.uid, id));

    if (!relationIds) return;
    const relationsQuery = query(collection(db, "relations"), where(documentId(), "in", relationIds));

    const unsub = onSnapshot(relationsQuery, (snapshot) => {
      const docDataList: IRelation[] = [];
      const lastMessagePromises: Promise<any>[] = [];
      snapshot.forEach(async document => {


        // Get the most recent message for each relation
        const lastMessageQuery = query(collection(document.ref, "messages"),
            orderBy("createdAt", "desc"), limit(1));
        lastMessagePromises.push(getDocs(lastMessageQuery));
        // Add the (incomplete) relation to the list
        docDataList.push({id: document.id, ...document.data()} as IRelation);
      });

      Promise.all(lastMessagePromises).then(lastMessages => {
        for (let i = 0; i < docDataList.length; i++) {
          docDataList[i].lastMessage = lastMessages[i].docs[0].data();
        }
        setList(docDataList);
      });
      setList(docDataList);
    });
  }, [authUser, user]);

  return list;
}