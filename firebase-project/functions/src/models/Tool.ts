import {ILocation} from "./Location";
import {Geopoint} from "geofire-common";
import {Timestamp} from "firebase/firestore";
import {ILendrUserPreview} from "./ILendrUser";

export interface ITool {

  id?: string; // Added after retrieving from firestore
  name: string;
  brand?: string;
  description: string;
  imageUrls: string[];
  lenderUid: string;
  holderUid: string;
  lender?: ILendrUserPreview, // Hydrated by validateTool
  holder?: ILendrUserPreview, // Hydrated by validateTool
  createdAt: Timestamp;
  /** @deprecated */
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
    timeUnit: TimeUnit;
  },
  preferences: ExchangePreferences;
  geopoint?: Geopoint;
  visibility: ToolVisibility;
}

export interface IToolAdminForm extends IToolForm {
  lenderUid?: string;
  holderUid?: string;
  createdAt?: Timestamp;
  modifiedAt?: Timestamp;
  location?: ILocation;
}

export type ToolVisibility = "draft" | "published";

export interface ExchangePreferences {
  delivery: boolean;
  localPickup: boolean;
  useOnSite: boolean;
}

export type TimeUnit = "hour" | "day" | "week";