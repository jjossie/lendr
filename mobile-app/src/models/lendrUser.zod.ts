import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// Based on firebase-project/functions/src/models/lendrUser.model.ts lendrUserPreviewSchema
// and mobile-app/src/models/lendrUser.ts LendrUserPreview interface
export const LendrUserPreviewSchema = z.object({
  uid: z.string().nonempty(),
  displayName: z.string().nonempty(),
  firstName: z.string().nonempty(), // Aligned with Firebase backend schema
  lastName: z.string().nonempty(),  // Aligned with Firebase backend schema
  photoURL: z.string().url().optional(),
  // email is not part of the Firebase preview schema
});

// Based on firebase-project/functions/src/models/lendrUser.model.ts lendrUserModelSchema
// and mobile-app/src/models/lendrUser.ts LendrUser interface
export const LendrUserSchema = z.object({
  uid: z.string().nonempty().optional(), // Make uid optional for transform
  email: z.string().email().optional(),
  displayName: z.string().nonempty(),
  firstName: z.string().nonempty(), // Aligned with Firebase backend schema
  lastName: z.string().nonempty(),  // Aligned with Firebase backend schema
  photoURL: z.string().url().optional(),
  expoPushTokens: z.array(z.string().startsWith("ExponentPushToken[").endsWith("]")),
  createdAt: z.instanceof(Timestamp),
  modifiedAt: z.instanceof(Timestamp).optional(),
  relations: z.array(z.string()), // Array of UIDs
  providerData: z.any().optional(), // To store provider-specific data e.g. from Firebase Auth
}).transform((data) => {
  // If uid is missing, try to get it from providerData.uid
  if (!data.uid && data.providerData && typeof data.providerData.uid === "string") {
    return { ...data, uid: data.providerData.uid };
  }
  return data;
}).refine(
  (data) => !!data.uid,
  { message: "uid is required (either directly or via providerData.uid)" }
);

// Infer TypeScript types from Zod schemas
export type LendrUserPreview = z.infer<typeof LendrUserPreviewSchema>;
export type LendrUserValidated = z.infer<typeof LendrUserSchema>;
