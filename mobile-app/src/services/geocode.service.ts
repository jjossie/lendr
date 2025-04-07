import { ILocationApi } from "../models/location";
import { ObjectValidationError } from "../utils/errors";
import Constants from "expo-constants";


type ReverseGeocodeResponse = {
    address: {
      country: string;
      country_code: string;
      county: string;
      postcode: string;
      road: string;
      state: string;
      town?: string;
      city?: string;
      neighbourhood?: string;
    };
    boundingbox: [string, string, string, string];
    display_name: string;
    lat: string;
    licence: string;
    lon: string;
    osm_id: number;
    osm_type: string;
    place_id: number;
    powered_by: string;
  };
  
  export class GeocodeService {
    private cache: Map<string, ReverseGeocodeResponse>;
    private ongoingRequests: Map<string, Promise<ReverseGeocodeResponse>>;
    private requestCount: number;

    private static apiKey: String = Constants.expoConfig?.extra?.geocoderApiKey;


    private static _instance: GeocodeService;

    public static getInstance(): GeocodeService {
        if (!GeocodeService._instance) {
            GeocodeService._instance = new GeocodeService();
        }
        return GeocodeService._instance;
    }
  

    private constructor() {
      this.cache = new Map();
      this.ongoingRequests = new Map();
      this.requestCount = 0;
    }
  
    private getLatLonCacheKey(lat: number, lon: number): string {
      return `${lat},${lon}`;
    }

    private getGeocodeCacheKey(location: ILocationApi): string {
        return JSON.stringify(location);
      }
  
    async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResponse> {
      const cacheKey = this.getLatLonCacheKey(lat, lon);
  
      // Check if the response is already cached
      if (this.cache.has(cacheKey)) {
        console.log(`📍Cache hit for ${cacheKey}`);
        return this.cache.get(cacheKey)!;
      }
  
      // Check if a request is already in progress for this lat/lon
      if (this.ongoingRequests.has(cacheKey)) {
        console.log(`📍Request already in progress for ${cacheKey}`);
        return this.ongoingRequests.get(cacheKey)!;
      }
  
      // Create a new request and store it in the ongoingRequests map
      const requestPromise = this.makeReverseGeocodeRequest(lat, lon);
      this.ongoingRequests.set(cacheKey, requestPromise);
  
      try {
        const response = await requestPromise;
        this.cache.set(cacheKey, response); // Cache the response
        return response;
      } finally {
        // Remove the request from ongoingRequests once it completes
        this.ongoingRequests.delete(cacheKey);
      }
    }
  
    private async makeReverseGeocodeRequest(lat: number, lon: number): Promise<ReverseGeocodeResponse> {
      this.requestCount++;
      const url = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&api_key=${GeocodeService.apiKey}`;
      console.log(`📍Sending request #${this.requestCount} to ${url}`);
  
      const response = await fetch(url);
      const rawResponse = await response.text();
  
      try {
        const responseJson = JSON.parse(rawResponse);
        console.log(`📍Reverse Geocoding response: ${JSON.stringify(responseJson)}`);
        return responseJson;
      } catch (e) {
        console.error("Failed to parse JSON. Raw response:", rawResponse);
        throw new ObjectValidationError(`SyntaxError: Failed to parse JSON. Raw response: ${rawResponse}`);
      }
    }

    async geocode(location: ILocationApi): Promise<ReverseGeocodeResponse> {
        const cacheKey = this.getGeocodeCacheKey(location);
    
        // Check if the response is already cached
        if (this.cache.has(cacheKey)) {
          console.log(`📍Cache hit for geocode: ${cacheKey}`);
          return this.cache.get(cacheKey)!;
        }
    
        // Check if a request is already in progress for this location
        if (this.ongoingRequests.has(cacheKey)) {
          console.log(`📍Request already in progress for geocode: ${cacheKey}`);
          return this.ongoingRequests.get(cacheKey)!;
        }
    
        // Create a new request and store it in the ongoingRequests map
        const requestPromise = this.makeGeocodeRequest(location);
        this.ongoingRequests.set(cacheKey, requestPromise);
    
        try {
          const response = await requestPromise;
          this.cache.set(cacheKey, response); // Cache the response
          return response;
        } finally {
          // Remove the request from ongoingRequests once it completes
          this.ongoingRequests.delete(cacheKey);
        }
      }
    
      private async makeGeocodeRequest(location: ILocationApi): Promise<ReverseGeocodeResponse> {
        this.requestCount++;
        let url = "https://geocode.maps.co/search?";
        if (location.street) url += `street=${encodeURIComponent(location.street)}&`;
        if (location.city) url += `city=${encodeURIComponent(location.city)}&`;
        if (location.county) url += `county=${encodeURIComponent(location.county)}&`;
        if (location.state) url += `state=${encodeURIComponent(location.state)}&`;
        if (location.country) url += `country=${encodeURIComponent(location.country)}&`;
        if (location.postalcode) url += `postalcode=${encodeURIComponent(location.postalcode)}&`;
    
        console.log(`📍Sending geocode request #${this.requestCount} to ${url}`);
    
        const response = await fetch(`${url}api_key=${GeocodeService.apiKey}`);
        const rawResponse = await response.text();
    
        try {
          const responseJson = JSON.parse(rawResponse);
          console.log(`📍Geocode response: ${JSON.stringify(responseJson)}`);
          return responseJson;
        } catch (e) {
          console.error("Failed to parse JSON. Raw response:", rawResponse);
          throw new ObjectValidationError(`SyntaxError: Failed to parse JSON. Raw response: ${rawResponse}`);
        }
      }
  }