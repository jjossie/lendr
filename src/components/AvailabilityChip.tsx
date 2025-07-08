import React from 'react';
import {Circle, Pressable, Row, Text, theme} from 'native-base';
import {LendrUserPreview} from "../models/lendrUser";
import AvatarImage from "./AvatarImage";
import {useNavigation} from "@react-navigation/native";
import {useAuthentication} from "../utils/hooks/useAuthentication";
import {getRelationId} from "../controllers/relation";

export interface AvailabilityChipProps {
  user?: LendrUserPreview;
  showAvailable?: boolean;
}

const AvailabilityChip: React.FC<AvailabilityChipProps> = ({user, showAvailable = true}) => {
  const navigation = useNavigation();
  const {authUser} = useAuthentication();

  return (
      <Pressable
          onPress={() => {
            if (!authUser?.uid || !user?.uid)
              return;
            navigation.getParent()?.navigate("Inbox", {
              screen: "ChatConversation",
              params: {
                relationId: getRelationId(authUser.uid, user.uid),
              },
            });
          }}
      >
        <Row h={8}
             alignItems={"center"}
             space={1}
             borderRadius={24}
             p={1}
             borderColor={user ? theme.colors.light[300] : null}
             borderWidth={user ? 0.5 : 0}>
          {user
              ? <AvatarImage size={"xs"} user={user}/>
              : showAvailable ? <Circle size={2} bgColor={theme.colors.success[500]}/> : null}
          {user
              ? <Text>{user.displayName}</Text>
              : showAvailable ? <Text>Available</Text> : null}
        </Row>
      </Pressable>
  );
};

export default AvailabilityChip;