import React, {useEffect, useState} from 'react';
import {Button, Column, Heading, ScrollView, Text} from 'native-base';
import Spacer from "../utilities/Spacer";
import {useNavigation} from "@react-navigation/native";
import {useMyTools} from "../../utils/hooks/useMyTools";
import LoanContextItem from "../LoanContextItem";
import {getRelationById, getRelationId} from "../../controllers/relation";
import {ILoan, IRelation} from "../../models/Relation";
import {RefreshControl} from 'react-native';

export interface BorrowerInventoryProps {

}

const BorrowerInventory: React.FC<BorrowerInventoryProps> = ({}) => {

  // State
  const navigation = useNavigation();
  const {borrowingLoansList, setReload} = useMyTools();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loansAndRelations, setLoansAndRelations] = React.useState<{loan: ILoan, relation: IRelation }[]>([]);

  // console.log("❇️BorrowingLoansList:", JSON.stringify(borrowingLoansList, null, 2));

  // Side Effects
  useEffect(() => {
    // console.log("❇️< BorrowerInventory > useEffect()");
    let promises: Promise<{loan: ILoan, relation: IRelation }>[] = [];

    borrowingLoansList.forEach(loan => promises.push(getRelationFromLoan(loan)));

    Promise.all(promises).then((results) => {
      // console.log("❇️< BorrowerInventory > loansAndRelations results:", JSON.stringify(results, null, 2));
      setLoansAndRelations(results);
    });
  }, [borrowingLoansList]);

  // Callbacks
  const onRefresh = async () => {
    setRefreshing(true);
    setReload(b => !b);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000)
  };

  const getRelationFromLoan = async (loan: ILoan) => {
    const relationID = getRelationId(loan.borrowerUid, loan.lenderUid);
    // console.log(`❇️getting relation ${relationID}`);
    const relation = await getRelationById(relationID);
    console.log(`❇️relation ${relationID} : `, JSON.stringify(relation, null, 2));
    return {relation, loan}
  };

  return (
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Column p={4} flex={1} h={"100%"}>
          <Heading>Borrowing</Heading>
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
              </Column>}
        </Column>
        <Spacer/>
      </ScrollView>
  );
};

export default BorrowerInventory;