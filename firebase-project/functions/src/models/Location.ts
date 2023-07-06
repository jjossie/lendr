import {distanceBetween, geohashForLocation, Geopoint} from "geofire-common";
import {NotImplementedError} from "../utils/errors";

export const KM_TO_MILE = 0.621371;

export const REXBURG: Geopoint = [43.823791, -111.777649];
export const IDAHOFALLS: Geopoint = [43.492661, -112.040756];
export const POCATELLO: Geopoint = [42.866550, -112.443530];
export const DRIGGS: Geopoint = [43.724491, -111.111038];
export const RIGBY: Geopoint = [43.916667, -111.966667];
export const SAN_FRANCISCO: Geopoint = [37.774929, -122.419418];
export const OAKLAND: Geopoint = [37.804167, -122.271667];
export const SANJOSE: Geopoint = [37.338208, -121.886329];
export const SANTA_CLARA: Geopoint = [37.354167, -121.955278];
export const SANTA_ANA: Geopoint = [34.020833, -118.479167];
export const LOGAN: Geopoint = [41.878113, -111.887922];
export const OGDEN: Geopoint = [41.978333, -111.978333];
export const SALT_LAKE_CITY: Geopoint = [40.760779, -111.891022];
export const LAYTON: Geopoint = [41.0602, -111.9711];
export const SYRACUSE: Geopoint = [41.0894, -112.0647];
export const ROY: Geopoint = [41.1616, -112.0263]

export const IDAHO_LOCATIONS = [REXBURG, IDAHOFALLS, POCATELLO, DRIGGS, RIGBY];
export const CALIFORNIA_LOCATIONS = [SANJOSE, SANTA_CLARA, SANTA_ANA, SAN_FRANCISCO, OAKLAND];
export const UTAH_LOCATIONS = [LOGAN, OGDEN, SALT_LAKE_CITY, LAYTON, SYRACUSE, ROY];

export interface ILocation {
  latitude: number;
  longitude: number;
  geohash: string; // Added after retrieving from firestore
  city?: string; // Added (asynchronously) after retrieving from firestore
  relativeDistance?: number; // Added after retrieving from firestore
}


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


export function getRandomCityGeopoint() {
  // Get a random location from the IDAHO_LOCATIONS array
  const randomCityIndex = Math.floor(Math.random() * IDAHO_LOCATIONS.length);
  return Math.random() < 0.5 ? IDAHO_LOCATIONS[randomCityIndex] : UTAH_LOCATIONS[randomCityIndex];
}

interface ILocationApi {
  street?: string,
  city?: string,
  county?: string,
  state?: string,
  country?: string,
  postalcode?: string,
}

async function reverseGeocode(lat: number, lon: number): Promise<{
  "address": {
    "country": string,
    "country_code": string,
    "county": string,
    "postcode": string,
    "road": string,
    "state": string,
    "town": string,
  },
  "boundingbox": [string, string, string, string],
  "display_name": string,
  "lat": string,
  "licence": string,
  "lon": string,
  "osm_id": number,
  "osm_type": string,
  "place_id": number,
  "powered_by": string,
}
> {
  requestCount++;
  console.log(`📍Sending a Free Geocoder Request - ${requestCount} requests so far`);
  const url = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`;
  const response = await fetch(url);
  return response.json();
}


async function geocode(location: ILocationApi)  {
  let url = "https://geocode.maps.co/search?";
  if (location.street)     url += `street=${location.street}&`;
  if (location.city)       url += `city=${location.city}&`;
  if (location.county)     url += `county=${location.county}&`;
  if (location.state)      url += `state=${location.state}&`;
  if (location.country)    url += `country=${location.country}&`;
  if (location.postalcode) url += `postalcode=${location.postalcode}&`;

  requestCount++;
  console.log(`📍Sending a Free Geocoder Request - ${requestCount} requests so far`);
  const response = await fetch(url);
  return response.json();
}

/**
 * Given a city name, find the geopoint. Include the state preferably
 * @param {string} city
 * @param {string | undefined} state
 * @returns {Promise<Geopoint>}
 */
export async function getGeopointFromCityName(city: string, state?: string): Promise<Geopoint> {
  // Given a city name, find the geopoint
  let options: any = {city: city};
  if (state)
    options.state = state;
  const response = await geocode(options);
  console.log("geocoding response: ", response);
  return [response.lat, response.lon];
}

/**
 * Given a latitude and longitude, find the nearest city name
 * @param {Geopoint} geopoint
 * @returns {Promise<string>}
 */
export async function getCityNameFromGeopoint(geopoint: Geopoint): Promise<string> {
  // TODO: Cache this kind of thing. Might be a good way to reduce requests
  const response = await reverseGeocode(geopoint[0], geopoint[1]);
  console.log("reverse geocoding response: ", response);
  const {town, state} = response.address;
  return (town && state) ? `${town}, ${state}` : town || state || "Unknown";
}

/**
 * @deprecated this uses reactNativeGeocoding
 * @param {Geopoint} geopoint
 * @returns {Promise<string>}
 */
export async function getCityNameFromGeopointRNG(geopoint: Geopoint): Promise<string> {
  // requestCount++;
  // console.log(`📍Sending a Geocoder Request - ${requestCount} requests so far`);
  // // TODO: Cache this kind of thing. Might be a good way to reduce requests
  // // Given a latitude and longitude, find the nearest city name
  // const response = await Geocoder.from(geopoint[0], geopoint[1]);
  // const result = response.results[0];
  // const city = result.address_components.find(component => {
  //   return component.types.includes("locality");
  // })?.long_name;
  // const stateCode = result.address_components.find(component => {
  //   return component.types.includes("administrative_area_level_1");
  // })?.short_name;
  // return (city && stateCode) ? `${city}, ${stateCode}` : "Unknown";
  throw new NotImplementedError();
}

/**
 * @deprecated this uses reactNativeGeocoding
 * @param {string} cityName
 * @returns {Promise<Geopoint>}
 */
export async function getGeopointFromCityNameRNG(cityName: string): Promise<Geopoint> {
  // // Given a city name, find the geopoint
  // const response = await Geocoder.from(cityName);
  // const result = response.results[0];
  // const geopoint = result.geometry.location;
  // return [geopoint.lat, geopoint.lng];
  throw new NotImplementedError();
}