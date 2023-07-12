import React from 'react';
import {Button, Column, Row, Text} from 'native-base';
import {ILoan} from "../models/Relation";
import Card from "./Card";
import {Image} from "react-native";

export interface LoanContextItemProps {
  loan: ILoan;
}

const LoanContextItem: React.FC<LoanContextItemProps> = ({loan}) => {
  if (!loan.tool) {
    console.log("❇️< LoanContextItem > No tool attached");
    return (<></>);
  }

  return (
      <Card onPress={() => {
        // navigation.navigate("EditTool", {
        //   toolId: tool.id,
        // });
      }}>
        <Row w="100%" h={16}>
          <Column p={4} w="50%" h="100%">
            <Text fontSize="lg">{loan.tool.name}</Text>
            <Row>
              <Button variant={"solid"}>Accept Tool</Button>
              <Button variant={"subtle"}>Cancel</Button>
            </Row>
          </Column>
          <Image source={{
            uri: loan.tool.imageUrls
                ? loan.tool.imageUrls[0]
                : "",
          }} style={{width: 100}}/>
        </Row>
      </Card>
  );
};

export default LoanContextItem;