import React, {useEffect, useState} from 'react';
import {Button, Column, Heading, Image, Row, ScrollView, Text, useTheme} from "native-base";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {getToolById} from "../../controllers/tool";
import {Tool} from "../../models/tool";
import LenderProfilePreview from "../LenderProfilePreview";
import {createRelation} from "../../controllers/relation";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import Carousel from "../utilities/Carousel";
import {AntDesign} from "@expo/vector-icons";


const ToolDetail: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {
  // State
  const [toolData, setToolData] = useState<Tool | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const {authUser} = useAuthentication();
  const {colors} = useTheme();  console.log(`🌀ToolDetail rendering with Tool: ${toolData?.name}`);

  // Side Effect
  useEffect(() => {
    getToolById(route.params?.toolId)
        .then(data => {
          setToolData(data!);
        })
        .catch((e) => {
          console.log("🌀Error in retrieving ToolData 👹");
          console.log(e.message);
          navigation.goBack();
        });
  }, []);


  // Callbacks
  const handleSendMessage = async () => {
    try {
      setIsLoading(true);
      const relationId = await createRelation(toolData!.lenderUid, toolData!.id!);
      console.log("🌀Created new relation: ", relationId);
      setIsLoading(false);

      navigation.navigate("Inbox", {
        screen: "ChatConversation",
        params: {
          relationId,
          draftMessage: `Hey, I'm interested in this ${toolData?.name ?? "tool"}!`,
        },
      });
    } catch (e) {
      console.log("🌀Failed to create relation", e);
    }
  };

  const keywordString = toolData?.name.split(" ").join(",");

  const imageUrl = toolData?.imageUrls && toolData.imageUrls.length > 0
      ? toolData.imageUrls[0]
      : `https://source.unsplash.com/random/?${keywordString},tool`;

  const isOwner = toolData?.lenderUid === authUser?.uid;

  console.log("🌀< ToolDetail > ImageURLs: ", JSON.stringify(toolData?.imageUrls, null, 2));


  return (
      <ScrollView>
        {toolData ?
            <>
              {(toolData.imageUrls?.length < 2)
                  ?
                  <Image source={{uri: imageUrl}} w={"100%"} h={280} alt={toolData.name}/>
                  :
                  <Carousel items={
                    toolData.imageUrls.map((url, index) => {
                      console.log("URL: ", url);
                      return (<Image key={`${toolData.name}_${index}`}
                                     source={{uri: url}}
                                     w={"100%"}
                                     h={280}
                                     alt={`${toolData.name}_${index}`}/>);
                    })}
                  />
              }
              <Column bg="#FFF" p={5} space={3}>
                <Heading fontSize={"lg"}>{toolData.brand} {toolData.name}</Heading>
                <Text fontWeight={500}
                      fontSize={"lg"}><Text bold
                                            fontSize={"2xl"}>${toolData.rate?.price}</Text>/{toolData.rate?.timeUnit}
                </Text>
                <Text fontSize="md">{toolData.description}</Text>

                <Heading fontSize={"lg"} pt={4} size="sm">Location</Heading>
                <Text fontSize="sm">📍{toolData.location.city}</Text>

                <Heading fontSize={"lg"} pt={4} size="sm">Lender</Heading>
                <LenderProfilePreview user={toolData.lender!}/>

                {!isOwner && <Button onPress={handleSendMessage}
                                     mt={4}
                                     isLoading={isLoading}
                                     isLoadingText={"Loading"}
                                     isDisabled={isLoading}>Message Lender</Button>}

                <Heading fontSize={"lg"} pt={4} size="sm">Details</Heading>

                {toolData.preferences?.localPickup
                    ? (<Row alignItems={"center"} space={2}>
                      <AntDesign name="checkcircle" p={2} size={24} color={colors.success[500]}/>
                      <Text fontSize={"md"}
                            p={2}>Local pickup</Text>
                    </Row>)
                    : (<Row alignItems={"center"} space={2}>
                      <AntDesign name="closecircle" p={2} size={24} color={colors.secondary[500]}/>
                      <Text fontSize={"md"} p={2}>No local pickup</Text>
                    </Row>)
                }

                {toolData.preferences?.delivery
                    ? (<Row alignItems={"center"} space={2}>
                      <AntDesign name="checkcircle" p={2} size={24} color={colors.success[500]}/>
                      <Text fontSize={"md"}
                            p={2}>Will deliver</Text>
                    </Row>)
                    : (<Row alignItems={"center"} space={2}>
                      <AntDesign name="closecircle" p={2} size={24} color={colors.secondary[500]}/>
                      <Text fontSize={"md"} p={2}>No delivery</Text>
                    </Row>)
                }

                {toolData.preferences?.useOnSite
                    ? (<Row alignItems={"center"} space={2}>
                      <AntDesign name="checkcircle" p={2} size={24} color={colors.success[500]}/>
                      <Text fontSize={"md"}
                            p={2}>Available to use at lender location</Text>
                    </Row>)
                    : (<Row alignItems={"center"} space={2}>
                      <AntDesign name="closecircle" p={2} size={24} color={colors.secondary[500]}/>
                      <Text fontSize={"md"} p={2}>Not available to use at lender location</Text>
                    </Row>)
                }


              </Column>
            </> : null}

      </ScrollView>
  );
};

export default ToolDetail;

