import { z } from "zod";

export const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  geohash: z.string(),
  city: z.string().optional(),
  relativeDistance: z.number().optional(),
});

export type Location = z.infer<typeof locationSchema>;