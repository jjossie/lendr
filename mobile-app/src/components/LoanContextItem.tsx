import React, {useState} from 'react';
import {Button, Column, Row, Text} from 'native-base';
import {ILoan, IRelation} from "../models/Relation";
import Card from "./Card";
import {Image} from "react-native";
import {acceptTool, requestLoan, requestReturn} from "../controllers/relation";
import {useAuthentication} from "../utils/hooks/useAuthentication";
import {useNavigation} from "@react-navigation/native";

export interface LoanContextItemProps {
  loan: ILoan;
  relation: IRelation;
}

type Action = { name: string, callback: (toolId: string) => Promise<any>, variant: string };
const actions = {
  requestLoan: {name: "Loan", callback: requestLoan, variant: "subtle"},
  acceptLoan: {name: "Accept Loan", callback: acceptTool, variant: "solid"},
  requestReturn: {name: "Return", callback: requestReturn, variant: "subtle"},
  acceptReturn: {name: "Accept Return", callback: acceptTool, variant: "solid"},
};

const LoanContextItem: React.FC<LoanContextItemProps> = ({loan, relation}) => {
  const {authUser} = useAuthentication();
  const navigation = useNavigation();

  if (!loan.tool) {
    console.log("❇️< LoanContextItem > No tool attached");
    return (<></>);
  }

  const [isLoading, setIsLoading] = useState(false);

  console.log("❇️Loan Status:", loan.status);
  console.log("❇️Loan:", JSON.stringify(loan, null, 2));
  console.log("❇️Relation:", JSON.stringify(relation, null, 2));

  const isBorrower: boolean = loan.borrowerUid === authUser?.uid;
  const isLender = !isBorrower;
  const canCancel: boolean = loan.status in ["inquired", "loanRequested"];

  let action: Action | undefined;

  if (loan.status === "inquired" && isLender)
    action = actions.requestLoan;
  else if (loan.status === "loanRequested" && isBorrower)
    action = actions.acceptLoan;
  else if (loan.status === "loaned" && isBorrower)
    action = actions.requestReturn;
  else if (loan.status === "returnRequested" && isLender)
    action = actions.acceptReturn;

  let statusMessage = "";
  if (loan.status === "loaned" && isLender && loan.loanDate?.seconds) {
    statusMessage = `Loaned to ${relation.otherUser?.displayName} on ${new Date(loan.loanDate.seconds * 1000).toLocaleDateString()}`;
  }


  return (
      <Card onPress={() => {
        if (!loan.tool) return;
        navigation.getParent()?.navigate("SearchBrowse", { // TODO fix this, it navigates to searchBrowse but not ToolDetail
          screen: "ToolDetail",
          params: {
            toolId: loan.tool.id,
          },
        });
      }}>
        <Row w="100%" h={32} justifyContent={"space-between"} flexWrap="nowrap">
          <Column justifyContent={"space-between"} p={4} w="60%" h="100%">
            <Text fontSize="lg">{loan.tool.name} - <Text fontSize={"lg"}
                                                         bold={true}>${loan.tool.rate.price}</Text>/{loan.tool.rate.timeUnit}
            </Text>
            <Row space={2}>
              {action
                  ? <Button
                      isLoading={isLoading}
                      variant={action?.variant ?? "ghost"}
                      onPress={async (e) => {
                        setIsLoading(true);
                        try {
                          await action?.callback(loan.toolId);
                        } catch (e) {
                          // Set Error
                          console.error(`❇️Something went wrong with the ${action?.name} Action: `, e);
                        }
                        setIsLoading(false);
                      }}>{action?.name}</Button>
                  : statusMessage ? <Button disabled variant={"ghost"}>{statusMessage}</Button> : null
              }
              {(canCancel) && <Button variant={"ghost"}>Cancel</Button>}
            </Row>
          </Column>
          <Image source={{
            uri: loan.tool.imageUrl,
          }} style={{width: "35%"}}/>
        </Row>
      </Card>
  );
};

export default LoanContextItem;
