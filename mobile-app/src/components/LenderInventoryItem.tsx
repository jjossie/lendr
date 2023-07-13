import React from 'react';
import {Image, StyleSheet} from 'react-native';

import {Column, Row, Text} from "native-base";
import {ITool} from "../models/Tool";
import Card from "./Card";
import AvailabilityChip from "./AvailabilityChip";

export type LenderInventoryItemProps = {
  tool: ITool
  navigation: any
}

const LenderInventoryItem: React.FC<LenderInventoryItemProps> = ({tool, navigation}) => {

  const keywordString = tool.name.split(" ").join(",");
  const imageUri = tool.imageUrls && tool.imageUrls.length > 0
      ? tool.imageUrls[0]
      : `https://source.unsplash.com/random/640×480/?${keywordString}`;
  return (
      <Card onPress={() => {
        navigation.navigate("EditTool", {
          toolId: tool.id,
        });
      }}>
        <Row w="100%" h={48}>
          <Column p={4} w="50%" h="100%">
            <Text fontSize="lg">{tool.name}</Text>
            <Row alignItems="center">
              <Text fontSize="4xl" bold>${tool.rate.price}</Text><Text
                fontSize="md">/{tool.rate.timeUnit}</Text>
            </Row>
            {
              (tool.lenderUid != tool.holderUid && tool.holder)
                  ? <AvailabilityChip user={tool.holder}/>
                  : <AvailabilityChip/>
            }
          </Column>
          <Image source={{uri: imageUri}} style={style.image}/>
        </Row>

      </Card>
  );
};

export default LenderInventoryItem;

const style = StyleSheet.create({
  child: {
    margin: 10,
  },
  title: {
    fontSize: 24,
  },
  image: {
    width: 200,
  },
});