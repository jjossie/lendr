import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {hydrateTool} from "./controllers/tool.controller";
import {logger} from "firebase-functions";
import {FieldValue} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";

export const validateLoan = onDocumentCreated("/relations/{relationId}/loans/{loanId}", async (event) => {
  logger.debug(`🔥Validating new loan: ${event.params.relationId}/loans/${event.params.loanId}`);

  const rawLoanDoc = event.data.data();
  let hydroLoanDoc = {...rawLoanDoc};

  // Basic Validation
  if (!rawLoanDoc.toolId) {
    throw new HttpsError("invalid-argument", "Tool ID is required");
  }

  // Attach proper inquiry date
  hydroLoanDoc.inquiryDate = FieldValue.serverTimestamp();

  // Set the status
  hydroLoanDoc.status = "inquired";

  // Hydrate the tool
  hydroLoanDoc.tool = await hydrateTool(rawLoanDoc.toolId);

  // Write the validated, hydrated loan to Firestore
  try {
    await event.data.ref.set(hydroLoanDoc, {merge: false});
    logger.debug("🔥Successfully hydrated & validated loan for tool ", hydroLoanDoc.tool.name,
        "With ID: ", event.params.loanId,
        "From Relation ID: ", event.params.relationId);
  } catch (e) {
    logger.error("🔥Error Saving tool after hydrating & validating: ",
        "With ID: ", event.params.loanId,
        "From Relation ID: ", event.params.relationId);
    throw new HttpsError("aborted", `Something went wrong writing to Firestore: ${e.message}`);
  }
});