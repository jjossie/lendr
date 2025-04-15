import {Timestamp} from "firebase-admin/firestore";
import { z } from "zod";
import { documentIdSchema, timestampSchema } from "./common.model";


export const lendrUserInputSchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  displayName: z.string().nonempty(),
  relations: z.array(documentIdSchema),
  expoPushTokens:z.array(z.string().startsWith("ExponentPushToken[").endsWith("]")),
  uid: z.string().nonempty(),
  providerData: z.any().optional(),
  photoURL: z.string().url().optional(),
  email: z.string().email().optional(),
});

export const lendrUserModelSchema = z.object({
  createdAt: timestampSchema,
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  displayName: z.string().nonempty(),
  relations: z.array(documentIdSchema),
  expoPushTokens:z.array(z.string().startsWith("ExponentPushToken[").endsWith("]")),
  uid: z.string().nonempty(),
  providerData: z.any().optional(),
  photoURL: z.string().url().optional(),
  email: z.string().email().optional(),
});


export const lendrUserPreviewSchema = lendrUserModelSchema.omit({
  relations: true,
  expoPushTokens: true,
  createdAt: true,
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