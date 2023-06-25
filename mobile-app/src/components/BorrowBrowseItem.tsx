import React from 'react';
import {Column, Row, Text} from 'native-base';
import Card from "./Card";
import {Image, StyleSheet} from "react-native";
import {NavigationProp} from "@react-navigation/native";
import {ITool} from "../models/Tool";

export interface BorrowBrowseItemProps {
  navigation: NavigationProp<any>;
  tool: ITool;
}

const BorrowBrowseItem: React.FC<BorrowBrowseItemProps> = ({navigation, tool}) => {

  const keywordString = tool.name.split(" ").join(",");

  const imageUrl = tool?.imageUrls && tool.imageUrls.length > 0
      ? tool.imageUrls[0]
      : `https://source.unsplash.com/random/?${keywordString},tool`;

  return (
      <Card
          px={0} py={0}
          onPress={() => {
            navigation.navigate("ToolDetail", {
              toolId: tool.id,
            });
          }}>
        <Column w="100%" h={64}>
          <Image source={{uri: imageUrl}} style={style.image}/>
          <Column w="100%" h="50%" p={2}>
            <Text fontSize="md">{tool.name}</Text>
            <Row alignItems="center">
              <Text fontSize="xl" bold>${tool.rate.price}</Text><Text
                fontSize="md">/{tool.rate.timeUnit}</Text>
            </Row>
            <Text fontSize="sm">{tool.location.relativeDistance} mi away</Text>
          </Column>
        </Column>
      </Card>
  );
};

export default BorrowBrowseItem;

const style = StyleSheet.create({
  image: {
    width: 182,
    height: 158,
  },
});