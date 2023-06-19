import {useEffect, useState} from "react";
import {getCurrentPositionAsync, LocationObject, requestForegroundPermissionsAsync} from "expo-location";
import {getCityNameFromGeopoint} from "../../models/Location";
import {Geopoint} from "geofire-common";
import {LendrBaseError} from "lendr-common/utils/errors";

export function useLocation() {
  console.log("🛠useLocation()");

  const [location, setLocation] = useState<LocationObject>();
  const [geopoint, setGeopoint] = useState<Geopoint>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [city, setCity]  = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        console.log("🛠useLocation() - useEffect");
        const {location, city} = await getDeviceLocation();
        setLocation(location);
        setGeopoint([location?.coords.latitude, location?.coords.longitude]);
        setCity(city);
      } catch (e: LendrBaseError | any) {
        setErrorMsg(e.message);
        console.log("🛠useLocation() - Error: getDeviceLocation() probably failed");
      }
    })();
  }, []);

  return {
    geopoint,
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