import React, {useCallback, useEffect, useState} from "react";
import {Button, Center, Column, Input, Row, ScrollView, Slider, Switch, Text, TextArea, theme} from "native-base";
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
  console.log("Re-Rendering!");
  useEffect(() => {
    // Get data for this tool if editing one, or leave blank if not editing a tool

  });

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Form state
  const [price, setPrice] = useState(15);
  const [timeUnit, setTimeUnit] = useState("day");

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
          {/* Basic Text Input */}
          <Input size="lg" variant="filled" placeholder="Item name"/>
          <Input size="lg" variant="filled" placeholder="Brand"/>
          <TextArea autoCompleteType={undefined} h={20} placeholder="Description" size="lg" variant="filled"/>

          {/* Rate */}
          <Column alignItems="center" space={4} w="75%">
            <Text bold fontSize="lg">Rate</Text>
            <Row width="100%" alignItems="center" justifyContent="space-between" space={4}>
              <Button h={12} w={12} p={0} onPressIn={() => setPrice(price - 1)}>
                <Center><Text lineHeight="2xs" bold color={theme.colors.white} fontSize={48}>-</Text></Center>
              </Button>
              <Text bold fontSize="7xl">${price}</Text>
              <Button h={12} w={12} p={0} onPressIn={() => setPrice(price + 1)}>
                <Center><Text lineHeight="2xs" bold color={theme.colors.white} fontSize={48}>+</Text></Center>
              </Button>
            </Row>
            <Slider defaultValue={15} colorScheme="cyan" onChange={v => {
              setPrice(Math.floor(v));
            }}>
              <Slider.Track>
                <Slider.FilledTrack/>
              </Slider.Track>
              <Slider.Thumb/>
            </Slider>
            <Text fontSize="lg">Per</Text>
            <Button.Group isAttached size="lg">
              <Button
                  onPressIn={() => setTimeUnit("hour")}
                  variant={(timeUnit == "hour") ? "solid" : "outline"}>Hour</Button>
              <Button
                  onPressIn={() => setTimeUnit("day")}
                  variant={(timeUnit == "day") ? "solid" : "outline"}>Day</Button>
              <Button
                  onPressIn={() => setTimeUnit("week")}
                  variant={(timeUnit == "week") ? "solid" : "outline"}>Week</Button>
            </Button.Group>
          </Column>

          {/* Borrowing Preference Switches*/}
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