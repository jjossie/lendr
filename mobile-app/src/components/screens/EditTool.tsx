// noinspection ExceptionCaughtLocallyJS

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
import {ExchangePreferences, IToolForm, TimeUnit} from "../../models/Tool";
import {createTool, deleteTool, editTool, getNextToolId, getToolById} from "../../controllers/tool";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Keyboard} from "react-native";
import {useLocation} from "../../utils/hooks/useLocation";
import ToolImagePicker from "../ToolImagePicker";
import {deleteToolImageFromFirebase, uploadToolImageToFirebase} from "../../controllers/storage";
import {AuthError, LendrBaseError, NotFoundError} from "../../utils/errors";
import {useAuthentication} from "../../utils/hooks/useAuthentication";

const DEFAULT_NAME = "";
const DEFAULT_DESCRIPTION = "";
const DEFAULT_PRICE = 25;
const DEFAULT_TIME_UNIT = "day";
const DEFAULT_BRAND = "";
const DEFAULT_PREFERENCES: ExchangePreferences = {
  delivery: false,
  localPickup: false,
  useOnSite: false,
};


const EditTool: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {

  // Component UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Failed to create tool. 👹");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Nonsense
  const [unsubBeforeRemove, setUnsubBeforeRemove] = useState<(() => void) | undefined>();
  const [unsubOnBlur, setUnsubOnBlur] = useState<(() => void) | undefined>();

  // Form state
  const [toolId, setToolId] = useState(route.params?.toolId ?? "");
  const [toolExists, setToolExists] = useState(false);

  const [name, setName] = useState(DEFAULT_NAME);
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>(DEFAULT_TIME_UNIT);
  const [preferences, setPreferences] = useState<ExchangePreferences>(DEFAULT_PREFERENCES);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const {geopoint, errorMsg} = useLocation();
  if (errorMsg) {
    console.log("❇️UseLocation ErrorMsg:", errorMsg); // TODO if there's an error message, editTool will never load. Fix that.
  }

  const {authUser} = useAuthentication();

  // Derived Component UI state
  const [isEditing, setIsEditing] = useState((toolId)); // Defines whether the EditTool window was opened on an
                                                        // existing tool or a new tool


  // References
  const cancelRef = useRef(null);

  // Side Effects
  useEffect(() => {
    (async () => {

      // Get data for this tool if editing one, or leave blank if not editing a tool
      if (toolId) {
        // We're editing a tool, so fetch it
        setIsEditing(true);
        setIsLoading(true);
        try {
          const tool = await getToolById(toolId);
          if (!tool)
            throw new NotFoundError("Tool Object not returned by getToolById()");
          setName(tool.name);
          setDescription(tool.description);
          setPrice(tool.rate.price);
          setBrand(tool.brand ?? "");
          setTimeUnit(tool.rate.timeUnit);
          setPreferences(tool.preferences);
          setIsLoading(false);
          setImageUrls(tool.imageUrls);
        } catch (e) {
          console.log(e);
        }

      } else {
        // First-time Page Open on Creating a new tool
        setRetryCount(1);
      }
    })();
  }, []);

  useEffect(() => {
    /**
     * Handles the initial saving of a tool with retries since geopoint is often uninitialized.
     */
    (async () => {
      if (retryCount < 1) return;
      try {
        // Try saving the tool as a draft
        setIsLoading(true);
        await createInitialDraftTool();
        setIsLoading(false);
        setIsError(false);
      } catch (error: any) {
        console.log(`❇️Create Initial Draft Tool Failed on attempt ${retryCount}:`, error?.message);
        // Retry the callback with a delay if an error occurs
        if (retryCount < 5) {
          setTimeout(() => setRetryCount(retryCount + 1), 2000); // Retry after 2 seconds
        } else {
          setErrorMessage("Failed to create draft tool");
          setIsError(true);
        }
      }
    })();
  }, [retryCount, geopoint, toolId]); // Retry whenever retryCount changes

  useEffect(() => {
    console.log("❇️useEffect:toolId:", toolId);
    if (unsubOnBlur) unsubOnBlur();
    if (unsubBeforeRemove) unsubBeforeRemove();
    const unsubB = navigation.addListener("blur", (e) => {
      console.log("❇️Blur", e.type);
      deleteDraftIfUnedited();
    });
    setUnsubOnBlur(unsubB);
    const unsubBR = navigation.addListener("beforeRemove", (e) => {
      console.log("❇️BeforeRemove", e.type);
      deleteDraftIfUnedited();
    });
    setUnsubBeforeRemove(unsubBR);
  }, [toolId]);


  // Callbacks
  const deleteDraftIfUnedited = () => {
    // Delete the tool if the draft tool is unchanged
    console.log("❇️Attempting to delete draft");
    if (
        !isEditing &&
        name == DEFAULT_NAME &&
        description == DEFAULT_DESCRIPTION &&
        price == DEFAULT_PRICE &&
        timeUnit == DEFAULT_TIME_UNIT &&
        preferences == DEFAULT_PREFERENCES &&
        imageUrls.length == 0 &&
        brand == DEFAULT_BRAND
        && toolId
    ) {
      // Delete the tool
      deleteTool(toolId).then(() => {
        console.log("❇️Deleted draft tool");
      });
    }
  };

  const handleSaveTool = useCallback(async (publish: boolean = false) => {
    setIsLoading(true);
    setIsError(false);

    let toolForm: IToolForm = {
      name,
      imageUrls,
      description,
      rate: {
        price: price,
        timeUnit: timeUnit,
      },
      preferences,
      geopoint,
      visibility: "draft",
    };
    if (brand) toolForm.brand = brand;
    if (!toolId) throw new LendrBaseError("RAAAAAHHHH");
    try {
      // Save existing tool
      if (publish) toolForm.visibility = "published";
      await editTool(toolId, toolForm);
      console.log("❇️Tool Saved!");
      setIsLoading(false);
      navigation.goBack();
    } catch (e) {
      console.log("❇️Failed to edit tool 📛");
      console.error(e);
      setErrorMessage("Failed to save tool");
      setIsError(true);
      setIsLoading(false);
    }

  }, [name, imageUrls, description, price, timeUnit, preferences, geopoint, brand, toolId, navigation]);

  const createInitialDraftTool = useCallback(async () => {
    // setIsLoading(true);
    setIsError(false);

    let toolForm: IToolForm = {
      name,
      imageUrls,
      description,
      rate: {
        price: price,
        timeUnit: timeUnit,
      },
      preferences,
      geopoint,
      visibility: "draft",
    };
    if (brand) toolForm.brand = brand;
    if (toolExists) {
      console.log("❇️Tool already exists");
      return;
    }
    if (!toolId) {
      const nextToolId = getNextToolId();
      console.log("❇️Next Tool ID: " + nextToolId);
      setToolId(nextToolId);
      return;
    }
    try {
      // Create new tool. This will be done immediately when "Add New Tool" is clicked.
      console.log("❇️Attempting to create draft tool");
      await createTool(toolForm, toolId);
      setToolExists(true);
      setIsLoading(false);
    } catch (e) {
      console.log("❇️Failed to create tool");
      console.log(e);
      setIsLoading(false);
      throw e;
    }

  }, [name, imageUrls, description, price, timeUnit, preferences, geopoint, brand, toolId, toolExists]);

  const handleDeleteTool = useCallback(async () => {
    setIsLoading(true);

    try {
      await deleteTool(toolId);
      setIsLoading(false);
      setIsAlertOpen(false);
      navigation.goBack();
    } catch (e) {
      console.log(e);
      setIsError(true);
      setErrorMessage("Failed to delete tool. 👺");
      setIsAlertOpen(false);
      setIsLoading(false);
    }
  }, [toolId, navigation]);

  const handleSelectImage = async (uri: string, index = 0) => {
    console.log("❇️handleSelectImage()");
    if (!authUser)
      throw new AuthError("Cannot upload image a user associated");

    const imageUrl = await uploadToolImageToFirebase(uri, toolId, index);
    if (!imageUrl)
      throw new LendrBaseError(`Image url was blank: ${imageUrl}`);
    console.log("❇️ImageUrl: " + imageUrl);

    setImageUrls(list => [...list, imageUrl]);
    console.log("❇️Downloadable Image URL: " + imageUrl);
  };

  const handleDeleteImage = async (uri: string, index = 0) => {
    console.log("❇️handleDeleteImage()");
    if (!toolId)
      throw new LendrBaseError("Cannot delete image without a tool ID");
    try {
      await deleteToolImageFromFirebase(toolId);
      console.log("❇️Tool deleted successfully");
    } catch (e) {
      throw new LendrBaseError("Failed to delete tool image");
    }
  };


  return (
      <ScrollView bg={theme.colors.white} onScroll={() => Keyboard.dismiss()} scrollEventThrottle={2} paddingTop={10}>
        <ToolImagePicker
            onSelectImage={handleSelectImage}
            onRemoveImage={handleDeleteImage}
            // existingImageUrl={(imageUrls && imageUrls.length > 0) ? imageUrls[0] : undefined}
            existingImageUrls={imageUrls}
        />

        <Column alignItems="center" space={4} mx={3} my={4} paddingY={12}>


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
          <FormControl>
            <FormControl.Label>Brand</FormControl.Label>
            <Input
                onChangeText={value => {
                  setBrand(value);
                }}
                size="lg"
                placeholder={"DeWalt"}
                value={brand}
                variant="filled"/>
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
            <Slider defaultValue={15}  onChange={v => {
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
                  onPress={() => {handleSaveTool(true)}}>{isEditing ? "Save Edits" : "Publish Tool"}</Button>

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
                      <Button variant="unstyled" colorScheme="coolGray" onPress={() => setIsAlertOpen(false)}
                              ref={cancelRef}>
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