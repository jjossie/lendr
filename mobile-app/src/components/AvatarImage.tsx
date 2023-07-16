import React from 'react';
import {Avatar, theme} from 'native-base';
import {ILendrUserPreview} from "../models/ILendrUser";
import {ColorType, ResponsiveValue, ThemeComponentSizeType} from "native-base/lib/typescript/components/types";


function numberFromText(text: string): number {
  return parseInt(text
      .split('') // => ["A", "A"]
      .map(char => char.charCodeAt(0)) // => [65, 65]
      .join(''));
}


export interface AvatarImageProps {
  user: ILendrUserPreview;
  size?: ThemeComponentSizeType<"Avatar">
}

const AvatarImage: React.FC<AvatarImageProps> = ({user, size}) => {

  const colors: ResponsiveValue<ColorType>[] = [
    theme.colors.lightBlue[400],
    theme.colors.blue[400],
    theme.colors.green[300],
    theme.colors.lightBlue[400],
    theme.colors.blue[300],
    theme.colors.orange[400],
    theme.colors.lightBlue[300],
    theme.colors.green[400],
    theme.colors.purple[300],
    theme.colors.orange[600],
    theme.colors.red[400],
    theme.colors.purple[400],
    theme.colors.red[300],
  ];

  const image = {uri: user?.photoURL};
  const firstName = (user.displayName)
      ? user.displayName.split(' ')[0]
      : user.firstName;
  const lastName = (user.displayName)
      ? user.displayName.split(' ')[1]
      : user.lastName;
  const initials = (firstName && lastName) ? `${firstName[0]}${lastName[0]}` : "AB";
  const number = numberFromText(`${firstName} ${lastName}`);
  const color = colors[number % colors.length];

  return (
      <>
        {image.uri ? <Avatar size={size} source={image}/> : <Avatar size={size} bgColor={color}>{initials}</Avatar>}
      </>
  );
};

export default AvatarImage;