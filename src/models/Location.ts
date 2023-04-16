import geofire from "geofire-common";

export const KM_TO_MILE = 0.62; // TODO check and confirm this

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

export function metersFromMiles(miles: number): number {
  return miles / KM_TO_MILE * 1000;
}

function getCity(latitude: number, longitude: number): string{
  return "Rexburg";
}