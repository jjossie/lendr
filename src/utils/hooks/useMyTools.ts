import React from 'react';
import {collection, onSnapshot, query, where} from "firebase/firestore";
import {db} from "../../config/firebase";
import {useAuthentication} from "./useAuthentication";
import {ITool} from "../../models/Tool";

export function useMyTools() {
  const [list, setList] = React.useState<ITool[]>([]);
  const {user} = useAuthentication();

  React.useEffect(() => {
    const q = query(collection(db, "tools"), where("ownerUid", "==", user?.uid));
    const unsub = onSnapshot(q, (snapshot) => {

      const docDataList: ITool[] = [];
      snapshot.forEach(document => {
        docDataList.push(document.data() as ITool);
      });
      setList(docDataList);
    });
  }, []);

  return list;
}