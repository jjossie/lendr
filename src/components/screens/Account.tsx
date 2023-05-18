import React from 'react';
import {Button, Column, ScrollView, Text} from 'native-base';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import {signOutUser} from "../../controllers/auth";
import LenderProfilePreview from "../LenderProfilePreview";
import {useLocation} from "../../utils/hooks/useLocation";


const Account: React.FC<BottomTabScreenProps<any>> = ({navigation, route}) => {

  const {authUser, user} = useAuthentication();

  const {city} = useLocation();

  return (
      <ScrollView p={8}>
        <Column space="lg">
          {user && <LenderProfilePreview user={user!}/>}
          <Text fontSize="md">{authUser?.email}</Text>

          <Text>City: {city}</Text>

          <Button onPress={() => {
            signOutUser();
          }}>Sign Out</Button>
        </Column>
      </ScrollView>
  );
};

export default Account;