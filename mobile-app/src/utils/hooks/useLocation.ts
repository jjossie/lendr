import {getCurrentPositionAsync, LocationObject, requestForegroundPermissionsAsync} from "expo-location";
import {getCityNameFromGeopoint} from "../../models/Location";
import {Geopoint} from "geofire-common";
import {LendrBaseError} from "../errors";

import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_CACHE_AGE = 30 * 60 * 1000;


function isCacheFresh(timestamp: string | null): boolean {
  // TODO this is prone to timezone errors. 
  // Date.getMilliseconds is in local time. What do we do if the cached
  // timestamp was generated in a different time zone?
  if (!timestamp) return false;
  const cacheDate = new Date(timestamp);
  const diff = cacheDate.getMilliseconds() - Date.now();
  return (diff < MAX_CACHE_AGE);
}


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
        const cachedLocationTimestamp = await AsyncStorage.getItem('userLocationTimestamp')

        if (cachedLocation && isCacheFresh(cachedLocationTimestamp)) {
          const { location, city } = JSON.parse(cachedLocation);
          setLocation(location);
          const gp: Geopoint = [location?.coords.latitude, location?.coords.longitude];
          setGeopoint(gp);
          console.log(`🛠️using cached location: ${await getCityNameFromGeopoint(gp)}`);
          setCity(city);
        } else {
          const { location, city } = await getDeviceLocation();
          setLocation(location);
          const gp: Geopoint = [location?.coords.latitude, location?.coords.longitude];
          setGeopoint(gp);
          console.log(`🛠got new location: ${await getCityNameFromGeopoint(gp)}`);
          setCity(city);

          const locationData = JSON.stringify({ location, city });
          await AsyncStorage.setItem('userLocation', locationData);
          await AsyncStorage.setItem('userLocationTimestamp', Date.now().toString());
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