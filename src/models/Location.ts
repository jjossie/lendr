import {distanceBetween, geohashForLocation, Geopoint} from "geofire-common";

import Geocoder from "react-native-geocoding";

export const KM_TO_MILE = 0.621371;

export const REXBURG: Geopoint = [43.823791, -111.777649];
export const IDAHOFALLS: Geopoint = [43.492661, -112.040756];
export const POCATELLO: Geopoint = [42.866550, -112.443530];
export const DRIGGS: Geopoint = [43.724491, -111.111038];
export const SANJOSE: Geopoint = [37.338208, -121.886329];
export const SANTA_CLARA: Geopoint = [37.354167, -121.955278];
export const SANTA_ANA: Geopoint = [34.020833, -118.479167];

export const IDAHO_LOCATIONS = [REXBURG, IDAHOFALLS, POCATELLO, DRIGGS];
export const CALIFORNIA_LOCATIONS = [SANJOSE, SANTA_CLARA, SANTA_ANA];

export interface ILocation {
  latitude: number;
  longitude: number;
  geohash: string; // Added after retrieving from firestore
  city?: string; // Added (asynchronously) after retrieving from firestore
  relativeDistance?: number; // Added after retrieving from firestore
}

// export interface ICoordinates {
//   latitude: number;
//   longitude: number;
// }

// export class Location {
//   latitude: number;
//   longitude: number;
//   geohash: string;
//   city?: string;
//
//   constructor(latitude: number, longitude: number, geohash?: string, city?: string) {
//     this.latitude = latitude;
//     this.longitude = longitude;
//     this.geohash = geohash ?? geofire.geohashForLocation([latitude, longitude]);
//     this.city = city ?? getCity(latitude, longitude);
//   }
//
//   distanceBetweenMi(coordinates: [number, number] | Location): number {
//     const distanceKm = geofire.distanceBetween(
//         [this.latitude, this.longitude],
//         (coordinates instanceof Location) ? coordinates.coordinates() : coordinates,
//     );
//     return distanceKm * KM_TO_MILE;
//   }
//
//   coordinates(): [number, number] {
//     return [this.latitude, this.longitude];
//   }
//
// }

export function getGeohashedLocation(geopoint: Geopoint): ILocation {
  const geohash = geohashForLocation(geopoint);
  return {
    latitude: geopoint[0],
    longitude: geopoint[1],
    geohash,
  };
}

export function distanceBetweenMi(lhs: Geopoint, rhs: Geopoint): number {
  const distanceKm = distanceBetween(lhs, rhs);
  return Math.round(distanceKm * KM_TO_MILE);
}

export function metersFromMiles(miles: number): number {
  return miles / KM_TO_MILE * 1000;
}

let requestCount = 0;

export async function getCityNameFromGeopoint(geopoint: Geopoint): Promise<string> {
  requestCount++;
  console.log(`📍Sending a Geocoder Request - ${requestCount} requests so far`);
  // TODO: Cache this kind of thing. Might be a good way to reduce requests
  // Given a latitude and longitude, find the nearest city name
  const response = await Geocoder.from(geopoint[0], geopoint[1]);
  const result = response.results[0];
  const city = result.address_components.find(component => {
    return component.types.includes("locality");
  })?.long_name;
  const stateCode = result.address_components.find(component => {
    return component.types.includes("administrative_area_level_1");
  })?.short_name;
  return (city && stateCode) ? `${city}, ${stateCode}` : "Unknown";
}

export function getRandomCityGeopoint() {
  // Get a random location from the IDAHO_LOCATIONS array
  const randomCityIndex = Math.floor(Math.random() * IDAHO_LOCATIONS.length);
  return IDAHO_LOCATIONS[randomCityIndex];
}

export async function getGeopointFromCityName(cityName: string): Promise<Geopoint> {
  // Given a city name, find the geopoint
  const response = await Geocoder.from(cityName);
  const result = response.results[0];
  const geopoint = result.geometry.location;
  return [geopoint.lat, geopoint.lng];
}