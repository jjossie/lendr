import {Button, ScrollView, StyleSheet, Text, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import Product from "../Product";

import React, {useState} from 'react';

export type Props = {}

const Demo: React.FC<Props> = (props: Props) => {
  const [count, setCount] = useState(0);

  return (
      <ScrollView>
        <View style={styles.container}>
          <Text>Open up App.js to start working on your app!</Text>
          <Button title="Click Me Bitch" onPress={() => {
            setCount(count + 1)
          }}/>
          <Text>Number of Knuckle Sandwiches you will receive:</Text>
          <Text>{count}</Text>
          <StatusBar style="auto"/>
          <Product name="Joe Momma" description="Joe Momma so fat"/>
          <Product name="Anotha one" description="Lorem ipsum dolor sit amet"/>
          <Product name="Bruh" description="bruh bruh bruh bruh bruh bruh bruh bruh bruh bruh"/>
          <Product name="The drillz" description="poof boom pow just like magic with a flash and a bang"/>
        </View>
      </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


export default Demo;


