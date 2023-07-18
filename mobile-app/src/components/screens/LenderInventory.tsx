import React from 'react';
import {Button, Column, ScrollView, Text} from 'native-base';
import LenderInventoryItem from "../LenderInventoryItem";
import Spacer from "../utilities/Spacer";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useMyTools} from "../../utils/hooks/useMyTools";

const LenderInventory: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {

  // State
  const {lendingToolsList} = useMyTools();

  // Side Effects

  return (
      <ScrollView>
        <Column p={4}>
          <Text p={4} bold fontSize="4xl">Lending</Text>
          {lendingToolsList.map(tool => {
            return <LenderInventoryItem navigation={navigation}
                                        key={tool.id + tool.name}
                                        tool={tool}/>;
          })}
          <Button w="50%"
                  mx="auto"
                  my={8}
                  variant="solid"
                  size="lg"
                  onPress={() => {
                    navigation.navigate("EditTool");
                  }}>Add New Tool</Button>
        </Column>
        <Spacer/>
      </ScrollView>
  );
};

export default LenderInventory;