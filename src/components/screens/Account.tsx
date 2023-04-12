import React from 'react';
import {Button, Column, ScrollView, Text} from 'native-base';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import {signOutUser} from "../../controllers/auth";


const Account: React.FC<BottomTabScreenProps<any>> = ({navigation, route}) => {

  const {user} = useAuthentication();

  return (
      <ScrollView p={8}>
        <Column space="lg">
          <Text bold fontSize="xl">{user?.email}</Text>
          <Button onPress={() => {
            signOutUser();
          }}>Sign Out</Button>
        </Column>
      </ScrollView>
  );
};

export default Account;