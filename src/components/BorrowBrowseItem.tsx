import React from 'react';
import {Column, Row, Text} from 'native-base';
import Card from "./Card";
import {Image, StyleSheet} from "react-native";
import {NavigationProp} from "@react-navigation/native";
import {ITool} from "../models/Tool";

export interface BorrowBrowseItemProps {
  navigation: NavigationProp<any>
  tool: ITool
}

const BorrowBrowseItem: React.FC<BorrowBrowseItemProps> = (props: BorrowBrowseItemProps) => {
  return (
      <Card onPress={() => {
        props.navigation.navigate("ToolDetail", {
          toolId: "f",
          tool: props.tool,
        });
      }}>
        {/*TODO This styling is probably wrong*/}
        <Column w="50%" h={32}>
          <Image source={{uri: "https://source.unsplash.com/random/640×480/?hammer,saw,woodworking,"}} style={style.image}/>
          <Column py={4} w="100%" h="50%">
            <Text fontSize="lg">{props.tool.name}</Text>
            <Row alignItems="center">
              <Text fontSize="2xl" bold>${props.tool.rate.price}</Text><Text
                fontSize="md">/{props.tool.rate.timeUnit}</Text>
            </Row>
            <Text fontSize="md">8 mi away</Text>
          </Column>
        </Column>
      </Card>
  );
};

export default BorrowBrowseItem;

const style = StyleSheet.create({
  image: {
    width: 200,
    borderRadius: 10,
  },
});