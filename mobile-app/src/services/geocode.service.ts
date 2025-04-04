import { ObjectValidationError } from "../utils/errors";

type GeocodeResponse = {
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
    private cache: Map<string, GeocodeResponse>;
    private ongoingRequests: Map<string, Promise<GeocodeResponse>>;
    private requestCount: number;


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
  
    private getCacheKey(lat: number, lon: number): string {
      return `${lat},${lon}`;
    }
  
    async reverseGeocode(lat: number, lon: number): Promise<GeocodeResponse> {
      const cacheKey = this.getCacheKey(lat, lon);
  
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
      const requestPromise = this.makeRequest(lat, lon);
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
  
    private async makeRequest(lat: number, lon: number): Promise<GeocodeResponse> {
      this.requestCount++;
      const url = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`;
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
  }