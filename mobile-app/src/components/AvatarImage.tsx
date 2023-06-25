import React from 'react';
import {Avatar, theme} from 'native-base';
import {ILendrUser} from "../models/ILendrUser";
import {ColorType, ResponsiveValue} from "native-base/lib/typescript/components/types";


function numberFromText(text: string): number {
  return parseInt(text
      .split('') // => ["A", "A"]
      .map(char => char.charCodeAt(0)) // => [65, 65]
      .join(''));
}


export interface AvatarImageProps {
  user: ILendrUser;
}

const AvatarImage: React.FC<AvatarImageProps> = ({user}) => {

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

  const image = {uri: user.providerData?.imageUrl};
  const initials = (user.firstName && user.lastName) ? `${user.firstName[0]}${user.lastName[0]}` : "AB";
  const number = numberFromText(`${user.firstName} ${user.lastName}`);
  const color = colors[number % colors.length];

  return (
      <>
        {image.uri ? <Avatar source={image}/> : <Avatar bgColor={color}>{initials}</Avatar>}
      </>
  );
};

export default AvatarImage;