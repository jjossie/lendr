import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {Column, Heading, Text} from "native-base";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {getToolById} from "../../controllers/Tool";
import {ITool} from "../../models/Tool";


const ToolDetail: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {

  const [toolData, setToolData] = useState<ITool | undefined>(undefined);
  useEffect(() => {
    getToolById()
        .then(data => {
          setToolData(data!);
        })
        .catch(() => {
          console.log("Error in retrieving ToolData 👹");
          navigation.goBack();
        });
  }, []);

  return (
      <ScrollView>
        {toolData ? <Column bg="#FFF" p={5} space={3}>
          <Heading>{toolData.brand} {toolData.name}</Heading>
          <Text fontWeight={500} fontSize={"lg"}>${toolData.rate?.price}/{toolData.rate?.timeUnit}</Text>
          <Text fontSize="md">{toolData.description}</Text>
          <Text>{toolData.lender?.name} - {toolData.lender?.rating}/5 stars</Text>
          {/*<Text>{JSON.stringify(toolData)}</Text>*/}

          <Text>
          {toolData.preferences?.localPickup ? "✅ Local pickup" : "❌ No Local Pickup" }
          </Text>
          <Text>
          {toolData.preferences?.delivery ? "✅ Will deliver" : "❌ No delivery" }
          </Text>
          <Text>
          {toolData.preferences?.useOnSite ? "✅ Available to use at lender location" : "❌ Not available to use at lender location" }
          </Text>
        </Column> : null}
      </ScrollView>
  );
};

export default ToolDetail;