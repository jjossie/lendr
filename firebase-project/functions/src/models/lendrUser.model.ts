import {Timestamp} from "firebase-admin/firestore";
import { z, ZodSchema } from "zod";
import { documentIdSchema } from "./utils.model";



export const lendrUserSchema = z.object({
  createdAt: z.instanceof(Timestamp).or(z.string().datetime()),
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  displayName: z.string().nonempty().optional(),
  relations: z.array(documentIdSchema),
  expoPushTokens:z.array(z.string().startsWith("ExponentPushToken[").endsWith("]")),
  uid: z.string(),
  providerData: z.any().optional(),
  photoURL: z.string().url().optional(),
  email: z.string().email().optional(),
});



export type LendrUserValidated = z.infer<typeof lendrUserSchema>;

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