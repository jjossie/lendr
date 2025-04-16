import {Timestamp} from "firebase-admin/firestore";
import {LendrUserPreview} from "./lendrUser.model";
import { z } from "zod";
import { locationSchema, timestampSchema, Location} from "./common.model";

export const exchangePreferencesSchema = z.object({
  delivery: z.boolean(),
  localPickup: z.boolean(),
  useOnSite: z.boolean(),
});

const toolRateSchema = z.object({
  price: z.number().positive(),
  timeUnit: z.enum(["hour", "day", "week"]),
});

export const toolSchema = z.object({
  id: z.string().optional(),
  name: z.string().nonempty(),
  brand: z.string().optional(),
  description: z.string(),
  imageUrls: z.array(z.string()),
  lenderUid: z.string().nonempty(),
  holderUid: z.string().nonempty(),
  lender: z.any().optional(),
  holder: z.any().optional(),
  createdAt: timestampSchema,
  deletedAt: z.any().optional(),
  modifiedAt: timestampSchema,
  rate: toolRateSchema,
  preferences: exchangePreferencesSchema,
  location: locationSchema,
  visibility: z.enum(["draft", "published"]),
});

export const toolFormSchema = z.object({
  name: z.string().nonempty().trim(),
  brand: z.string().trim().optional(),
  description: z.string().trim(),
  imageUrls: z.array(z.string()).nonempty(),
  rate: toolRateSchema,
  preferences: exchangePreferencesSchema,
  geopoint: z.array(z.number().min(-180).max(180)).length(2), // TODO verify range
  visibility: z.enum(["draft", "published"]),
  lenderUid: z.string().nonempty(),
  holderUid: z.string().nonempty(),
  createdAt: timestampSchema.optional(),
  modifiedAt: timestampSchema.optional(),
  location: locationSchema.optional()
}).required();

export const toolPreviewSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  imageUrl: z.string().url(),
  rate: toolRateSchema,
});

export type ToolForm = z.infer<typeof toolFormSchema>;
export type ToolDummyForm = Omit<ToolForm, "createdAt" | "modifiedAt" | "location">;
export type ToolValidated = z.infer<typeof toolSchema>;
export type ToolPreviewValidated = z.infer<typeof toolPreviewSchema>;

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
  createdAt?: Timestamp; // Temporarily optional
  /** @deprecated */
  deletedAt?: any; // Only for firestore use
  modifiedAt?: Timestamp; // Temporarily optional
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
//  */
// export interface ToolForm {
//   name: string;
//   brand?: string;
//   description: string;
//   imageUrls: string[];
//   rate: {
//     price: number;
//     timeUnit: TimeUnit;
//   },
//   preferences: ExchangePreferences;
//   geopoint?: Geopoint;
//   visibility: ToolVisibility;
// }

/**
 * Should only be used by Firestore seed script
 */
// export interface ToolAdminForm extends ToolForm {
//   lenderUid?: string;
//   holderUid?: string;
//   createdAt?: Timestamp;
//   modifiedAt?: Timestamp;
//   location?: Location;
// }

export type ToolVisibility = "draft" | "published";

export interface ExchangePreferences {
  delivery: boolean;
  localPickup: boolean;
  useOnSite: boolean;
}

export type TimeUnit = "hour" | "day" | "week";