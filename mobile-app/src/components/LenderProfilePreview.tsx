import React from 'react';
import {Row, Text} from 'native-base';
import {LendrUserPreview} from "../models/lendrUser";
import AvatarImage from "./AvatarImage";

export interface LenderProfilePreviewProps {
  user: LendrUserPreview;
}

const LenderProfilePreview: React.FC<LenderProfilePreviewProps> = ({user}) => {
  // const displayName = user.firstName + " " + user.lastName;
  // const initials = user.firstName.charAt(0) + user.lastName.charAt(0);
  return (
      <Row alignItems={"center"} space={2}>
        <AvatarImage user={user}/>
        <Text fontSize="md">{user.displayName}</Text>
      </Row>
  );
};

export default LenderProfilePreview;