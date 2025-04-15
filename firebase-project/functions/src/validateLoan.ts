import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {hydrateTool} from "./controllers/tool.controller";
import {logger} from "firebase-functions";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import { LoanModelValidated, loanInputSchema, LoanStatusValidated } from "./models/loan.model";
import { ToolPreviewValidated } from "./models/tool.model";

export const validateLoan = onDocumentCreated("/relations/{relationId}/loans/{loanId}", async (event) => {
  logger.debug(`🔥 Validating new loan: /relations/${event.params.relationId}/loans/${event.params.loanId}`);

  const parsedLoan = loanInputSchema.safeParse(event.data?.data());
  if (!parsedLoan.success) {
    throw new HttpsError("invalid-argument", "Invalid loan data", parsedLoan.error);
  }
  const loanInput = parsedLoan.data


  // Hydrate the loan

  const inquiryDate = FieldValue.serverTimestamp() as Timestamp;
  const status: LoanStatusValidated = "inquired";
  // Get a tool preview
  const toolPreview = await hydrateTool(loanInput.toolId) as ToolPreviewValidated;

  const hydroLoanDoc: LoanModelValidated = {
    ...loanInput,
    id: event.params.loanId,
    tool: toolPreview,
    inquiryDate: inquiryDate,
    status: status,
  }

  // Write the validated, hydrated loan to Firestore
  try {
    await event.data?.ref.set(hydroLoanDoc, {merge: false});
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