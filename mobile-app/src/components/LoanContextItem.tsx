import React, {useState} from 'react';
import {Button, Column, Row, Text, theme} from 'native-base';
import {ILoan, IRelation} from "../models/Relation";
import Card from "./Card";
import {Image} from "react-native";
import {acceptHandoff, startHandoff} from "../controllers/relation";
import {useAuthentication} from "../utils/hooks/useAuthentication";
import {useNavigation} from "@react-navigation/native";
import {Timestamp} from "firebase/firestore";
import AvailabilityChip from "./AvailabilityChip";

export interface LoanContextItemProps {
  loan: ILoan;
  relation: IRelation;
  verbose?: boolean;
}

type Action = { name: string, callback: (relationId: string, loanId: string) => Promise<any>, variant: string };
const actions = {
  requestLoan: {name: "Loan", callback: startHandoff, variant: "subtle"},
  acceptLoan: {name: "Accept Loan", callback: acceptHandoff, variant: "solid"},
  requestReturn: {name: "Return", callback: startHandoff, variant: "solid"},
  acceptReturn: {name: "Accept Return", callback: acceptHandoff, variant: "solid"},
};

const LoanContextItem: React.FC<LoanContextItemProps> = ({loan, relation, verbose = false}) => {
  const {authUser} = useAuthentication();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  if (!loan.tool) {
    console.log("❇️< LoanContextItem > No tool attached");
    return (<></>);
  }


  console.log(`❇️${loan.tool.name} Loan Status:`, loan.status);
  // console.log("❇️Loan:", JSON.stringify(loan, null, 2));
  // console.log("❇️Relation:", JSON.stringify(relation, null, 2));


  // Derived state
  const isBorrower: boolean = loan.borrowerUid === authUser?.uid;
  const isLender = !isBorrower;
  const canCancel: boolean = ["inquired", "loanRequested"].includes(loan.status);
  const lender = relation.users.filter(user => user.uid !== loan.borrowerUid)[0];

  let action: Action | undefined;

  // Possible Actions
  if (loan.status === "inquired" && isLender) {
    action = actions.requestLoan;
    // else
    //   action = actions.acceptLoan; // Maybe we don't want them to see this?
  } else if (loan.status === "loanRequested" && isBorrower)
    action = actions.acceptLoan;
  else if (loan.status === "loaned" && isBorrower)
    action = actions.requestReturn;
  else if (loan.status === "returnRequested" && isLender)
    action = actions.acceptReturn;

  function dateFromTimestamp(timestamp: Timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }

  // Non-actionable status messages
  let statusMessage = "";
  if (loan.status === "inquired" && loan.inquiryDate?.seconds) {
    statusMessage = isLender
        ? `${relation.otherUser?.displayName} expressed interest on ${dateFromTimestamp(loan.inquiryDate)}`
        : `Inquired ${dateFromTimestamp(loan.inquiryDate)}`;
  }
  if (loan.status === "loaned" && isLender && loan.loanDate?.seconds) {
    statusMessage = `Loaned to ${relation.otherUser?.displayName} on ${dateFromTimestamp(loan.loanDate)}`;
  }
  if ((loan.status === "loanRequested" && isBorrower) ||
      (loan.status === "returnRequested" && isLender))
    statusMessage = `Waiting for ${relation.otherUser?.firstName ?? relation.otherUser?.displayName} to accept`;
  if (loan.status === "loaned" && loan.loanDate?.seconds) {
    statusMessage = `Loaned since ${dateFromTimestamp(loan.loanDate)}`;
  }

  if (loan.status === "returned") {
    statusMessage = `Returned ${loan.returnDate ? dateFromTimestamp(loan.returnDate) : ""}`;
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
        <Row w="100%" h={verbose ? 40 : 32} justifyContent={"space-between"} flexWrap="nowrap">
          {loan.tool && <>
            <Column justifyContent={(statusMessage || action) ? "space-between" : "space-around"} p={4} w="60%"
                    h="100%">
              <Text fontSize="lg">{loan.tool.name} - <Text fontSize={"lg"}
                                                           bold={true}>${loan.tool.rate.price}</Text>/{loan.tool.rate.timeUnit}
              </Text>

              {verbose && <AvailabilityChip showAvailable={false} user={lender}/>}

              <Row alignItems={"center"} flexWrap={"nowrap"} space={2}>
                {action && <Button
                        isLoading={isLoading}
                        variant={action?.variant ?? "ghost"}
                        onPress={async (e) => {
                          setIsLoading(true);
                          try {
                            await action?.callback(relation.id!, loan.id!);
                          } catch (e) {
                            // Set Error
                            console.error(`❇️Something went wrong with the ${action?.name} Action: \n`, e);
                          }
                          setIsLoading(false);
                        }}>{action?.name}</Button>
                }
                {
                  statusMessage && <Text color={theme.colors.text["400"]}>{statusMessage}</Text>
                }
                {(canCancel) && <Button variant={"ghost"}>Cancel</Button>}
              </Row>
            </Column>
            <Image source={{
              uri: loan.tool.imageUrl,
            }} style={{width: "35%"}}/>
          </>}
        </Row>
      </Card>
  );
};

export default LoanContextItem;
