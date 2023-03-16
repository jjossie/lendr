import React, {useCallback, useEffect, useState} from "react";
import {Button, Column, Input, Row, ScrollView, Switch, Text, TextArea, theme} from "native-base";
import {addDoc, collection} from "firebase/firestore/lite";
import {db} from "../../models/firebase";
import {ITool} from "../../models/Tool";

export interface EditToolProps {
  toolId: string;
}


function createTool() {
  // test create doc
  const newTool: ITool = {
    brand: "Craftsman",
    description: "This is literally my dad's, idk why I have it",
    lender: {name: "Clark Kent", rating: 4.5, profileImgPath: ""},
    name: "Table Saw",
    preferences: {
      delivery: false,
      localPickup: true,
      useOnSite: false,
    },
    rate: {
      price: 26,
      timeUnit: "day",
    },
  };

  return addDoc(collection(db, "tools"), newTool);
}

const EditTool = (props: EditToolProps) => {

  useEffect(() => {
    // Get data for this tool if editing one, or leave blank if not editing a tool

  });

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const saveHandler = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    createTool().then(() => {
      setIsLoading(false);
    }).catch((e) => {
      setIsError(true);
      console.log(e);
    });
  }, []);

  return (
      <ScrollView bg={theme.colors.white}>
        <Column alignItems="center" space={4} mx={3} my={4} py={12}>
          <Input size="lg" variant="filled" placeholder="Item name"/>
          <Input size="lg" variant="filled" placeholder="Brand"/>
          <TextArea autoCompleteType={undefined} h={20} placeholder="Description" size="lg" variant="filled"/>

          <Column space={6} w="100%" px={4}>
            <Row space={4} alignItems="center">
              <Switch size="md"/>
              <Text fontSize="md">Willing to deliver to borrower</Text>
            </Row>
            <Row space={4} alignItems="center">
              <Switch size="md"/>
              <Text fontSize="md">Borrower can come pick up</Text>
            </Row>
            <Row space={4} alignItems="center">
              <Switch size="md"/>
              <Text fontSize="md">Borrower can use it here</Text>
            </Row>
          </Column>

          <Button w="50%" variant="solid" size="lg" onPress={saveHandler}>Create Stuff</Button>
        </Column>
      </ScrollView>
  );
};

export default EditTool;