import React from 'react';
import {Button, Column, ScrollView, Text} from 'native-base';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import {signOutUser} from "../../controllers/auth";


const Account: React.FC<BottomTabScreenProps<any>> = ({navigation, route}) => {

  const {authUser, user} = useAuthentication();
  // const [fsUser, setFsUser] = useState<DocumentData | undefined>(undefined);

  // useEffect(() => {
  //   if (authUser)
  //     getUserFromAuth(authUser)
  //         .then(u => setFsUser(u))
  //         .catch(e => console.log(e.message));
  // }, [authUser]);

  return (
      <ScrollView p={8}>
        <Column space="lg">
          {user && <Text bold fontSize="xl">{user?.firstName + " " + user?.lastName}</Text>}
          <Text fontSize="md">{authUser?.email}</Text>
          <Button onPress={() => {
            signOutUser();
          }}>Sign Out</Button>
        </Column>
      </ScrollView>
  );
};

export default Account;