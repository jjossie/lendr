import React, {useCallback, useEffect, useState} from "react";
import {
  Alert,
  Button,
  Center,
  Column,
  FormControl,
  Input,
  Row,
  ScrollView,
  Slider,
  Switch,
  Text,
  TextArea,
  theme,
} from "native-base";
import {ExchangePreferences, IToolForm, TimeUnit} from "../../models/Tool";
import {createTool} from "../../controllers/Tool";

export interface EditToolProps {
  toolId: string;
  navigation: any;
}


const EditTool = (props: EditToolProps) => {
  useEffect(() => {
    // Get data for this tool if editing one, or leave blank if not editing a tool
  });


  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Form state
  const [name, setName] = useState("Hammer");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(25);
  const [timeUnit, setTimeUnit]: [TimeUnit, any] = useState("day");
  const [preferences, setPreferences]: [ExchangePreferences, any] = useState({
    delivery: false,
    localPickup: false,
    useOnSite: false,
  });


  // Callbacks

  const handleCreateTool = useCallback(() => {
    console.log("HandleCreateTool called");
    setIsLoading(true);
    setIsError(false);

    const newTool: IToolForm = {
      name,
      description,
      rate: {
        price: price,
        timeUnit: timeUnit,
      },
      preferences,
    };
    // TODO validate that newTool has no null values
    createTool(newTool).then(() => {
      console.log("Tool Created!");
      setIsLoading(false);
      props.navigation.navigate('Home')
    }).catch((e) => {
      console.log("Failed to create tool");
      setIsError(true);
      console.log(e);
    });
  }, [name, description, price, timeUnit, preferences]);

  return (
      <ScrollView bg={theme.colors.white}>
        {isError && <Alert w="100%" status="error">Failed to create tool. 👹</Alert> }
        <Column alignItems="center" space={4} mx={3} my={4} py={12}>
          {/* Basic Text Input */}
          <FormControl isRequired>
            <FormControl.Label>Tool Name</FormControl.Label>
            <Input
                onChangeText={value => {setName(value);}}
                size="lg"
                variant="filled"
                placeholder="Hammer"/>
          </FormControl>
          <FormControl isRequired>
            <FormControl.Label>Description</FormControl.Label>
            <TextArea
                onChangeText={value => {setDescription(value);}}
                autoCompleteType={undefined}
                h={20}
                placeholder={`Tell us about the ${name}`}
                size="lg"
                variant="filled"/>
          </FormControl>

          {/* Rate */}
          <Column alignItems="center" space={4} w="75%">
            <Text bold fontSize="lg">Rate</Text>
            <Row width="100%" alignItems="center" justifyContent="space-between" space={4}>
              <Button h={12}
                      w={12}
                      p={0}
                      onPressIn={() => {
                        setPrice(price - 1);
                      }}>
                <Center><Text lineHeight="2xs" bold color={theme.colors.white} fontSize={48}>-</Text></Center>
              </Button>
              <Text bold fontSize="7xl">${price}</Text>
              <Button h={12}
                      w={12}
                      p={0}
                      onPressIn={() => {
                        setPrice(price + 1);
                      }}>
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
                  // @ts-ignore
                  variant={(timeUnit == "hour") ? "solid" : "outline"}>Hour</Button>
              <Button
                  onPressIn={() => setTimeUnit("day")}
                  variant={(timeUnit == "day") ? "solid" : "outline"}>Day</Button>
              <Button
                  onPressIn={() => setTimeUnit("week")}
                  // @ts-ignore
                  variant={(timeUnit == "week") ? "solid" : "outline"}>Week</Button>
            </Button.Group>
          </Column>

          {/* Borrowing Preference Switches*/}
          <Column space={6} w="100%" px={4}>
            <Row space={4} alignItems="center">
              <Switch onValueChange={set => {setPreferences({...preferences, delivery: set})}} size="md"/>
              <Text fontSize="md">Willing to deliver to borrower</Text>
            </Row>
            <Row space={4} alignItems="center">
              <Switch onValueChange={set => {setPreferences({...preferences, localPickup: set})}} size="md"/>
              <Text fontSize="md">Borrower can come pick up</Text>
            </Row>
            <Row space={4} alignItems="center">
              <Switch onValueChange={set => {setPreferences({...preferences, useOnSite: set})}} size="md"/>
              <Text fontSize="md">Borrower can use it here</Text>
            </Row>
          </Column>

          <Button w="50%"
                  variant="solid"
                  size="lg"
                  disabled={isLoading}
                  onPress={handleCreateTool}>Create Stuff</Button>

        </Column>
      </ScrollView>
  );
};

export default EditTool;