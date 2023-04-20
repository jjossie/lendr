import geofire from "geofire-common";

export const KM_TO_MILE = 0.621371;

export interface ILocation {
  latitude: number;
  longitude: number;
  geohash: string;
}

export class Location {
  latitude: number;
  longitude: number;
  geohash: string;
  city?: string;

  constructor(latitude: number, longitude: number, geohash?: string, city?: string) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.geohash = geohash ?? geofire.geohashForLocation([latitude, longitude]);
    this.city = city ?? getCity(latitude, longitude);
  }

  distanceBetweenMi(coordinates: [number, number] | Location): number {
    const distanceKm = geofire.distanceBetween(
        [this.latitude, this.longitude],
        (coordinates instanceof Location) ? coordinates.coordinates() : coordinates,
    );
    return distanceKm * KM_TO_MILE;
  }

  coordinates(): [number, number] {
    return [this.latitude, this.longitude];
  }

}

export function getGeohashedLocation(latitude: number, longitude: number): ILocation {
  return {
    latitude, longitude,
    geohash: geofire.geohashForLocation([latitude, longitude])
  }
}

export function distanceBetweenMi(lhs: ILocation, rhs: ILocation): number {
  const distanceKm = geofire.distanceBetween(
      [lhs.latitude, lhs.longitude],
      [rhs.latitude, rhs.longitude],
  );
  return distanceKm * KM_TO_MILE;
}

export function metersFromMiles(miles: number): number {
  return miles / KM_TO_MILE * 1000;
}

function getCity(latitude: number, longitude: number): string{
  // TODO implement
  return "Rexburg";
}