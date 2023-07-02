//
// Code courtesy of:
// https://github.com/algolia/doc-code-samples/tree/master/react-instantsearch-hooks-native/getting-started/src  P.S.
// I'm scared

import {Hit as AlgoliaHit} from '@algolia/client-search';
import {TimeUnit} from "../../models/Tool";

// export type ProductHit = AlgoliaHit<{
//   brand: string;
//   categories: string[];
//   comments: number;
//   description: string;
//   free_shipping: boolean;
//   hierarchicalCategories: {
//     lvl0: string;
//     lvl1?: string;
//     lvl2?: string;
//     lvl3?: string;
//     lvl4?: string;
//     lvl5?: string;
//     lvl6?: string;
//   };
//   image: string;
//   name: string;
//   popularity: number;
//   price: number;
//   prince_range: string;
//   rating: number;
//   sale: boolean;
//   sale_price: string;
//   type: string;
//   url: string;
// }>;

export type ProductHit = AlgoliaHit<{
  objectID: string; // Added after retrieving from firestore
  path: string;
  name: string;
  description: string;
  brand?: string;
  imageUrl?: string;
  lenderName?: string;
  price: number;
  timeUnit: TimeUnit
  delivery: boolean;
  localPickup: boolean;
  useOnSite: boolean;
  // relativeDistance?: number;
  city?: string;
  _geoloc?: {
    lat: number;
    lng: number;
  }
}>;