import {Timestamp} from "firebase-admin/firestore";
import {lendrUserSchema, LendrUserValidated} from "./lendrUser.model";
import {Tool} from "./tool.model";
import { z } from "zod";
import { LoanValidated } from "./loan.model";
import { ChatMessage, chatMessageSchema, ChatReactionValidated } from "./chat.model";

// export interface Relation {
//   id?: string // Added after retrieving from firestore
//   users: LendrUserValidated[];
//   createdAt: Timestamp;
//   lastMessage?: ChatMessage; // Hydrated after retrieval
//   otherUser?: LendrUserValidated; // Hydrated after retrieval
//   // Need to figure out how to include subcollection data. Or don't do it at all?
// }

// export interface ChatViewListItem {
//   id: string // Added after retrieving from firestore
//   users?: LendrUserValidated[];
//   createdAt: Timestamp;
//   lastMessage?: ChatMessage; // Hydrated after retrieval
//   otherUser: LendrUserValidated;
// }



export const relationSchema = z.object({
  id: z.string().optional(),
  users: z.array(lendrUserSchema).length(2),
  createdAt: z.instanceof(Timestamp),
  lastMessage: chatMessageSchema.optional(),
  otherUser: z.any().optional(),
});

export const chatViewListItemSchema = z.object({
  id: z.string(),
  users: z.array(z.any()).optional(),
  createdAt: z.instanceof(Timestamp),
  lastMessage: chatMessageSchema.optional(),
  otherUser: z.any(),
});


// Validated Types
export type RelationValidated = z.infer<typeof relationSchema>;
export type ChatMessageValidated = z.infer<typeof chatMessageSchema>;
export type ChatViewListItemValidated = z.infer<typeof chatViewListItemSchema>;


// Input Types (still need to determine if useful)
// export type RelationInput = Omit<RelationValidated, "id" | "createdAt" | "lastMessage" | "otherUser">;
// export type LoanInput = Omit<LoanValidated, "id" | "tool" | "inquiryDate" | "loanDate" | "returnDate">;
// export type ChatMessageInput = Omit<ChatMessageValidated, "id" | "createdAt" | "reaction">;
// export type ChatMessageReactionInput = Omit<ChatReactionValidated, "userRef">;
