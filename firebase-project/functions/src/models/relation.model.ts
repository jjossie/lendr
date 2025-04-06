import {Timestamp} from "firebase-admin/firestore";
import {lendrUserSchema, LendrUserValidated} from "./lendrUser.model";
import {Tool} from "./tool.model";
import { z } from "zod";

export interface Relation {
  id?: string // Added after retrieving from firestore
  users: LendrUserValidated[];
  createdAt: Timestamp;
  lastMessage?: ChatMessage; // Hydrated after retrieval
  otherUser?: LendrUserValidated; // Hydrated after retrieval
  // Need to figure out how to include subcollection data. Or don't do it at all?
}

export interface ChatViewListItem {
  id: string // Added after retrieving from firestore
  users?: LendrUserValidated[];
  createdAt: Timestamp;
  lastMessage?: ChatMessage; // Hydrated after retrieval
  otherUser: LendrUserValidated;
}

export type LoanStatus = "inquired" | "loanRequested" | "loaned" | "returnRequested" | "returned" | "canceled";

/**
 * For now, this is using references instead of embedding documents. Should
 * probably change that in the future.
 */
export interface Loan {
  id?: string;
  toolId: string;
  tool?: Tool;
  inquiryDate?: Timestamp;
  loanDate?: Timestamp;
  returnDate?: Timestamp;
  status: LoanStatus;
  lenderUid: string;
  borrowerUid: string;
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderUid: string;
  receiverUid: string;
  createdAt: Timestamp;
  replyingToId?: string;
  reaction?: ChatReaction;
  media?: any;
}

export interface ChatReaction {
  emoji: string;
  userRef: string;
}

export const chatReactionSchema = z.object({
  emoji: z.string(),
  userRef: z.string(),
});

export const chatMessageSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  senderUid: z.string(),
  receiverUid: z.string(),
  createdAt: z.instanceof(Timestamp),
  replyingToId: z.string().optional(),
  reaction: chatReactionSchema.optional(),
  media: z.any().optional(),
});

const loanStatusSchema = z.enum(["inquired", "loanRequested", "loaned", "returnRequested", "returned", "canceled"]);

export const loanSchema = z.object({
  id: z.string().optional(),
  toolId: z.string(),
  tool: z.any().optional(),
  inquiryDate: z.instanceof(Timestamp).optional(),
  loanDate: z.instanceof(Timestamp).optional(),
  returnDate: z.instanceof(Timestamp).optional(),
  status: loanStatusSchema,
  lenderUid: z.string(),
  borrowerUid: z.string(),
});

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
export type LoanValidated = z.infer<typeof loanSchema>;
export type ChatMessageValidated = z.infer<typeof chatMessageSchema>;
export type ChatViewListItemValidated = z.infer<typeof chatViewListItemSchema>;
export type LoanStatusValidated = z.infer<typeof loanStatusSchema>;
export type ChatReactionValidated = z.infer<typeof chatReactionSchema>;


// Input Types (still need to determine if useful)
export type RelationInput = Omit<RelationValidated, "id" | "createdAt" | "lastMessage" | "otherUser">;
export type LoanInput = Omit<LoanValidated, "id" | "tool" | "inquiryDate" | "loanDate" | "returnDate">;
export type ChatMessageInput = Omit<ChatMessageValidated, "id" | "createdAt" | "reaction">;
export type ChatMessageReactionInput = Omit<ChatReactionValidated, "userRef">;
