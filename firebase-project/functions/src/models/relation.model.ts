import { lendrUserPreviewSchema } from "./lendrUser.model";
import { z } from "zod";
import { chatMessageInputSchema } from "./chat.model";
import { timestampSchema } from "./common.model";


export const relationSchema = z.object({
  id: z.string().optional(),
  users: z.array(lendrUserPreviewSchema).length(2),
  createdAt: timestampSchema,
  lastMessage: chatMessageInputSchema.optional(),
  otherUser: z.any().optional(),
});

export const chatViewListItemSchema = z.object({
  id: z.string(),
  users: z.array(z.any()).optional(),
  createdAt: timestampSchema,
  lastMessage: chatMessageInputSchema.optional(),
  otherUser: z.any(),
});


// Validated Types
export type RelationValidated = z.infer<typeof relationSchema>;
export type ChatMessageValidated = z.infer<typeof chatMessageInputSchema>;
export type ChatViewListItemValidated = z.infer<typeof chatViewListItemSchema>;