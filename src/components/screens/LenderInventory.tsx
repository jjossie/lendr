import React from 'react';
import {Button, Column, ScrollView, Text} from 'native-base';
import LenderInventoryItem from "../LenderInventoryItem";
import Spacer from "../utilities/Spacer";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useMyTools} from "../../utils/hooks/useMyTools";

const LenderInventory: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {

  // State
  const {authUser} = useAuthentication();
  const toolsList = useMyTools(authUser);

  // Side Effects

  // Callbacks
  // const onToolAdded = (newTool: ITool) => {
  //   setToolsList((old: ITool[]) => [...old, newTool]);
  // }

  return (
      <ScrollView>
        <Column>
          <Text p={4} bold fontSize="4xl">My Tools</Text>
          {toolsList.map(tool => { // Key should be different probably
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