// import geofire from "geofire-common";

import {distanceBetween, geohashForLocation, Geopoint} from "geofire-common";

export const KM_TO_MILE = 0.621371;

export const REXBURG: Geopoint = [43.823791, -111.777649];
export const IDAHOFALLS: Geopoint = [43.492661, -112.040756];
export const POCATELLO: Geopoint = [42.866550, -112.443530];
export const DRIGGS: Geopoint = [43.724491, -111.111038];
export const SANJOSE: Geopoint = [37.338208, -121.886329];
export const SANTA_CLARA: Geopoint = [37.354167, -121.955278];
export const SANTA_ANA: Geopoint = [34.020833, -118.479167];

export const IDAHO_LOCATIONS = [REXBURG, IDAHOFALLS, POCATELLO, DRIGGS];

export interface ILocation {
  latitude: number;
  longitude: number;
  geohash: string;
}

export interface ICoordinates {
  latitude: number;
  longitude: number;
}


console.log(geohashForLocation(REXBURG));

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
  return distanceKm * KM_TO_MILE;
}

export function metersFromMiles(miles: number): number {
  return miles / KM_TO_MILE * 1000;
}

function getCity(geopoint: Geopoint): string {
  // TODO implement
  return "Rexburg";
}

export function getRandomCityGeopoint() {
  // Get a random location from the IDAHO_LOCATIONS array
  const randomCityIndex = Math.floor(Math.random() * IDAHO_LOCATIONS.length);
  return IDAHO_LOCATIONS[randomCityIndex];
}