import React, {useEffect} from 'react';
import {Button, Column, ScrollView, Text} from 'native-base';
import Spacer from "../utilities/Spacer";
import {useNavigation} from "@react-navigation/native";
import {useMyTools} from "../../utils/hooks/useMyTools";
import LoanContextItem from "../LoanContextItem";
import {getRelationById, getRelationId} from "../../controllers/relation";
import {ILoan, IRelation} from "../../models/Relation";

export interface BorrowerInventoryProps {

}

const BorrowerInventory: React.FC<BorrowerInventoryProps> = ({}) => {

  const navigation = useNavigation();
  const {borrowingLoansList, setReload} = useMyTools();

  const [loansAndRelations, setLoansAndRelations] = React.useState<{loan: ILoan, relation: IRelation }[]>([]);

  // console.log("❇️BorrowingLoansList:", JSON.stringify(borrowingLoansList, null, 2));


  const getRelationFromLoan = async (loan: ILoan) => {
    const relationID = getRelationId(loan.borrowerUid, loan.lenderUid);
    // console.log(`❇️getting relation ${relationID}`);
    const relation = await getRelationById(relationID);
    console.log(`❇️relation ${relationID} : `, JSON.stringify(relation, null, 2));
    return {relation, loan}
  };


  useEffect(() => {
    // console.log("❇️< BorrowerInventory > useEffect()");
    let promises: Promise<{loan: ILoan, relation: IRelation }>[] = [];

    borrowingLoansList.forEach(loan => promises.push(getRelationFromLoan(loan)));

    Promise.all(promises).then((results) => {
      // console.log("❇️< BorrowerInventory > loansAndRelations results:", JSON.stringify(results, null, 2));
      setLoansAndRelations(results);
    });
  }, [borrowingLoansList]);



  return (
      <ScrollView>
        <Column p={4} flex={1} h={"100%"}>
          <Text p={4} bold fontSize="4xl">Borrowing</Text>
          {(loansAndRelations && loansAndRelations.length > 0)
              ?
              loansAndRelations
                  .filter(({loan, relation}) => loan.status !== "returned") // Remove completed loans
                  .map( ({loan, relation}) => {
                return (<LoanContextItem verbose key={loan.id} relation={relation} loan={loan}/>);
              })

              :
              <Column justifyContent={"space-around"} h={"100%"} alignItems={"center"} space={4} flex={1} >
                <Text>You aren't borrowing any tools right now. Go find some!</Text>
                <Button variant={"solid"} size={"lg"} onPress={() => {
                  navigation.getParent()!.navigate("SearchBrowse");
                }}>Browse Tools</Button>
                <Button variant={"outline"} size={"lg"} onPress={() => { setReload((r) => !r); }}>Refresh</Button>
              </Column>}
        </Column>
        <Spacer/>
      </ScrollView>
  );
};

export default BorrowerInventory;