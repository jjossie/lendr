import React, {useEffect, useState} from 'react';
import {Button, Column, Heading, Image, ScrollView, Text} from "native-base";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {getToolById} from "../../controllers/tool";
import {ITool} from "../../models/Tool";
import LenderProfilePreview from "../LenderProfilePreview";
import {createRelation} from "../../controllers/relation";
import {useAuthentication} from "../../utils/hooks/useAuthentication";


const ToolDetail: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {
  // State
  const [toolData, setToolData] = useState<ITool | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const {authUser} = useAuthentication();
  console.log(`❇️ToolDetail rendering with Tool: ${toolData?.name}`);

  // Side Effect
  useEffect(() => {
    getToolById(route.params?.toolId)
        .then(data => {
          setToolData(data!);
        })
        .catch((e) => {
          console.log("❇️Error in retrieving ToolData 👹");
          console.log(e.message);
          navigation.goBack();
        });
  }, []);


  // Callbacks
  const handleSendMessage = async () => {
    try {
      setIsLoading(true);
      const relationId = await createRelation(toolData!.lenderUid, toolData!.id!);
      console.log("❇️Created new relation: ", relationId);
      // await sendChatMessage(toolData!.lenderUid, "Hey, I'm interested in this tool!");
      setIsLoading(false);
      navigation.getParent()!.navigate("Chat", {
        screen: "ChatConversation",
        params: {relationId, draftMessage: `Hey, I'm interested in this ${toolData?.name ?? "tool"}!`},
      });
    } catch (e) {
      console.log("❇️Failed to create relation", e);
    }
  };

  const keywordString = toolData?.name.split(" ").join(",");

  const imageUrl = toolData?.imageUrls && toolData.imageUrls.length > 0
      ? toolData.imageUrls[0]
      : `https://source.unsplash.com/random/?${keywordString},tool`;

  const isOwner = toolData?.lenderUid === authUser?.uid;

  return (
      <ScrollView>
        {toolData ?
            <>
              <Image source={{uri: imageUrl}} w={"100%"} h={280} alt={toolData.name}/>
              <Column bg="#FFF" p={5} space={3}>
                <Heading>{toolData.brand} {toolData.name}</Heading>
                <Text fontWeight={500}
                      fontSize={"lg"}><Text bold
                                            fontSize={"2xl"}>${toolData.rate?.price}</Text>/{toolData.rate?.timeUnit}
                </Text>
                <Text fontSize="md">{toolData.description}</Text>

                <Heading pt={4} size="sm">Location</Heading>
                <Text fontSize="sm">📍{toolData.location.city}</Text>

                <Heading pt={4} size="sm">Lender</Heading>
                <LenderProfilePreview user={toolData.lender!}/>

                {!isOwner && <Button onPress={handleSendMessage}
                                     mt={4}
                                     isLoading={isLoading}
                                     isLoadingText={"Loading"}
                                     isDisabled={isLoading}>Message Lender</Button>}

                <Heading pt={4} size="sm">Details</Heading>
                <Text>
                  {toolData.preferences?.localPickup ? "✅ Local pickup" : "❌ No Local Pickup"}
                </Text>
                <Text>
                  {toolData.preferences?.delivery ? "✅ Will deliver" : "❌ No delivery"}
                </Text>
                <Text>
                  {toolData.preferences?.useOnSite ? "✅ Available to use at lender location" : "❌ Not available to use at lender location"}
                </Text>


              </Column>
            </> : null}

      </ScrollView>
  );
};

export default ToolDetail;

