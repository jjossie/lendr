import React from 'react';
import {Avatar, Row, Text, theme} from 'native-base';
import {ILendrUser} from "../models/ILendrUser";

export interface LenderProfilePreviewProps {
  user: ILendrUser
}

const LenderProfilePreview: React.FC<LenderProfilePreviewProps> = ({user}) => {
  const displayName = user.firstName + " " + user.lastName;
  const initials = user.firstName.charAt(0) + user.lastName.charAt(0);
  return (
      <Row alignItems={"center"} space={2}>
        <Avatar bg={theme.colors.red[500]}>{initials}</Avatar>
        <Text fontSize="md">{displayName}</Text>
      </Row>
  );
};

export default LenderProfilePreview;