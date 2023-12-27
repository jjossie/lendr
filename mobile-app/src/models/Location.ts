import {distanceBetween, geohashForLocation, Geopoint} from "geofire-common";
import {NotImplementedError} from "../utils/errors";

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

const stateAbbreviations: any = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY",
  "District of Columbia": "DC",
  "American Samoa": "AS",
  "Guam": "GU",
  "Northern Mariana Islands": "MP",
  "Puerto Rico": "PR",
  "United States Minor Outlying Islands": "UM",
  "U.S. Virgin Islands": "VI",
  "Armed Forces Europe": "AE",
  "Armed Forces Pacific": "AP",
  "Armed Forces the Americas": "AA",
  "Alberta": "AB",
  "British Columbia": "BC",
  "Manitoba": "MB",
  "New Brunswick": "NB",
  "Newfoundland and Labrador": "NL",
  "Northwest Territories": "NT",
  "Nova Scotia": "NS",
  "Nunavut": "NU",
  "Ontario": "ON",
  "Prince Edward Island": "PE",
  "Quebec": "QC",
  "Saskatchewan": "SK",
  "Yukon": "YT",
  "Newfoundland": "NF",
};


export interface LendrLocation {
  latitude: number;
  longitude: number;
  geohash: string; // Added after retrieving from firestore
  city?: string; // Added (asynchronously) after retrieving from firestore
  relativeDistance?: number; // Added after retrieving from firestore
}


export function getGeohashedLocation(geopoint: Geopoint): LendrLocation {
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
  return IDAHO_LOCATIONS[randomCityIndex];
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
    "town"?: string,
    "city"?: string,
    "neighbourhood"?: string,
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

async function geocode(location: ILocationApi) {
  let url = "https://geocode.maps.co/search?";
  if (location.street) url += `street=${location.street}&`;
  if (location.city) url += `city=${location.city}&`;
  if (location.county) url += `county=${location.county}&`;
  if (location.state) url += `state=${location.state}&`;
  if (location.country) url += `country=${location.country}&`;
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
  // console.log("📍geocoding response: ", JSON.stringify(response));
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
  // console.log("📍reverse geocoding response: ", JSON.stringify(response, null, 2));
  const {neighbourhood, city, town, county, state, country} = response.address;

  const locality = [neighbourhood, town, city, county]
      .filter(element => element)
      .slice(0, 2);

  const region = [getStateAbbreviation(state), country]
      .filter(element => element);

  let cityString = "";
  for (let localityElement of locality) {
    if (localityElement) {
      cityString += localityElement;
      cityString += ", ";
    }
  }
  cityString += region[0];

  return cityString ?? "Unknown";
}

export function getStateAbbreviation(state: string) {
  return stateAbbreviations[state] || state;
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