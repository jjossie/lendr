import React, {Dispatch, SetStateAction} from 'react';
import {collection, collectionGroup, onSnapshot, query, where} from "firebase/firestore";
import {db} from "../../config/firebase";
import {ITool} from "../../models/Tool";
import {useAuthentication} from "./useAuthentication";
import {ILoan} from "../../models/Relation";

export function useMyTools(): { lendingToolsList: ITool[], borrowingLoansList: ILoan[], setReload: Dispatch<SetStateAction<boolean>> } {

  const [lendingToolsList, setLendingToolsList] = React.useState<ITool[]>([]);
  const [borrowingLoansList, setBorrowingLoansList] = React.useState<ILoan[]>([]);
  const [reload, setReload] = React.useState(false);

  const {authUser, user} = useAuthentication();

  console.log("🛠useMyTools()");

  React.useEffect(() => {
    // This might run before user is initialized - just skip if that's the case
    if (!authUser) return;

    const lendingQuery = query(collection(db, "tools"),
        where("lenderUid", "==", authUser.uid),
    );

    const lendingUnsubscribe = onSnapshot(lendingQuery, (snapshot) => {
      const docDataList: ITool[] = [];
      snapshot.forEach(document => {
        docDataList.push({id: document.id, ...document.data()} as ITool);
      });
      setLendingToolsList(docDataList);
    });

    let borrowingUnsubscribe = () => {
    };

    if (user?.relations) {
      console.log("🛠️Constructing borrowerQuery");
      const borrowingQuery = query(
          collectionGroup(db, "loans"),
          where("borrowerUid", "==", authUser.uid),
      );

      borrowingUnsubscribe = onSnapshot(borrowingQuery, (snapshot) => {
        console.log("🛠️borrowingQuery results:", snapshot.size);
        const docDataList: ILoan[] = [];
        snapshot.forEach(document => {
          // console.log("🛠️Found borrowing loan:", JSON.stringify(document.data(), null, 2));
          docDataList.push({id: document.id, ...document.data()} as ILoan);
        });
        setBorrowingLoansList(docDataList);
      });
    } else { console.log("🛠️No relations");}

    return () => {
      lendingUnsubscribe();
      borrowingUnsubscribe();
    };
  }, [authUser, reload]);

  return {lendingToolsList, borrowingLoansList, setReload};
}