import { lendrUserPreviewSchema } from "./lendrUser.model";
import { z } from "zod";
import { chatMessageInputSchema } from "./chat.model";
import { timestampSchema } from "./common.model";

// Schema for data input when CREATING a new relation
export const relationInputSchema = z.object({
  // Expects an array of two user UIDs.
  // Example: { userIds: ["uid1", "uid2"] }
  userIds: z.tuple([z.string().nonempty(), z.string().nonempty()])
    .refine(data => data[0] !== data[1], {
      message: "User UIDs in a relation must be different.",
    }),
});

// Schema for relation data as it is STORED IN FIRESTORE (data at rest)
export const relationModelSchema = z.object({
  id: z.string().optional(), // Document ID, typically added post-fetch
  users: z.array(lendrUserPreviewSchema).length(2), // Array of two user previews
  createdAt: timestampSchema.optional(), // Server-set timestamp
  modifiedAt: timestampSchema.optional(), // Server-set timestamp for updates
  lastMessage: chatMessageInputSchema.optional(), // Denormalized last message preview
  otherUser: z.any().optional(), // This field seems for client-side convenience, type could be refined
});

export const chatViewListItemSchema = z.object({
  id: z.string(),
  users: z.array(z.any()).optional(),
  createdAt: timestampSchema, // Note: This is required here, vs optional in relationModelSchema
  lastMessage: chatMessageInputSchema.optional(),
  otherUser: z.any(),
});


// Validated Types
export type RelationInputValidated = z.infer<typeof relationInputSchema>;
export type RelationModelValidated = z.infer<typeof relationModelSchema>;
export type ChatMessageValidated = z.infer<typeof chatMessageInputSchema>;
export type ChatViewListItemValidated = z.infer<typeof chatViewListItemSchema>;