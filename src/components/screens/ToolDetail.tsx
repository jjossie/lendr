import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {Column, Heading, Text} from "native-base";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {getToolById} from "../../controllers/Tool";
import {ITool} from "../../models/Tool";
import LenderProfilePreview from "../LenderProfilePreview";


const ToolDetail: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {
  // State
  const [toolData, setToolData] = useState<ITool | undefined>();
  console.debug(`ToolDetail rendering with Tool: ${toolData?.name}`);
  console.debug(toolData);

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

  return (
      <ScrollView>
        {toolData ? <Column bg="#FFF" p={5} space={3}>
          <Heading>{toolData.brand} {toolData.name}</Heading>
          <Text fontWeight={500}
                fontSize={"lg"}><Text bold fontSize={"2xl"}>${toolData.rate?.price}</Text>/{toolData.rate?.timeUnit}</Text>
          <Text fontSize="md">{toolData.description}</Text>

          <Heading paddingTop={4} size="sm">Lender</Heading>
          <LenderProfilePreview user={toolData.lender!}/>

          <Heading paddingTop={4} size="sm">Details</Heading>
          <Text>
            {toolData.preferences?.localPickup ? "✅ Local pickup" : "❌ No Local Pickup"}
          </Text>
          <Text>
            {toolData.preferences?.delivery ? "✅ Will deliver" : "❌ No delivery"}
          </Text>
          <Text>
            {toolData.preferences?.useOnSite ? "✅ Available to use at lender location" : "❌ Not available to use at lender location"}
          </Text>
        </Column> : null}
      </ScrollView>
  );
};

export default ToolDetail;