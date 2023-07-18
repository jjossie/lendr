import React, {ReactNode} from 'react';
import {Text, View} from 'react-native';
import {styles} from './styles';

export type SlideProps = {
  title?: string;
  item: ReactNode;
}

export const Slide: React.FC<SlideProps> = ({item, title}) => {

  return (
      <View style={styles.slide}>
        {item}
        <Text style={{...styles.slideText}}>
          {title}
        </Text>
      </View>
  );
};

export default Slide;