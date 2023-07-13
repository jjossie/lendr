import React, {useState} from 'react';
import {Button, Column, Row, Text} from 'native-base';
import {ILoan} from "../models/Relation";
import Card from "./Card";
import {Image} from "react-native";
import {acceptTool} from "../controllers/relation";

export interface LoanContextItemProps {
  loan: ILoan;
}

const LoanContextItem: React.FC<LoanContextItemProps> = ({loan}) => {
  if (!loan.tool) {
    console.log("❇️< LoanContextItem > No tool attached");
    return (<></>);
  }

  const [isLoading, setIsLoading] = useState(false);

  console.log("❇️Loan Status:", loan.status);
  let actionButton = (<></>);
  switch (loan.status) {
    case "inquired":
    case "loanRequested":
      actionButton = (
          <Button
              isLoading={isLoading}
              variant={"solid"}
              onPress={async (e) => {
                setIsLoading(true);
                try {
                  await acceptTool(loan.toolId);
                } catch (e) {
                }
                setIsLoading(false);
              }}>Accept Tool</Button>
      );
      break;
    case "loaned":
      actionButton = (
          <Button
              isLoading={isLoading}
              variant={"ghost"}
              onPress={async (e) => {
              }}>Return Tool</Button>
      );
      break;
    default:
      actionButton = (
          <Button
              isLoading={isLoading}
              variant={"ghost"}
              onPress={async (e) => {
              }}>Who knows</Button>
      )
  }


  return (
      <Card onPress={() => {
        // navigation.navigate("ToolDetail", {
        //   toolId: tool.id,
        // });
      }}>
        <Row w="100%" h={32} justifyContent={"space-between"} flexWrap="nowrap">
          <Column justifyContent={"space-between"} p={4} w="60%" h="100%">
            <Text fontSize="lg">{loan.tool.name} - <Text fontSize={"lg"}
                                                         bold={true}>${loan.tool.rate.price}</Text>/{loan.tool.rate.timeUnit}
            </Text>
            <Row space={2}>
              {actionButton}
              <Button variant={"subtle"}>Cancel</Button>
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