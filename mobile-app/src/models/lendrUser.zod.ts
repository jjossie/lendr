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
  uid: z.string().nonempty(),
  email: z.string().email().optional(),
  displayName: z.string().nonempty(),
  firstName: z.string().nonempty(), // Aligned with Firebase backend schema
  lastName: z.string().nonempty(),  // Aligned with Firebase backend schema
  photoURL: z.string().url().optional(),
  expoPushTokens: z.array(z.string().startsWith("ExponentPushToken[").endsWith("]")).optional(),
  createdAt: z.instanceof(Timestamp),
  modifiedAt: z.instanceof(Timestamp).optional(),
  relations: z.array(z.string()).optional(), // Array of UIDs
  providerData: z.any().optional(), // To store provider-specific data e.g. from Firebase Auth
});

// Infer TypeScript types from Zod schemas
export type LendrUserPreview = z.infer<typeof LendrUserPreviewSchema>;
export type LendrUser = z.infer<typeof LendrUserSchema>;
