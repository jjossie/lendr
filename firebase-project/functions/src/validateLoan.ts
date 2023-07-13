import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {hydrateTool} from "./controllers/tool";
import {ObjectValidationError} from "./utils/errors";
import {logger} from "firebase-functions";

export const validateLoan = onDocumentCreated("/relations/{relationId}/loans/{loanId}", async (event) => {
  logger.info("Validating new tool: ", event.data.id);

  const rawLoanDoc = event.data.data();
  let hydroLoanDoc = {...rawLoanDoc};

  // Basic Validation
  if (!rawLoanDoc.toolId) {
    throw new ObjectValidationError("Tool ID is required");
  }

  // Attach proper inquiry date

  // Set the status
  hydroLoanDoc.status = "inquired";

  // Hydrate the tool
  hydroLoanDoc.tool = await hydrateTool(rawLoanDoc.toolId);

  // Write the validated, hydrated loan to Firestore
  try {
    await event.data.ref.set(hydroLoanDoc, {merge: false});
    logger.info("Successfully hydrated & validated loan for tool ", hydroLoanDoc.tool.name,
        "With ID: ", event.params.loanId,
        "From Relation ID: ", event.params.relationId);
  } catch (e) {
    logger.error("Error Saving tool after hydrating & validating: ",
        "With ID: ", event.params.loanId,
        "From Relation ID: ", event.params.relationId);
    throw e;
  }
});