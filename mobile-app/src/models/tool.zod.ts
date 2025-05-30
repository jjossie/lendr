import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import { LendrUserPreviewSchema } from "./lendrUser.zod.ts"; // Import LendrUserPreviewSchema

// Schema for the 'rate' object
const RateSchema = z.object({
  price: z.number().positive(),
  timeUnit: z.enum(["hour", "day", "week"]),
});

// Schema for the 'preferences' object
const ExchangePreferencesSchema = z.object({
  delivery: z.boolean(),
  localPickup: z.boolean(),
  useOnSite: z.boolean(),
});

// Schema for the 'geopoint' object within 'location'
const GeopointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

// Schema for the 'location' object
const LendrLocationSchema = z.object({
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  geopoint: GeopointSchema.optional(), 
});

// LendrUserPreviewSchema is now defined in lendrUser.zod.ts and imported above.
// The old definition is removed.

// Main schema for the Tool model
export const ToolModelSchema = z.object({
  id: z.string().optional(),
  name: z.string().nonempty(),
  brand: z.string().optional(),
  description: z.string(),
  imageUrls: z.array(z.string()),
  lenderUid: z.string().nonempty(),
  holderUid: z.string().nonempty(),
  lender: LendrUserPreviewSchema.optional(), // Using the imported LendrUserPreviewSchema
  holder: LendrUserPreviewSchema.optional(), // Using the imported LendrUserPreviewSchema
  createdAt: z.instanceof(Timestamp),
  deletedAt: z.any().optional(), // Using z.any() for deprecated fields
  modifiedAt: z.instanceof(Timestamp),
  rate: RateSchema,
  preferences: ExchangePreferencesSchema,
  location: LendrLocationSchema,
  visibility: z.enum(["draft", "published"]),
});

export type Tool = z.infer<typeof ToolModelSchema>;
