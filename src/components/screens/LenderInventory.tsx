import React, {useEffect, useState} from 'react';
import {Button, Column, ScrollView, Text} from 'native-base';
import {getAllTools} from "../../controllers/Tool";
import {ITool} from "../../models/Tool";
import LenderInventoryItem from "../LenderInventoryItem";
import Spacer from "../utilities/Spacer";

export interface LenderInventoryProps {
  navigation: any
}

const LenderInventory: React.FC<LenderInventoryProps> = (props: LenderInventoryProps) => {

  const [toolsList, setToolsList]: [ITool[], any] = useState([]);

  // Side Effects
  useEffect(() => {
    getAllTools().then(tools => {
      setToolsList(tools);
    });
  }, [toolsList]);

  // Callbacks
  // const onToolAdded = (newTool: ITool) => {
  //   setToolsList((old: ITool[]) => [...old, newTool]);
  // }

  return (
      <ScrollView>
        <Column>
          <Text p={4} bold fontSize="4xl">My Tools</Text>
          {toolsList.map(tool => { // Key should be different probably
            return <LenderInventoryItem navigation={props.navigation}
                                        key={tool.name}
                                        tool={tool}/>;
          })}
          <Button w="50%"
                  mx="auto"
                  my={8}
                  variant="solid"
                  size="lg"
                  onPress={() => {
                    props.navigation.navigate("EditTool");
                  }}>Add New Tool</Button>
        </Column>
        <Spacer/>
      </ScrollView>
  );
}
  ;

  export default LenderInventory;