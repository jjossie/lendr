import React from 'react';
import {Button, ScrollView, Text, View} from 'react-native';

export type Props = {
  navigation: any
}

const Details: React.FC<Props> = (props: Props) => {
  return (
      <ScrollView>
          <View>
            <Text>Hi, I'm a detail.</Text>
            <Button
              onPress={() => props.navigation.navigate('Home')}
              title="Go Home"
              />
          </View>
      </ScrollView>
  );
};

export default Details;