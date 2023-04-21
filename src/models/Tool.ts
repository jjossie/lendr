import {ILocation} from "./Location";
import {DocumentReference} from "firebase/firestore";

export interface ITool {
  id?: string;
  name: string;
  brand?: string;
  description: string;
  lenderRef: DocumentReference;
  lender?: {
    uid?: string;
    name: string;
    profileImgPath: string;
    rating: number;
  },

  rate: {
    price: number;
    timeUnit: TimeUnit
  },
  preferences: {
    delivery: boolean;
    localPickup: boolean;
    useOnSite: boolean;
  }
  location?: ILocation;
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
  rate: {
    price: number;
    timeUnit: TimeUnit
  },
  preferences: ExchangePreferences
  location?: ILocation
}



export interface ExchangePreferences {
  delivery?: boolean;
  localPickup?: boolean;
  useOnSite?: boolean;
}

export type TimeUnit = "hour" | "day" | "week";