import {Button, ScrollView, StyleSheet, Text, View} from "react-native";
import {StatusBar} from "expo-status-bar";

import React, {useState} from 'react';

export type Props = {}

const Demo: React.FC<Props> = () => {
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


