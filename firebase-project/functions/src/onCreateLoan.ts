import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";

import { loanInputSchema, LoanModelValidated, LoanStatusValidated } from "../models/loan.model";
import { ToolPreviewValidated } from "../models/tool.model"; // Assuming hydrateTool returns this
import { hydrateTool } from "../controllers/tool.controller"; // Assuming this is the correct path and function

export const onCreateLoan = onDocumentCreated("/relations/{relationId}/loans/{loanId}", async (event) => {
  logger.info(`[onCreateLoan] Triggered for loanId: ${event.params.loanId} in relationId: ${event.params.relationId}`);

  const snapshot = event.data;
  if (!snapshot) {
    logger.error("[onCreateLoan] No data associated with the event.");
    // This case should ideally not happen for onCreate, but good to guard.
    // Depending on desired behavior, could throw or just return.
    // Throwing might be better to signal an unexpected state.
    throw new HttpsError("internal", "No data associated with the event.");
  }

  const loanInputData = snapshot.data();

  // 1. Validation
  logger.debug("[onCreateLoan] Validating input data...");
  const parsedLoanInput = loanInputSchema.safeParse(loanInputData);

  if (!parsedLoanInput.success) {
    logger.error(`[onCreateLoan] Invalid loan input data for loanId: ${event.params.loanId}`, parsedLoanInput.error.flatten());
    // Throw an HttpsError. The client won't receive this directly, but it signals a failed execution.
    // Deleting the document might be an alternative: await snapshot.ref.delete();
    // However, for onDocumentCreated, if the data is bad, the doc already exists.
    // Letting it exist in a "bad" state and logging might be preferable to deletion for audit.
    // Or, have a separate process clean up invalid docs. For now, just throw.
    throw new HttpsError("invalid-argument", "Invalid loan data provided.", parsedLoanInput.error.flatten());
  }

  const loanInput = parsedLoanInput.data;
  logger.info(`[onCreateLoan] Loan input data validated for loanId: ${event.params.loanId}`);

  // 2. Denormalization/Data Embedding
  logger.debug(`[onCreateLoan] Starting denormalization for loanId: ${event.params.loanId}`);
  let toolPreview: ToolPreviewValidated;
  try {
    logger.debug(`[onCreateLoan] Fetching tool preview for toolId: ${loanInput.toolId}`);
    // Assuming hydrateTool fetches the necessary Tool data and shapes it into ToolPreviewValidated
    // This might involve reading from /tools/{toolId}
    const tempToolPreview = await hydrateTool(loanInput.toolId); // This function might need to be adjusted if it returns a full Tool model
    
    // Ensure what hydrateTool returns is compliant with ToolPreviewValidated.
    // For now, we cast, but in a real scenario, ensure hydrateTool provides the correct preview structure.
    toolPreview = tempToolPreview as ToolPreviewValidated; 
    if (!toolPreview || !toolPreview.id || !toolPreview.name || !toolPreview.imageUrl || !toolPreview.rate ) {
        logger.error(`[onCreateLoan] Fetched tool preview for toolId: ${loanInput.toolId} is not a valid ToolPreviewValidated structure.`, toolPreview);
        throw new HttpsError("internal", `Failed to fetch or validate tool preview for toolId: ${loanInput.toolId}`);
    }
    logger.info(`[onCreateLoan] Successfully fetched tool preview for toolId: ${loanInput.toolId}`);

  } catch (error) {
    logger.error(`[onCreateLoan] Failed to hydrate tool preview for toolId: ${loanInput.toolId}`, error);
    // Depending on policy, might delete the loan doc or throw.
    // await snapshot.ref.delete(); 
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", `Failed to retrieve tool information for toolId: ${loanInput.toolId}.`);
  }

  const inquiryDate = FieldValue.serverTimestamp() as Timestamp; // Always set by server on creation
  const status: LoanStatusValidated = "inquired"; // Initial status

  // 3. Construct Final Loan Document
  const loanDoc: LoanModelValidated = {
    ...loanInput, // Spreads toolId, lenderUid, borrowerUid, and potentially client-sent inquiryDate
    id: event.params.loanId,
    tool: toolPreview,
    inquiryDate: inquiryDate, // Overwrites client-sent inquiryDate with server timestamp
    status: status,
    // loanDate and returnDate are not set at creation, they will be undefined (optional in LoanModelValidated)
  };
  logger.debug(`[onCreateLoan] Constructed final loan document for loanId: ${event.params.loanId}`);


  // 4. Write to Firestore
  logger.info(`[onCreateLoan] Writing denormalized loan document to Firestore for loanId: ${event.params.loanId}`);
  try {
    await snapshot.ref.set(loanDoc, {merge: false}); // merge:false is crucial for onCreate
    logger.info(`[onCreateLoan] Successfully wrote loan document for loanId: ${event.params.loanId} to Firestore.`);
  } catch (error) {
    logger.error(`[onCreateLoan] Error writing loan document for loanId: ${event.params.loanId} to Firestore:`, error);
    // The function will terminate, and the initial document (that triggered this) might remain.
    // Consider whether a retry or cleanup mechanism is needed. For now, rethrow.
    if (error instanceof HttpsError) throw error; // Should not happen here
    throw new HttpsError("internal", "Failed to save the processed loan document.", { error });
  }

  logger.debug(`[onCreateLoan] Function execution completed for loanId: ${event.params.loanId}`);
});
