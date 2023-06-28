//
// Code courtesy of: https://github.com/algolia/doc-code-samples/tree/master/react-instantsearch-hooks-native/getting-started/src
//
// P.S. I'm scared

import {Hit as AlgoliaHit} from '@algolia/client-search';
import {ILendrUser} from "../../models/ILendrUser";
import {TimeUnit, ToolVisibility} from "../../models/Tool";
import {Timestamp} from "firebase/firestore";
import {ILocation} from "../../models/Location";

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
  id?: string; // Added after retrieving from firestore
  name: string;
  brand?: string;
  description: string;
  imageUrls: string[];
  lenderUid: string;
  holderUid: string;
  lender?: ILendrUser, // Hydrated after retrieving from firestore
  holder?: ILendrUser, // Must be hydrated... after retrieving from firestore?
  createdAt: Timestamp;
  deletedAt?: any; // Only for firestore use
  modifiedAt: Timestamp;
  rate: {
    price: number;
    timeUnit: TimeUnit
  },
  preferences: {
    delivery: boolean;
    localPickup: boolean;
    useOnSite: boolean;
  }
  location: ILocation;
  visibility: ToolVisibility;
}>;