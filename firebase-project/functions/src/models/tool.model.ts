import {Location} from "./location.model";
import {Geopoint} from "geofire-common";
import {Timestamp} from "firebase-admin/firestore";
import {LendrUserPreview} from "./lendrUser.model";

export interface Tool {

  id?: string; // Added after retrieving from firestore
  name: string;
  brand?: string;
  description: string;
  imageUrls: string[];
  lenderUid: string;
  holderUid: string;
  lender?: LendrUserPreview, // Hydrated by validateTool
  holder?: LendrUserPreview, // Hydrated by validateTool
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
  location: Location;
  visibility: ToolVisibility;
}

/**
 * This should represent only data that is physically entered by the user. Everything else
 * should be gathered by the controller - the lenderRef, other assumed information.
 * Location may eventually be an exception to this because we may want to let the user specify
 * where they are listing a tool.
 */
export interface ToolForm {
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

/**
 * Should only be used by Firestore seed script
 */
export interface ToolAdminForm extends ToolForm {
  lenderUid?: string;
  holderUid?: string;
  createdAt?: Timestamp;
  modifiedAt?: Timestamp;
  location?: Location;
}

export type ToolVisibility = "draft" | "published";

export interface ExchangePreferences {
  delivery: boolean;
  localPickup: boolean;
  useOnSite: boolean;
}

export type TimeUnit = "hour" | "day" | "week";