import {ILocation} from "./Location";
// import {DocumentReference} from "firebase/firestore";
import {ILendrUser} from "./ILendrUser";
import {Geopoint} from "geofire-common";
import {DocumentReference, Timestamp} from "firebase/firestore";

export interface ITool {
  // Only for backward compatibility
  // TODO remove after data migration
  lenderRef?: DocumentReference<ILendrUser>;
  holderRef?: DocumentReference<ILendrUser>;


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
}

/**
 * This should represent only data that is physically entered by the user. Everything else
 * should be gathered by the controller - the lenderRef, other assumed information.
 * Location may eventually be an exception to this because we may want to let the user specify
 * where they are listing a tool.
 */
export interface IToolForm {
  name: string;
  brand?: string;
  description: string;
  imageUrls: string[];
  rate: {
    price: number;
    timeUnit: TimeUnit
  },
  preferences: ExchangePreferences
  geopoint?: Geopoint
}



export interface ExchangePreferences {
  delivery: boolean;
  localPickup: boolean;
  useOnSite: boolean;
}

export type TimeUnit = "hour" | "day" | "week";