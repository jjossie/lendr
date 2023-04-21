import React from 'react';
import {collection, onSnapshot, query, where} from "firebase/firestore";
import {db} from "../../config/firebase";
import {ITool} from "../../models/Tool";
import {User} from "firebase/auth";
import {getRefFromUid} from "../../models/LendrUser";

export function useMyTools(user?: User) {
  const [list, setList] = React.useState<ITool[]>([]);
  console.log("🛠️useMyTools()");

  React.useEffect(() => {
    // This might run before user is initialized - just skip if that's the case
    if (!user) return;

    const refFromUid = getRefFromUid(user?.uid);
    console.log(refFromUid);
    const q = query(collection(db, "tools"), where("lenderRef", "==", refFromUid));
    const unsub = onSnapshot(q, (snapshot) => {

      const docDataList: ITool[] = [];
      snapshot.forEach(document => {
        docDataList.push({id: document.id, ...document.data()} as ITool);
      });
      setList(docDataList);
    });
  }, []);

  return list;
}