import {useEffect, useState} from "react";
import {getCurrentPositionAsync, LocationObject, requestForegroundPermissionsAsync} from "expo-location";
import {getCityNameFromGeopoint} from "../../models/Location";
import {Geopoint} from "geofire-common";
import {LendrBaseError} from "../errors";

export function useLocation() {
  console.log("🛠useLocation()");

  const [location, setLocation] = useState<LocationObject>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [city, setCity]  = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const {location, city} = await getDeviceLocation();
        setLocation(location);
        setCity(city);
      } catch (e: LendrBaseError | any) {
        setErrorMsg(e.message);
      }
    })();
  }, []);

  return {
    geopoint: [location?.coords.latitude, location?.coords.longitude] as Geopoint,
    city,
    errorMsg
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