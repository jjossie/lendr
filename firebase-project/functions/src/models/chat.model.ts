import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

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

export type ChatReactionValidated = z.infer<typeof chatReactionSchema>;
export type ChatMessageValidated = z.infer<typeof chatMessageSchema>;
