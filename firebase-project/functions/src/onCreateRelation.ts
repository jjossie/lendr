import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";

import { relationInputSchema, RelationModelValidated } from "../models/relation.model";
import { LendrUserPreviewValidated, lendrUserPreviewSchema } from "../models/lendrUser.model"; // lendrUserPreviewSchema for validation if needed
import { getHydratedUserPreview, addRelationToUser } from "../controllers/users.controller"; // Assuming this is the correct path and functions

export const onCreateRelation = onDocumentCreated("/relations/{relationId}", async (event) => {
  logger.info(`[onCreateRelation] Triggered for relationId: ${event.params.relationId}`);

  const snapshot = event.data;
  if (!snapshot) {
    logger.error("[onCreateRelation] No data associated with the event.");
    throw new HttpsError("internal", "No data associated with the event.");
  }

  const relationInputData = snapshot.data();

  // 1. Validation
  logger.debug("[onCreateRelation] Validating input data...");
  const parsedRelationInput = relationInputSchema.safeParse(relationInputData);

  if (!parsedRelationInput.success) {
    logger.error(`[onCreateRelation] Invalid relation input data for relationId: ${event.params.relationId}`, parsedRelationInput.error.flatten());
    // The document already exists. Depending on cleanup strategy, could delete it.
    // await snapshot.ref.delete();
    throw new HttpsError("invalid-argument", "Invalid relation data provided.", parsedRelationInput.error.flatten());
  }

  const relationInput = parsedRelationInput.data; // Contains userIds: [string, string]
  logger.info(`[onCreateRelation] Relation input data validated for relationId: ${event.params.relationId}`);

  // 2. Denormalization/Data Embedding & Setup
  logger.debug(`[onCreateRelation] Starting denormalization for relationId: ${event.params.relationId}`);
  
  let userPreviews: [LendrUserPreviewValidated, LendrUserPreviewValidated];
  try {
    logger.debug(`[onCreateRelation] Fetching user previews for UIDs: ${relationInput.userIds[0]}, ${relationInput.userIds[1]}`);
    
    const [userPreview1, userPreview2] = await Promise.all([
      getHydratedUserPreview(relationInput.userIds[0]),
      getHydratedUserPreview(relationInput.userIds[1])
    ]);

    // Validate fetched previews (optional but good practice)
    // lendrUserPreviewSchema has uid and displayName as required due to recent model updates
    const validation1 = lendrUserPreviewSchema.safeParse(userPreview1);
    const validation2 = lendrUserPreviewSchema.safeParse(userPreview2);

    if (!validation1.success || !validation2.success) {
      logger.error(`[onCreateRelation] Fetched user preview(s) are invalid for relationId: ${event.params.relationId}. User1 valid: ${validation1.success}, User2 valid: ${validation2.success}`, 
        {uid1: relationInput.userIds[0], preview1: userPreview1, errors1: validation1.success ? null : validation1.error.flatten()},
        {uid2: relationInput.userIds[1], preview2: userPreview2, errors2: validation2.success ? null : validation2.error.flatten()}
      );
      throw new HttpsError("internal", "Failed to fetch or validate user previews.");
    }
    
    userPreviews = [validation1.data, validation2.data];
    logger.info(`[onCreateRelation] Successfully fetched user previews for relationId: ${event.params.relationId}`);

  } catch (error) {
    logger.error(`[onCreateRelation] Failed to hydrate user previews for UIDs: ${relationInput.userIds[0]}, ${relationInput.userIds[1]}`, error);
    // await snapshot.ref.delete(); // Consider deleting the relation doc if critical info is missing
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to retrieve user information for the relation.");
  }

  const createdAt = FieldValue.serverTimestamp() as Timestamp;

  // 3. Construct Final Relation Document
  const relationDoc: RelationModelValidated = {
    id: event.params.relationId,
    users: userPreviews,
    createdAt: createdAt,
    // lastMessage and otherUser are not set at creation, will be undefined (optional in RelationModelValidated)
  };
  logger.debug(`[onCreateRelation] Constructed final relation document for relationId: ${event.params.relationId}`);

  // 4. Write to Firestore
  logger.info(`[onCreateRelation] Writing denormalized relation document to Firestore for relationId: ${event.params.relationId}`);
  try {
    await snapshot.ref.set(relationDoc, {merge: false}); // merge:false is crucial for onCreate
    logger.info(`[onCreateRelation] Successfully wrote relation document for relationId: ${event.params.relationId} to Firestore.`);
  } catch (error) {
    logger.error(`[onCreateRelation] Error writing relation document for relationId: ${event.params.relationId} to Firestore:`, error);
    // If this fails, the function terminates. The initial document (that triggered this) might remain.
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to save the processed relation document.", { error });
  }

  // 5. Side Effects (Update User Documents)
  logger.info(`[onCreateRelation] Updating user documents for UIDs: ${relationInput.userIds[0]}, ${relationInput.userIds[1]} with relationId: ${event.params.relationId}`);
  try {
    await Promise.all([
      addRelationToUser(relationInput.userIds[0], event.params.relationId),
      addRelationToUser(relationInput.userIds[1], event.params.relationId)
    ]);
    logger.info(`[onCreateRelation] Successfully updated user documents for relationId: ${event.params.relationId}`);
  } catch (error) {
    logger.error(`[onCreateRelation] Error updating one or more user documents for relationId: ${event.params.relationId}. This relation document (ID: ${event.params.relationId}) was created, but user profiles might be inconsistent.`, error);
    // Not re-throwing HttpsError here as the primary operation (relation creation) succeeded.
    // This inconsistency should be monitored or handled by a reconciliation process if critical.
  }

  logger.debug(`[onCreateRelation] Function execution completed for relationId: ${event.params.relationId}`);
});
