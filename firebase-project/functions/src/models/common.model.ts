import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

// Custom refinement to validate FieldValue or Timestamp
export const timestampSchema = z.any().refine(
    (value) =>
      value instanceof Timestamp || value === FieldValue.serverTimestamp(),
    {
      message: "Must be a Firestore Timestamp or FieldValue.serverTimestamp()",
    }
  );


export const documentIdSchema = z.string().length(28);
export const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  geohash: z.string(),
  city: z.string().optional(),
  relativeDistance: z.number().optional(),
});


export type DocumentIdValidated = z.infer<typeof documentIdSchema>;
export type LocationValidated = z.infer<typeof locationSchema>;


export type Location = {
  latitude: number;
  longitude: number;
  geohash: string;
  city?: string;
  relativeDistance?: number;
}