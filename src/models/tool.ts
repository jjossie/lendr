import {LendrLocation} from "./location";
import {Geopoint} from "geofire-common";
import {Timestamp} from "@react-native-firebase/firestore";
import { LendrUserPreview } from "./lendrUser.zod";
import { RequiredExcept } from "../utils/types/typeUtils";

type Rate = {
  price: number;
  timeUnit: TimeUnit
};

export interface Tool {

  id?: string; // Added after retrieving from firestore
  name: string;
  brand?: string;
  description: string;
  imageUrls: string[];
  lenderUid: string;
  holderUid: string;
  lender?: LendrUserPreview, // Hydrated after retrieving from firestore
  holder?: LendrUserPreview, // Must be hydrated... after retrieving from firestore?
  createdAt?: Timestamp;
  deletedAt?: any; // Only for firestore use, deprecated
  modifiedAt?: Timestamp;
  rate: Rate,
  preferences: {
    delivery: boolean;
    localPickup: boolean;
    useOnSite: boolean;
  }
  location: LendrLocation;
  visibility: ToolVisibility;
}

export type ToolHydrated = RequiredExcept<Tool, 'brand' | 'deletedAt'>;

export interface ToolPreview {
  id: string;
  name: string;
  imageUrl: string;
  rate: Rate;
}

/**
 * This should represent only data that is physically entered by the user. Everything else
 * should be gathered by the controller - the lenderUid, other assumed information.
 * Location may eventually be an exception to this because we may want to let the user specify
 * where they are listing a tool.
 */
export interface ToolForm {
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