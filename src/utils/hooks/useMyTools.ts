import React from 'react';
import {collection, onSnapshot, query, where} from "firebase/firestore";
import {db} from "../../config/firebase";
import {ITool} from "../../models/Tool";
import {getRefFromUid} from "../../models/LendrUser";
import {useAuthentication} from "./useAuthentication";

export function useMyTools(): ITool[] {

  const [list, setList] = React.useState<ITool[]>([]);
  const {authUser} = useAuthentication();

  console.log("🛠️useMyTools()");

  React.useEffect(() => {
    // This might run before user is initialized - just skip if that's the case
    if (!authUser) return;

    const refFromUid = getRefFromUid(authUser.uid);
    const q = query(collection(db, "tools"), where("lenderRef", "==", refFromUid));
    const unsub = onSnapshot(q, (snapshot) => {
      const docDataList: ITool[] = [];
      snapshot.forEach(document => {
        docDataList.push({id: document.id, ...document.data()} as ITool);
      });
      setList(docDataList);
    });
  }, [authUser]);

  return list;
}