import {onDocumentUpdated, Change} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import { DocumentSnapshot } from "firebase-functions/v1/firestore"; // For Change<DocumentSnapshot>
import {isEqual} from "lodash"; // For deep comparison of objects

import { loanModelSchema, LoanModelValidated } from "../models/loan.model";
import { ToolPreviewValidated } from "../models/tool.model"; // Assuming hydrateTool returns this structure
import { hydrateTool } from "../controllers/tool.controller"; // Assuming this is the correct path and function

export const onUpdateLoan = onDocumentUpdated("/relations/{relationId}/loans/{loanId}", async (event: Change<DocumentSnapshot>) => {
  logger.info(`[onUpdateLoan] Triggered for loanId: ${event.params.loanId} in relationId: ${event.params.relationId}`);

  const beforeData = event.data.before.data() as LoanModelValidated | undefined; // Cast for easier access
  const afterData = event.data.after.data() as LoanModelValidated | undefined;

  if (!afterData) {
    logger.info(`[onUpdateLoan] Loan document ${event.params.loanId} was deleted. No action taken.`);
    return;
  }

  if (!beforeData) {
    logger.warn(`[onUpdateLoan] No 'before' data for loan document ${event.params.loanId}, though it's an update event. This is unusual.`);
    // Depending on policy, could return or proceed. Proceeding cautiously.
  }
  
  logger.debug(`[onUpdateLoan] Processing update for loanId: ${event.params.loanId}`);
  const updatedFields: Partial<LoanModelValidated> = {};

  // 1. Denormalization/Re-embedding (Tool Preview)
  // Check if toolId exists and if it has changed, or if the tool object itself is missing/different.
  const toolIdChanged = beforeData?.toolId !== afterData.toolId;
  if (afterData.toolId && (toolIdChanged || !afterData.tool || !isEqual(beforeData?.tool, afterData.tool))) {
    logger.info(`[onUpdateLoan] ToolId changed or tool object requires refresh for loan: ${event.params.loanId}. Fetching fresh tool preview for toolId: ${afterData.toolId}`);
    try {
      const freshToolPreview = await hydrateTool(afterData.toolId) as ToolPreviewValidated; // Assuming hydrateTool returns ToolPreviewValidated
      
      // Basic validation of the fetched preview
      if (!freshToolPreview || !freshToolPreview.id || !freshToolPreview.name) {
        logger.error(`[onUpdateLoan] Fetched tool preview for toolId: ${afterData.toolId} is invalid or incomplete.`);
        // Decide: throw, or proceed without updating tool preview? For now, log and proceed.
      } else if (!isEqual(afterData.tool, freshToolPreview)) {
        updatedFields.tool = freshToolPreview;
        logger.info(`[onUpdateLoan] Tool preview updated for loanId: ${event.params.loanId}`);
      }
    } catch (error) {
      logger.error(`[onUpdateLoan] Failed to hydrate tool preview for toolId: ${afterData.toolId}`, error);
      // Don't throw here, allow other updates to proceed if possible, but log the failure.
    }
  }

  // 2. Timestamp for modification
  updatedFields.modifiedAt = FieldValue.serverTimestamp() as Timestamp;

  // 3. Construct Candidate Document and Validate
  // Merge afterData with any fields that were updated (e.g., fresh tool preview, modifiedAt)
  const candidateLoanData: LoanModelValidated = {
    ...(afterData as LoanModelValidated), // Cast: we've established afterData exists
    ...updatedFields, // Apply changes
  };
  
  logger.debug(`[onUpdateLoan] Validating candidate loan data for loanId: ${event.params.loanId}`);
  const parsedCandidateLoan = loanModelSchema.safeParse(candidateLoanData);

  if (!parsedCandidateLoan.success) {
    logger.error(`[onUpdateLoan] Invalid candidate loan data after update and denormalization for loanId: ${event.params.loanId}`, parsedCandidateLoan.error.flatten());
    // The document is already updated, but its new state (plus our changes) is invalid.
    // This is tricky. Reverting is complex. For now, throw to signal failure.
    // Consider a more sophisticated error handling or alerting mechanism for production.
    throw new HttpsError("failed-precondition", "Updated loan data is invalid.", parsedCandidateLoan.error.flatten());
  }

  const validatedLoanData = parsedCandidateLoan.data;
  logger.info(`[onUpdateLoan] Candidate loan data validated for loanId: ${event.params.loanId}`);

  // 4. Write to Firestore
  // Check if there are actual changes to write other than just modifiedAt to avoid empty writes.
  // We check original updatedFields because validatedLoanData will always have modifiedAt.
  const hasMeaningfulChanges = Object.keys(updatedFields).some(key => key !== 'modifiedAt' && updatedFields[key as keyof LoanModelValidated] !== undefined);

  if (hasMeaningfulChanges || (Object.keys(updatedFields).length > 0 && !isEqual(beforeData, afterData))) { // also consider if original doc changed
    logger.info(`[onUpdateLoan] Writing updated loan document to Firestore for loanId: ${event.params.loanId}. Changes: ${Object.keys(updatedFields).join(", ")}`);
    try {
      // We use validatedLoanData which includes all fields, correctly typed.
      // merge:true ensures we only update specified fields or add new ones.
      await event.data.after.ref.set(validatedLoanData, {merge: true});
      logger.info(`[onUpdateLoan] Successfully wrote updates for loanId: ${event.params.loanId} to Firestore.`);
    } catch (error) {
      logger.error(`[onUpdateLoan] Error writing updates for loanId: ${event.params.loanId} to Firestore:`, error);
      if (error instanceof HttpsError) throw error; // Should not happen here
      throw new HttpsError("internal", "Failed to save the updated loan document.", { error });
    }
  } else {
    logger.info(`[onUpdateLoan] No meaningful changes to write for loanId: ${event.params.loanId} after processing. Only modifiedAt was set or data identical.`);
    // If only modifiedAt was set, and we want to ensure it's written, this logic needs adjustment.
    // For now, if only modifiedAt changed in updatedFields, we might skip the write.
    // However, the set with merge:true for validatedLoanData (which contains the server timestamp for modifiedAt) IS the way to update it.
    // The condition should be: if (Object.keys(updatedFields).length > 0)
    // Let's refine to always write if updatedFields is not empty.
    if (Object.keys(updatedFields).length > 0) {
        logger.info(`[onUpdateLoan] Writing document to update modifiedAt (and potentially other fields) for loanId: ${event.params.loanId}`);
        try {
            await event.data.after.ref.set(validatedLoanData, {merge: true});
            logger.info(`[onUpdateLoan] Successfully wrote updates (including modifiedAt) for loanId: ${event.params.loanId} to Firestore.`);
        } catch (error) {
            logger.error(`[onUpdateLoan] Error writing modifiedAt update for loanId: ${event.params.loanId} to Firestore:`, error);
            throw new HttpsError("internal", "Failed to save the updated loan document with modifiedAt.", { error });
        }
    } else {
        logger.info(`[onUpdateLoan] No changes to write for loanId: ${event.params.loanId}.`);
    }
  }
  logger.debug(`[onUpdateLoan] Function execution completed for loanId: ${event.params.loanId}`);
});
