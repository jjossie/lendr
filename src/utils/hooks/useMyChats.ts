import {collection, documentId, onSnapshot, query, where} from "firebase/firestore";
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
    console.log("LendrUser: ", user);
    const relationIds = user?.relations?.map(id => getRelationId(authUser.uid, id));
    console.log("Relation IDs: ", relationIds);
    if (!relationIds) return;
    const q = query(collection(db, "relations"), where(documentId(), "in", relationIds));
    const unsub = onSnapshot(q, (snapshot) => {
      const docDataList: IRelation[] = [];
      snapshot.forEach(document => {
        docDataList.push({id: document.id, ...document.data()} as IRelation);
      });
      setList(docDataList);
    });
  }, [authUser, user]);

  return list;
}