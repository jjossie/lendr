import React, {useEffect, useState} from 'react';
import {Image, ScrollView, StyleSheet} from 'react-native';
import {Button, Column, Heading, Text} from "native-base";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {getToolById} from "../../controllers/Tool";
import {ITool} from "../../models/Tool";
import LenderProfilePreview from "../LenderProfilePreview";


const ToolDetail: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {
  // State
  const [toolData, setToolData] = useState<ITool | undefined>();
  console.debug(`ToolDetail rendering with Tool: ${toolData?.name}`);

  // Side Effect
  useEffect(() => {
    getToolById(route.params?.toolId)
        .then(data => {
          setToolData(data!);
        })
        .catch((e) => {
          console.log("Error in retrieving ToolData 👹");
          console.log(e.message);
          navigation.goBack();
        });
  }, []);


  const keywordString = toolData?.name.split(" ").join(",");

  return (
      <ScrollView>
        {toolData ?
            <>
              <Image source={{uri: `https://source.unsplash.com/random/?${keywordString},tool`}} style={style.image}/>
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

                <Button onPress={() => navigation.navigate("")} mt={4}>Message Lender</Button>

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

const style = StyleSheet.create({
  image: {
    width: "100%",
    height: 240,
  },
});