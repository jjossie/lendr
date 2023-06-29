import React from "react";
import {ProductHit} from "../../../utils/types/ProductHit";
import {Column, Image, Row, Text} from "native-base";
import {StyleSheet} from "react-native";
import Card from "../../Card";
import {useNavigation} from "@react-navigation/native";

type HitProps = {
  hit: ProductHit;
};

export function Hit({hit}: HitProps) {
  // return (
  //     <Text>
  //       <Highlight hit={hit} attribute="name"/>
  //     </Text>
  // );

  const tool = hit;
  if (!tool.name)
    return (<Card onPress={() => {
      console.log("nuthin");
    }}>empty tool</Card>);

  const navigation = useNavigation();

  const keywordString = tool.name?.split(" ").join(",");

  const imageUrl = tool?.imageUrl ??
  keywordString ? `https://source.unsplash.com/random/?${keywordString},tool`
      : `https://source.unsplash.com/random/?tool,hammer,wrench,screwdriver,drill`;

  return (
      <Card
          px={0} py={0}
          onPress={() => {
            console.log("❇️onPress => navigating to ToolDetail ", tool.objectID);
            (navigation.getParent());
            // @ts-ignore
            navigation.navigate("ToolDetail", {
              toolId: tool.objectID,
            });
          }}>
        <Column w="100%" h={64}>
          <Image source={{uri: imageUrl}} alt={tool.name ?? "tool"} style={style.image}/>
          <Column w="100%" h="50%" p={2}>
            <Text fontSize="md">{tool.name}</Text>
            <Row alignItems="center">
              <Text fontSize="xl" bold>${tool.price}</Text><Text
                fontSize="md">/{tool.timeUnit}</Text>
            </Row>
            {/*<Text fontSize="sm">{tool.relativeDistance} mi away</Text>*/}
          </Column>
        </Column>
      </Card>
  );

}

const style = StyleSheet.create({
  image: {
    width: 182,
    height: 158,
  },
});