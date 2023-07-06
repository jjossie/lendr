import {getCurrentPositionAsync, LocationObject, requestForegroundPermissionsAsync} from "expo-location";
import {getCityNameFromGeopoint} from "../../models/Location";
import {Geopoint} from "geofire-common";
import {LendrBaseError} from "../errors";

import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useLocation() {
  const [location, setLocation] = useState<LocationObject | undefined>();
  const [geopoint, setGeopoint] = useState<Geopoint | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [city, setCity] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        console.log('🛠useLocation() - useEffect');
        const cachedLocation = await AsyncStorage.getItem('userLocation');

        if (cachedLocation) {
          const { location, city } = JSON.parse(cachedLocation);
          setLocation(location);
          setGeopoint([location?.coords.latitude, location?.coords.longitude]);
          setCity(city);
        } else {
          const { location, city } = await getDeviceLocation();
          setLocation(location);
          setGeopoint([location?.coords.latitude, location?.coords.longitude]);
          setCity(city);

          const locationData = JSON.stringify({ location, city });
          await AsyncStorage.setItem('userLocation', locationData);
        }
      } catch (e: LendrBaseError | any) {
        setErrorMsg(e.message);
        console.log('🛠useLocation() - Error: getDeviceLocation() probably failed');
      }
    };

    fetchLocation();
  }, []);

  return {
    geopoint,
    city,
    errorMsg,
  };
}

export async function getDeviceLocation() {
  // Courtesy of ChatGPT
  let { status } = await requestForegroundPermissionsAsync();
  if (status !== 'granted')
    throw new LendrBaseError('Permission to access location was denied');

  const location = await getCurrentPositionAsync({});
  const city = await getCityNameFromGeopoint([location.coords.latitude, location.coords.longitude]);
  return {location, city};
}