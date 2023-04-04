import React from 'react';
import {Image, StyleSheet} from 'react-native';

import '../../assets/stock-images/power-tool-accessories-og.png.webp';
import {Column, Row, Text} from "native-base";
import {ITool} from "../models/Tool";
import Card from "./Card";

export type Props = {
  tool: ITool
  navigation: any
}

const LenderInventoryItem: React.FC<Props> = (props: Props) => {

  return (
        <Card onPress={() => {
          props.navigation.navigate("EditTool", {
            toolId: "f",
            tool: props.tool,
          });
        }}>
          <Row w="100%" h={32}>
            <Column py={4} w="50%" h="100%">
              <Text fontSize="lg">{props.tool.name}</Text>
              <Row alignItems="center">
                <Text fontSize="4xl" bold>${props.tool.rate.price}</Text><Text
                  fontSize="md">/{props.tool.rate.timeUnit}</Text>
              </Row>
            </Column>
            <Image source={{uri: "https://source.unsplash.com/random/640×480/?hammer,saw,woodworking,"}} style={style.image}/>
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
    borderRadius: 10,
  },
});