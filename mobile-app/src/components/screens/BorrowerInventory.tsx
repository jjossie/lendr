import React from 'react';
import {Button, Center, Column, ScrollView, Text} from 'native-base';
import LenderInventoryItem from "../LenderInventoryItem";
import Spacer from "../utilities/Spacer";
import {useNavigation} from "@react-navigation/native";
import {useMyTools} from "../../utils/hooks/useMyTools";

export interface BorrowerInventoryProps {

}

const BorrowerInventory: React.FC<BorrowerInventoryProps> = ({}) => {

  const navigation = useNavigation();
  const {borrowingToolsList} = useMyTools();

  return (
      <ScrollView>
        <Column p={4}>
          <Text p={4} bold fontSize="4xl">My Tools</Text>
          {(borrowingToolsList.length > 0)
              ? borrowingToolsList.map(tool => {
                return <LenderInventoryItem navigation={navigation}
                                            key={tool.id + tool.name}
                                            tool={tool}/>;
              })

              : <Center>
                <Text>You aren't borrowing any tools right now. Go find some!</Text>
                <Button onPress={() => {
                  navigation.getParent()!.navigate("SearchBrowse");
                }}>Browse Tools</Button>
              </Center>}
        </Column>
        <Spacer/>
      </ScrollView>
  );
};

export default BorrowerInventory;