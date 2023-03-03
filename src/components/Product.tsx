import React, {useState} from 'react';
import {Button, Image, StyleSheet, Text, View} from 'react-native';

import '../../assets/stock-images/power-tool-accessories-og.png.webp';

export type Props = {
  name: string,
  imageUrl?: string,
  description: string,
}

const Product: React.FC<Props> = (props: Props) => {
  const [something, setSomething] = useState(1)
  return (
      <View style={{
        display: "flex",
        alignItems: "center",
        // gap: 100,
      }}>
        <Text style={[style.child, style.title]}>{props.name}</Text>
        {/*<Image source={{uri: '../../assets/stock-images/power-tool-accessories-og.png.webp'}}/>*/}
        <Image source={{uri: "https://source.unsplash.com/random"}} style={style.image}/>
        <Text style={style.child}>{props.description}</Text>
        <Text style={style.child}>{something}</Text>
        <Button onPress={() => setSomething(prevState => prevState * 2)} title="Bruh"/>
      </View>
  );
};

export default Product;

const style = StyleSheet.create({
  child: {
    margin: 10,
  },
  title: {
    fontSize: 24,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  }
});