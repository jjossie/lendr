import React from 'react';
import {collection, onSnapshot, query, where} from "firebase/firestore";
import {db} from "../../config/firebase";
import {ITool} from "../../models/Tool";
import {User} from "firebase/auth";

export function useMyTools(user?: User) {
  const [list, setList] = React.useState<ITool[]>([]);
  console.log("🛠️useMyTools()");
  console.log(user);

  React.useEffect(() => {
    // This might run before user is initialized - just skip if that's the case
    if (!user) return;

    const q = query(collection(db, "tools"), where("ownerUid", "==", user?.uid));
    const unsub = onSnapshot(q, (snapshot) => {

      const docDataList: ITool[] = [];
      snapshot.forEach(document => {
        docDataList.push(document.data() as ITool);
      });
      setList(docDataList);
    });
  }, [setList]);

  return list;
}