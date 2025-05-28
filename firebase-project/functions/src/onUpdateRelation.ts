import {onDocumentUpdated, Change} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/httpsError";
import { DocumentSnapshot } from "firebase-functions/v1/firestore"; // For Change<DocumentSnapshot>
import {isEqual} from "lodash"; // For deep comparison of objects

import { relationModelSchema, RelationModelValidated } from "../models/relation.model";
import { LendrUserPreviewValidated, lendrUserPreviewSchema } from "../models/lendrUser.model";
import { getHydratedUserPreview } from "../controllers/users.controller";

export const onUpdateRelation = onDocumentUpdated("/relations/{relationId}", async (event: Change<DocumentSnapshot>) => {
  logger.info(`[onUpdateRelation] Triggered for relationId: ${event.params.relationId}`);

  const beforeData = event.data.before.data() as RelationModelValidated | undefined;
  const afterData = event.data.after.data() as RelationModelValidated | undefined;

  if (!afterData) {
    logger.info(`[onUpdateRelation] Relation document ${event.params.relationId} was deleted. No action taken.`);
    return;
  }

  if (!beforeData) {
    logger.warn(`[onUpdateRelation] No 'before' data for relation document ${event.params.relationId}, though it's an update event. This is unusual.`);
    // Depending on policy, could return or proceed. Proceeding cautiously.
  }

  logger.debug(`[onUpdateRelation] Processing update for relationId: ${event.params.relationId}`);
  const updatedFields: Partial<RelationModelValidated> = {};

  // 4. Denormalization/Re-embedding (User Previews)
  // This is primarily to refresh previews if UIDs somehow change or if previews become stale.
  // relationModelSchema.users is an array of two LendrUserPreviewValidated objects.
  // lendrUserPreviewSchema requires uid and displayName.
  if (afterData.users && afterData.users.length === 2 && beforeData?.users && beforeData.users.length === 2) {
    if (!isEqual(afterData.users, beforeData.users)) {
      logger.info(`[onUpdateRelation] Users array changed for relation: ${event.params.relationId}. Fetching fresh user previews.`);
      try {
        const freshUserPreviews: [LendrUserPreviewValidated, LendrUserPreviewValidated] = await Promise.all(
          afterData.users.map(async (userPreview) => {
            if (!userPreview.uid) {
              logger.error(`[onUpdateRelation] User preview in afterData is missing UID for relation: ${event.params.relationId}`, userPreview);
              throw new HttpsError("failed-precondition", "User preview in relation is missing UID.");
            }
            const freshPreview = await getHydratedUserPreview(userPreview.uid);
            // Validate the fetched preview
            const validation = lendrUserPreviewSchema.safeParse(freshPreview);
            if (!validation.success) {
                logger.error(`[onUpdateRelation] Fetched user preview for UID ${userPreview.uid} is invalid.`, validation.error.flatten());
                throw new HttpsError("internal", `Fetched user preview for UID ${userPreview.uid} is invalid.`);
            }
            return validation.data;
          })
        ) as [LendrUserPreviewValidated, LendrUserPreviewValidated]; // Ensure tuple type

        // Only update if the fresh previews are different from what's already in afterData.users
        // This can happen if afterData.users was manually (and perhaps incorrectly) updated by a client.
        if (!isEqual(afterData.users, freshUserPreviews)) {
            updatedFields.users = freshUserPreviews;
            logger.info(`[onUpdateRelation] User previews updated for relationId: ${event.params.relationId}`);
        }
      } catch (error) {
        logger.error(`[onUpdateRelation] Failed to hydrate user previews for relationId: ${event.params.relationId}`, error);
        // Don't throw here, allow other updates (like modifiedAt) to proceed if possible.
        // If this is critical, an error should be thrown.
      }
    }
  } else if (afterData.users && afterData.users.length === 2) {
    // This block handles the case where beforeData.users might not exist (e.g., if users field was added in this update)
    // or if the structure is not as expected. Attempt to refresh if it looks like valid user previews are there.
    logger.info(`[onUpdateRelation] Users array in afterData exists, but beforeData.users is missing or not an array of two. Attempting to refresh previews for relation: ${event.params.relationId}`);
    try {
        const freshUserPreviews: [LendrUserPreviewValidated, LendrUserPreviewValidated] = await Promise.all(
            afterData.users.map(async (userPreview) => {
              if (!userPreview.uid) {
                logger.error(`[onUpdateRelation] User preview in afterData is missing UID for relation: ${event.params.relationId}`, userPreview);
                throw new HttpsError("failed-precondition", "User preview in relation is missing UID during initial hydration attempt.");
              }
              const freshPreview = await getHydratedUserPreview(userPreview.uid);
              const validation = lendrUserPreviewSchema.safeParse(freshPreview);
              if (!validation.success) {
                  logger.error(`[onUpdateRelation] Fetched user preview for UID ${userPreview.uid} is invalid (initial hydration).`, validation.error.flatten());
                  throw new HttpsError("internal", `Fetched user preview for UID ${userPreview.uid} is invalid (initial hydration).`);
              }
              return validation.data;
            })
          ) as [LendrUserPreviewValidated, LendrUserPreviewValidated];
  
          if (!isEqual(afterData.users, freshUserPreviews)) {
              updatedFields.users = freshUserPreviews;
              logger.info(`[onUpdateRelation] User previews updated (from potentially incomplete beforeData) for relationId: ${event.params.relationId}`);
          }
    } catch (error) {
        logger.error(`[onUpdateRelation] Failed to hydrate user previews (from potentially incomplete beforeData) for relationId: ${event.params.relationId}`, error);
    }
  }


  // 5. Timestamp for modification
  updatedFields.modifiedAt = FieldValue.serverTimestamp() as Timestamp;

  // 6. Construct Candidate Document and Validate
  const candidateRelationData: RelationModelValidated = {
    ...(afterData as RelationModelValidated), // Cast: we've established afterData exists
    ...updatedFields, // Apply changes
  };
  
  logger.debug(`[onUpdateRelation] Validating candidate relation data for relationId: ${event.params.relationId}`);
  const parsedCandidateRelation = relationModelSchema.safeParse(candidateRelationData);

  if (!parsedCandidateRelation.success) {
    logger.error(`[onUpdateRelation] Invalid candidate relation data after update and denormalization for relationId: ${event.params.relationId}`, parsedCandidateRelation.error.flatten());
    throw new HttpsError("failed-precondition", "Updated relation data is invalid.", parsedCandidateRelation.error.flatten());
  }

  const validatedRelationData = parsedCandidateRelation.data;
  logger.info(`[onUpdateRelation] Candidate relation data validated for relationId: ${event.params.relationId}`);

  // 7. Write to Firestore
  // Only write if there are actual changes beyond just modifiedAt, or if modifiedAt is the only change.
  // The simplest is to write if updatedFields has any keys, as modifiedAt is always added.
  if (Object.keys(updatedFields).length > 0) {
    // Check if other fields than modifiedAt were changed, or if afterData itself changed compared to beforeData.
    // This is to avoid writes if only modifiedAt was programmatically added but no actual data changed.
    const meaningfulChange = Object.keys(updatedFields).some(key => key !== 'modifiedAt') || 
                             (beforeData && !isEqual(beforeData, afterData)); // Check if the original document changed

    if (meaningfulChange || updatedFields.modifiedAt) { // Always write if modifiedAt is there.
        logger.info(`[onUpdateRelation] Writing updated relation document to Firestore for relationId: ${event.params.relationId}. Changes: ${Object.keys(updatedFields).join(", ")}`);
        try {
          await event.data.after.ref.set(validatedRelationData, {merge: true});
          logger.info(`[onUpdateRelation] Successfully wrote updates for relationId: ${event.params.relationId} to Firestore.`);
        } catch (error) {
          logger.error(`[onUpdateRelation] Error writing updates for relationId: ${event.params.relationId} to Firestore:`, error);
          if (error instanceof HttpsError) throw error;
          throw new HttpsError("internal", "Failed to save the updated relation document.", { error });
        }
    } else {
        logger.info(`[onUpdateRelation] No meaningful data changes detected for relationId: ${event.params.relationId}, skipping write.`);
    }
  } else {
    // This case should not be reached if modifiedAt is always added to updatedFields.
    // However, if logic changes, this log can be useful.
    logger.info(`[onUpdateRelation] No fields were marked for update for relationId: ${event.params.relationId}.`);
  }

  logger.debug(`[onUpdateRelation] Function execution completed for relationId: ${event.params.relationId}`);
});
