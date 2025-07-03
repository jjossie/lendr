import { z } from "zod";
import { Timestamp } from "@react-native-firebase/firestore";
// It's generally better to have LendrUserPreviewSchema in its own file like 'lendrUser.zod.ts'.
// LendrUserPreviewSchema is now defined in its own file.
import { LendrUserPreview, LendrUserPreviewSchema } from "./lendrUser.zod"; 

// Schema for ChatMessage reaction
export const ChatReactionSchema = z.object({
  emoji: z.string(),
  userRef: z.string(), // UID of the user who reacted
});

// Schema for ChatMessage
export const ChatMessageSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  senderUid: z.string(),
  receiverUid: z.string(),
  createdAt: z.instanceof(Timestamp),
  replyingToId: z.string().optional(),
  reaction: ChatReactionSchema.optional(),
  media: z.any().optional(), // For potential images, files, etc.
});

// Schema for Loan
// Based on mobile-app/src/models/relation.ts Loan interface
export const LoanSchema = z.object({
  id: z.string().optional(),
  toolId: z.string(),
  tool: z.any().optional(), // Placeholder for ToolPreviewSchema as per instructions
  inquiryDate: z.instanceof(Timestamp).optional(),
  loanDate: z.instanceof(Timestamp).optional(),
  returnDate: z.instanceof(Timestamp).optional(),
  status: z.enum([
    "inquired",
    "loanRequested",
    "loaned",
    "returnRequested",
    "returned",
    "canceled",
  ]),
  lenderUid: z.string(),
  borrowerUid: z.string(),
  relationId: z.string().optional(), // Often useful for connecting loan back to a relation/chat
  modifiedAt: z.instanceof(Timestamp).optional(), // For tracking updates to the loan
});

// Schema for Relation
// Based on mobile-app/src/models/relation.ts Relation interface
// and firebase-project/functions/src/models/relation.model.ts relationSchema
export const RelationSchema = z.object({
  id: z.string().optional(),
  // users array should contain two user previews, consistent with Firebase structure
  users: z.array(LendrUserPreviewSchema).length(2, "A relation must involve exactly two users."),
  createdAt: z.instanceof(Timestamp),
  modifiedAt: z.instanceof(Timestamp).optional(), // For tracking updates to the relation
  lastMessage: ChatMessageSchema.optional(), // Denormalized last message for quick display
  // activeLoanId and activeLoan can be added if they are part of Firestore structure
  // activeLoanId: z.string().optional(),
  // activeLoan: LoanSchema.optional(), // Use z.lazy(() => LoanSchema.optional()) if self-referencing issues
});

// Infer TypeScript types from Zod schemas
export type ChatReaction = z.infer<typeof ChatReactionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Loan = z.infer<typeof LoanSchema>;
export type RelationValidated = z.infer<typeof RelationSchema>;
export interface RelationHydrated extends RelationValidated {
  otherUser: LendrUserPreview;
  // lastMessage?: ChatMessage;
  // loans: ILoan[];
}

