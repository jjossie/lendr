// TODO import zod

export interface Location {
  latitude: number;
  longitude: number;
  geohash: string; // Added after retrieving from firestore
  city?: string; // Added (asynchronously) after retrieving from firestore
  relativeDistance?: number; // Added after retrieving from firestore
}
