import { lendrUserSchema } from "./lendrUser.model";
import { z } from "zod";
import { chatMessageInputSchema } from "./chat.model";
import { timestampSchema } from "./common.model";


export const relationSchema = z.object({
  id: z.string().optional(),
  users: z.array(lendrUserSchema).length(2),
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


// Input Types (still need to determine if useful)
// export type RelationInput = Omit<RelationValidated, "id" | "createdAt" | "lastMessage" | "otherUser">;
// export type LoanInput = Omit<LoanValidated, "id" | "tool" | "inquiryDate" | "loanDate" | "returnDate">;
// export type ChatMessageInput = Omit<ChatMessageValidated, "id" | "createdAt" | "reaction">;
// export type ChatMessageReactionInput = Omit<ChatReactionValidated, "userRef">;
