import React, {useCallback, useEffect, useRef, useState} from "react";
import {
  Alert,
  AlertDialog,
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
import {ExchangePreferences, ITool, IToolForm, TimeUnit} from "../../models/Tool";
import {createTool, deleteTool, editTool, getToolById} from "../../controllers/Tool";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Keyboard} from "react-native";
import {useLocation} from "../../utils/hooks/useLocation";


const EditTool: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {

  // Component UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Failed to create tool. 👹");
  const [isEditing, setIsEditing] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(25);
  const [timeUnit, setTimeUnit]: [TimeUnit, any] = useState("day");
  const [preferences, setPreferences]: [ExchangePreferences, any] = useState({
    delivery: false,
    localPickup: false,
    useOnSite: false,
  });
  const {geopoint} = useLocation();

  // References
  const cancelRef = useRef(null);

  // Side Effects
  useEffect(() => {
    // Get data for this tool if editing one, or leave blank if not editing a tool
    if (route.params?.toolId) {

      // We're editing a tool, so fetch it
      setIsEditing(true);
      setIsLoading(true);
      getToolById(route.params?.toolId)
          .then((tool: ITool | undefined) => {
            setName(tool!.name);
            setDescription(tool!.description);
            setPrice(tool!.rate.price);
            setTimeUnit(tool!.rate.timeUnit);
            setPreferences(tool!.preferences);
            setIsLoading(false);
          })
          .catch(e => console.error(e));

    } else {
      // Not editing - creating a new one
      setIsEditing(false);
    }
  }, []);

  // Callbacks
  const handleSaveTool = useCallback(() => {
    setIsLoading(true);
    setIsError(false);

    const toolForm: IToolForm = {
      name,
      description,
      rate: {
        price: price,
        timeUnit: timeUnit,
      },
      preferences,
      geopoint
    };
    if (!isEditing) {
      // Create new tool
      createTool(toolForm).then(() => {
        console.log("Tool Created!");
        setIsLoading(false);
        navigation.goBack();
      }).catch((e) => {
        console.log("Failed to create tool");
        console.log(e);
        setErrorMessage("Failed to create tool");
        setIsError(true);
        setIsLoading(false);
      });
    } else {
      // Save existing tool
      editTool(route.params?.toolId, toolForm).then(() => {
        console.log("Tool Saved!");
        setIsLoading(false);
        navigation.goBack();
      }).catch((e) => {
        console.log("Failed to edit tool");
        console.log(e);
        setErrorMessage("Failed to edit tool");
        setIsError(true);
        setIsLoading(false);
      });
    }
  }, [name, description, price, timeUnit, preferences, geopoint, isEditing]);


  const handleDeleteTool = useCallback(async () => {
    setIsLoading(true);

    try {
      await deleteTool(route.params?.toolId);
      setIsLoading(false);
      setIsAlertOpen(false);
      navigation.goBack();
    } catch (e) {
      console.log(e);
      setIsError(true);
      setErrorMessage("Failed to delete tool. 👺")
      setIsAlertOpen(false);
      setIsLoading(false);
    }
  }, [route.params?.toolId, navigation]);

  return (
      <ScrollView bg={theme.colors.white} onScroll={() => Keyboard.dismiss()} >
        <Column alignItems="center" space={4} mx={3} my={4} py={12}>
          {/* Basic Text Input */}
          <FormControl isRequired>
            <FormControl.Label>Tool Name</FormControl.Label>
            <Input
                onChangeText={value => {
                  setName(value);
                }}
                size="lg"
                variant="filled"
                value={name}
                placeholder="Hammer"/>
          </FormControl>
          <FormControl isRequired>
            <FormControl.Label>Description</FormControl.Label>
            <TextArea
                onChangeText={value => {
                  setDescription(value);
                }}
                autoCompleteType={undefined}
                h={20}
                placeholder={`Tell us about the ${name}`}
                size="lg"
                value={description}
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
              <Switch
                  onValueChange={set => {
                    setPreferences({...preferences, delivery: set});
                  }}
                  value={preferences.delivery}
                  size="md"/>
              <Text fontSize="md">Willing to deliver to borrower</Text>
            </Row>
            <Row space={4} alignItems="center">
              <Switch
                  onValueChange={set => {
                    setPreferences({...preferences, localPickup: set});
                  }}
                  value={preferences.localPickup}
                  size="md"/>
              <Text fontSize="md">Borrower can come pick up</Text>
            </Row>
            <Row space={4} alignItems="center">
              <Switch
                  onValueChange={set => {
                    setPreferences({...preferences, useOnSite: set});
                  }}
                  value={preferences.useOnSite}
                  size="md"/>
              <Text fontSize="md">Borrower can use it here</Text>
            </Row>
          </Column>

          {isError && <Alert w="100%" status="error">{errorMessage}</Alert>}

          <Button w="50%"
                  variant="solid"
                  size="lg"
                  isLoading={isLoading}
                  isLoadingText=""
                  spinnerPlacement="start"
                  onPress={handleSaveTool}>{isEditing ? "Save Edits" : "Publish Tool"}</Button>

          {isEditing &&
            <>
              <Button w="50%"
                      variant="outline"
                      colorScheme="danger"
                      size="lg"
                      isLoading={isLoading}
                      isLoadingText=""
                      spinnerPlacement="start"
                      onPress={() => setIsAlertOpen(true)}>{"Delete Tool"}</Button>

              <AlertDialog leastDestructiveRef={cancelRef} isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
                <AlertDialog.Content>
                  <AlertDialog.CloseButton/>
                  <AlertDialog.Header>Delete Tool</AlertDialog.Header>
                  <AlertDialog.Body>
                    This will permanently delete this tool. Are you sure?
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <Button.Group space={2}>
                      <Button variant="unstyled" colorScheme="coolGray" onPress={() => setIsAlertOpen(false)} ref={cancelRef}>
                        Cancel
                      </Button>
                      <Button colorScheme="danger" onPress={handleDeleteTool}>
                        Delete
                      </Button>
                    </Button.Group>
                  </AlertDialog.Footer>
                </AlertDialog.Content>
              </AlertDialog>
            </>
          }
        </Column>
      </ScrollView>
  );
};

export default EditTool;