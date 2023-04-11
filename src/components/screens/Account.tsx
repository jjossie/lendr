import React from 'react';
import {Box, Button, Text} from 'native-base';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import {signOutUser} from "../../controllers/auth";


const Account: React.FC<BottomTabScreenProps<any>> = ({navigation, route}) => {

  const {user} = useAuthentication();

  return (
      <Box>
        <Text bold fontSize="xl">{user?.email}</Text>
        <Button onPress={() => {signOutUser()}}>Sign Out</Button>
      </Box>
  );
};

export default Account;