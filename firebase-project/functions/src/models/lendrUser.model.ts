import {Timestamp} from "firebase-admin/firestore";
import { z } from "zod";
import { documentIdSchema, timestampSchema } from "./common.model";


export const lendrUserInputSchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  displayName: z.string().nonempty(),
  // relations and expoPushTokens are excluded as they are server-managed or not set at creation.
  uid: z.string().nonempty(),
  providerData: z.any().optional(),
  photoURL: z.string().url().optional(),
  email: z.string().email().optional(),
});

export const lendrUserModelSchema = z.object({
  createdAt: timestampSchema.optional(), // Server-set
  modifiedAt: timestampSchema.optional(), // Server-set on update
  firstName: z.string().nonempty().optional(),
  lastName: z.string().nonempty().optional(),
  displayName: z.string().nonempty(), // Essential display name
  relations: z.array(documentIdSchema).optional(), // Managed by other processes
  expoPushTokens:z.array(z.string().startsWith("ExponentPushToken[").endsWith("]")).optional(), // Managed by other processes
  uid: z.string().nonempty(), // Firebase Auth UID, primary identifier
  providerData: z.any().optional(), // Data from auth provider
  photoURL: z.string().url().optional(),
  email: z.string().email().optional(), // User's email
});


export const lendrUserPreviewSchema = lendrUserModelSchema.omit({
  relations: true,
  expoPushTokens: true,
  createdAt: true,
  modifiedAt: true, // Ensure modifiedAt is also not part of the preview
});

export type LendrUserInputValidated = z.infer<typeof lendrUserInputSchema>;
export type LendrUserModelValidated = z.infer<typeof lendrUserModelSchema>;

export interface LendrUserInput {
  createdAt: Timestamp | string,
  firstName: string,
  lastName: string,
  displayName?: string,
  relations: string[],
  expoPushTokens: string[]
  uid: string,
  providerData?: any,
  photoURL?: string,
  email?: string,
}

export interface LendrUserPreview {
  uid: string,
  displayName: string,
  firstName?: string,
  lastName?: string,
  photoURL?: string,
}