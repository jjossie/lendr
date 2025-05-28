import {onDocumentUpdated, Change} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/httpsError";
import { DocumentSnapshot } from "firebase-functions/v1/firestore"; // For Change<DocumentSnapshot>
import {isEqual} from "lodash"; // For deep comparison, if needed for future enhancements

import { lendrUserModelSchema, LendrUserModelValidated } from "../models/lendrUser.model";

export const onUpdateUser = onDocumentUpdated("/users/{userId}", async (event: Change<DocumentSnapshot>) => {
  logger.info(`[onUpdateUser] Triggered for userId: ${event.params.userId}`);

  const beforeData = event.data.before.data() as LendrUserModelValidated | undefined;
  const afterData = event.data.after.data() as LendrUserModelValidated | undefined;

  if (!afterData) {
    logger.info(`[onUpdateUser] User document ${event.params.userId} was deleted. No action taken.`);
    return;
  }

  if (!beforeData) {
    logger.warn(`[onUpdateUser] No 'before' data for user document ${event.params.userId}, though it's an update event. This is unusual.`);
    // Depending on policy, could return or proceed. Proceeding cautiously.
  }

  logger.debug(`[onUpdateUser] Processing update for userId: ${event.params.userId}`);
  const updatedFields: Partial<LendrUserModelValidated> = {};

  // 4. Data Consistency (Future Enhancement - Out of Scope for this subtask)
  // Placeholder for future logic to check if displayName, photoURL, etc., changed
  // and then trigger updates to other documents embedding this user's preview.
  // For example:
  // if (beforeData && afterData.displayName !== beforeData.displayName) {
  //   logger.info(`[onUpdateUser] User ${event.params.userId} displayName changed. Future: trigger updates to embedded previews.`);
  // }

  // 5. Timestamps
  updatedFields.modifiedAt = FieldValue.serverTimestamp() as Timestamp;

  // 6. Construct Candidate Document and Validate
  // Merge afterData with any fields that were updated (e.g., modifiedAt)
  const candidateUserData: LendrUserModelValidated = {
    ...(afterData as LendrUserModelValidated), // Cast: we've established afterData exists
    ...updatedFields, // Apply changes (currently just modifiedAt)
  };
  
  logger.debug(`[onUpdateUser] Validating candidate user data for userId: ${event.params.userId}`);
  const parsedCandidateUser = lendrUserModelSchema.safeParse(candidateUserData);

  if (!parsedCandidateUser.success) {
    logger.error(`[onUpdateUser] Invalid candidate user data after update for userId: ${event.params.userId}`, parsedCandidateUser.error.flatten());
    // The document is already updated, but its new state (plus our changes) is invalid.
    // This is tricky. Reverting is complex. For now, throw to signal failure.
    throw new HttpsError("failed-precondition", "Updated user data is invalid.", parsedCandidateUser.error.flatten());
  }

  const validatedUserData = parsedCandidateUser.data;
  logger.info(`[onUpdateUser] Candidate user data validated for userId: ${event.params.userId}`);

  // 7. Write to Firestore
  // Since modifiedAt is always added to updatedFields, Object.keys(updatedFields).length will be > 0.
  // We write the validatedUserData which includes all fields from afterData plus the server-set modifiedAt.
  // This also ensures that if any other logic (currently out of scope) added fields to updatedFields, they get written.
  if (Object.keys(updatedFields).length > 0) {
    logger.info(`[onUpdateUser] Writing updated user document to Firestore for userId: ${event.params.userId}. Changes: ${Object.keys(updatedFields).join(", ")}`);
    try {
      // We use validatedUserData which includes all fields, correctly typed and validated.
      // merge:true ensures we only update specified fields or add new ones.
      await event.data.after.ref.set(validatedUserData, {merge: true});
      logger.info(`[onUpdateUser] Successfully wrote updates for userId: ${event.params.userId} to Firestore.`);
    } catch (error) {
      logger.error(`[onUpdateUser] Error writing updates for userId: ${event.params.userId} to Firestore:`, error);
      if (error instanceof HttpsError) throw error; // Should not happen here
      throw new HttpsError("internal", "Failed to save the updated user document.", { error });
    }
  } else {
    // This case should ideally not be reached if modifiedAt is always added.
    logger.warn(`[onUpdateUser] No fields (not even modifiedAt) were marked for update for userId: ${event.params.userId}. This is unexpected.`);
  }

  logger.debug(`[onUpdateUser] Function execution completed for userId: ${event.params.userId}`);
});
