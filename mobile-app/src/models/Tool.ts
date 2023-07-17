import {ILocation} from "./Location";
import {ILendrUser} from "./ILendrUser";
import {Geopoint} from "geofire-common";
import {Timestamp} from "firebase/firestore";

type Rate = {
  price: number;
  timeUnit: TimeUnit
};

export interface ITool {

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
  deletedAt?: any; // Only for firestore use, deprecated
  modifiedAt: Timestamp;
  rate: Rate,
  preferences: {
    delivery: boolean;
    localPickup: boolean;
    useOnSite: boolean;
  }
  location: ILocation;
  visibility: ToolVisibility;
}

export interface IToolPreview {
  id: string;
  name: string;
  imageUrl: string;
  rate: Rate;
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
  rate: Rate,
  preferences: ExchangePreferences;
  geopoint?: Geopoint;
  visibility: ToolVisibility;
}

export type ToolVisibility = "draft" | "published";

export interface ExchangePreferences {
  delivery: boolean;
  localPickup: boolean;
  useOnSite: boolean;
}

export type TimeUnit = "hour" | "day" | "week";