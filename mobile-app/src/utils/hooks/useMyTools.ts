import React from 'react';
import {collection, onSnapshot, query, where} from "firebase/firestore";
import {db} from "../../config/firebase";
import {ITool} from "../../models/Tool";
import {useAuthentication} from "./useAuthentication";

export function useMyTools(): { lendingToolsList: ITool[], borrowingToolsList: ITool[] } {

  const [lendingToolsList, setLendingToolsList] = React.useState<ITool[]>([]);
  const [borrowingToolsList, setBorrowingToolsList] = React.useState<ITool[]>([]);

  const {authUser} = useAuthentication();

  console.log("🛠useMyTools()");

  React.useEffect(() => {
    // This might run before user is initialized - just skip if that's the case
    if (!authUser) return;

    const lendingQuery = query(collection(db, "tools"),
        where("lenderUid", "==", authUser.uid),
    );

    const borrowingQuery = query(collection(db, "tools"),
        where("lenderUid", "!=", authUser.uid),
        where("holderUid", "==", authUser.uid),
    ); // Do we want to add a query for tools we're interested in but not holding just yet?

    const lendingUnsubscribe = onSnapshot(lendingQuery, (snapshot) => {
      const docDataList: ITool[] = [];
      snapshot.forEach(document => {
        docDataList.push({id: document.id, ...document.data()} as ITool);
      });
      setLendingToolsList(docDataList);
    });

    const borrowingUnsubscribe = onSnapshot(borrowingQuery, (snapshot) => {
      const docDataList: ITool[] = [];
      snapshot.forEach(document => {
        docDataList.push({id: document.id, ...document.data()} as ITool);
      });
      setBorrowingToolsList(docDataList);
    });

    return () => {
      lendingUnsubscribe();
      borrowingUnsubscribe();
    };
  }, [authUser]);

  return {lendingToolsList, borrowingToolsList};
}