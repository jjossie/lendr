import { z } from "zod";
import { timestampSchema } from "./common.model";

  export const chatReactionSchema = z.object({
    emoji: z.string(),
    userRef: z.string(),
  });
  
  export const chatMessageInputSchema = z.object({
    text: z.string(),
    senderUid: z.string(),
    receiverUid: z.string(),
    replyingToId: z.string().optional(),
    reaction: chatReactionSchema.optional(),
    media: z.any().optional(),
  });

  export const chatMessageModelSchema = z.object({
    text: z.string(),
    senderUid: z.string(),
    receiverUid: z.string(),
    createdAt: timestampSchema,
    replyingToId: z.string().optional(),
    reaction: chatReactionSchema.optional(),
    media: z.any().optional(),
  });

export type ChatReactionValidated = z.infer<typeof chatReactionSchema>;
export type ChatMessageModelValidated = z.infer<typeof chatMessageModelSchema>;
export type ChatMessageInputValidated = z.infer<typeof chatMessageInputSchema>;


