import { z } from "zod";

export const documentIdSchema = z.string().length(28);
export type DocumentIdType = z.infer<typeof documentIdSchema>;