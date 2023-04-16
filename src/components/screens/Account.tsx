import React, {useEffect, useState} from 'react';
import {Button, Column, ScrollView, Text} from 'native-base';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import {getUserFromAuth, signOutUser} from "../../controllers/auth";
import {DocumentData} from 'firebase/firestore';


const Account: React.FC<BottomTabScreenProps<any>> = ({navigation, route}) => {

  const {user} = useAuthentication();
  const [fsUser, setFsUser] = useState<DocumentData | undefined>( undefined );

  useEffect(() => {
    getUserFromAuth(user!)
        .then(u => setFsUser(u))
        .catch(e => console.log(e.message));
  }, [user])

  return (
      <ScrollView p={8}>
        <Column space="lg">
          {fsUser && <Text bold fontSize="xl">{fsUser?.firstName + " " + fsUser?.lastName}</Text>}
          <Text fontSize="md">{user?.email}</Text>
          <Button onPress={() => {
            signOutUser();
          }}>Sign Out</Button>
        </Column>
      </ScrollView>
  );
};

export default Account;