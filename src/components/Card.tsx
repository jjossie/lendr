import React, {useState} from 'react';
import {Box, Pressable, theme} from 'native-base';
import {GestureResponderEvent} from "react-native";

export interface CardProps {
  children: any;
  onPress: (e?: GestureResponderEvent) => void;
}

const Card: React.FC<CardProps> = (props: CardProps) => {
  const [isPressed, setIsPressed] = useState(false);
  return (
      <Pressable
          onPressIn={() => {setIsPressed(true);}}
          onPressOut={() => {setIsPressed(false);}}
          onPress={(e) => {props.onPress(e)}}
          overflow="hidden"
          m={4}
          backgroundColor={isPressed ? theme.colors.light["100"] : theme.colors.white}
          shadow={3}
          borderRadius="md"
          style={{
            transform: [{
              scale: isPressed ? 0.99 : 1,
            }],
          }}
      >
        <Box px="4">
          {props.children}
        </Box>
      </Pressable>
  );
};

export default Card;