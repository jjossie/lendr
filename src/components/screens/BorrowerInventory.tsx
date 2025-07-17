import React, {useEffect, useState} from 'react';
import {Button, Column, Heading, ScrollView, Text} from 'native-base';
import Spacer from "../utilities/Spacer";
import {useNavigation} from "@react-navigation/native";
import {useMyTools} from "../../utils/hooks/useMyTools";
import LoanContextItem from "../LoanContextItem";
import {Loan} from "../../models/relation";
import {RefreshControl} from 'react-native';
import { RelationHydrated } from '../../models/relation.zod';
import { getRelationFromLoan } from '../../controllers/relation';

export interface BorrowerInventoryProps {

}

const BorrowerInventory: React.FC<BorrowerInventoryProps> = ({}) => {

  // State
  const navigation = useNavigation();
  const {borrowingLoansList, setReload} = useMyTools();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loansAndRelations, setLoansAndRelations] = React.useState<{loan: Loan, relation: RelationHydrated }[]>([]);

  // Side Effects
  useEffect(() => {
    const promises: Promise<{loan: Loan, relation: RelationHydrated }>[] = [];

    borrowingLoansList.forEach(loan => promises.push(getRelationFromLoan(loan)));

    Promise.all(promises).then((results) => {
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