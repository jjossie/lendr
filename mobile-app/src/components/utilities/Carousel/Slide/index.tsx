import React from 'react';
import {Text, View} from 'react-native';
import {styles} from './styles';

export const Slide = (props: any) => {

  const { title } = props;

  return (
    <View style={styles.slide}>
      <Text style={{ ...styles.slideText }}>
        {title}
      </Text>
    </View>
  );
}

export default Slide;