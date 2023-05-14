import React from 'react';
import {Button, Column, ScrollView, Text} from 'native-base';
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {useAuthentication} from "../../utils/hooks/useAuthentication";
import {signOutUser} from "../../controllers/auth";
import LenderProfilePreview from "../LenderProfilePreview";
import {useLocation} from "../../utils/hooks/useLocation";


const Account: React.FC<BottomTabScreenProps<any>> = ({navigation, route}) => {

  const {authUser, user} = useAuthentication();

  // const [location, setLocation] = useState<Location.LocationObject>();
  // const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  // const [city, setCity]  = useState<string | undefined>(undefined);
  //
  // useEffect(() => {
  //   // Courtesy of ChatGPT
  //   (async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       setErrorMsg('Permission to access location was denied');
  //       return;
  //     }
  //
  //     const location = await Location.getCurrentPositionAsync({});
  //     setLocation(location);
  //     setCity(await getCityNameFromGeopoint([location!.coords.latitude, location.coords.longitude]));
  //   })();
  // }, []);
  const {geopoint, city} = useLocation();

  return (
      <ScrollView p={8}>
        <Column space="lg">
          {user && <LenderProfilePreview user={user!}/>}
          <Text fontSize="md">{authUser?.email}</Text>

          <Text>Latitude: {geopoint[0]}</Text>
          <Text>Longitude: {geopoint[1]}</Text>

          <Text>City: {city}</Text>

          <Button onPress={() => {
            signOutUser();
          }}>Sign Out</Button>
        </Column>
      </ScrollView>
  );
};

export default Account;