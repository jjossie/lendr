import {HttpsError, onCall} from "firebase-functions/v2/https";
import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";
import {ITool} from "./models/Tool";
import {getRelationId} from "./controllers/relation";
import {ILoan} from "./models/Relation";
import {logger} from "firebase-functions";
import {getUserFromUid} from "./controllers/users";
import {ILendrUserPreview} from "./models/ILendrUser";

/**
 * Called when a user wants to confirm a tool was handed off to them.
 * @type {Function<any, Promise<{}>>}
 */
export const confirmToolReceived = onCall(async (req) => {
  logger.debug("🔥confirmToolReceived running");

  // Get the requesting User
  if (!req.auth || !req.auth.uid) {
    throw new HttpsError("unauthenticated", "User not logged in 🫥");
  }
  logger.debug("🔥auth: ", JSON.stringify(req.auth, null, 2));
  logger.debug("🔥uid: ", req.auth.uid);
  logger.debug("🔥user token: ", JSON.stringify(req.auth.token, null, 2));

  // Get the tool ID from the query string
  const toolId = req.data.toolId;
  if (!toolId || typeof toolId !== "string") {
    throw new HttpsError("invalid-argument", "Tool ID not provided ⭕️");
  }

  // Get the tool from the database
  const db = getFirestore();
  const toolDocSnap = await db.collection("tools").doc(toolId).get();

  if (!toolDocSnap.exists) {
    throw new HttpsError("not-found", "Tool doesn't appear to exist 😂");
  }
  const tool = toolDocSnap.data() as ITool;

  // Check if the tool is already received
  if (req.auth.uid == tool.holderUid)
    throw new HttpsError("ok", "Already received");

  // Figure out the other user's UID so that we can get the relation
  // let otherUserId = "";
  // if (req.auth.uid == tool.lenderUid) {
  //   // Logged-in user is the Owner/Lender
  //   otherUserId = tool.holderUid;
  // } else {
  //   // Logged-in user is the Borrower
  //   otherUserId = tool.lenderUid;
  // }

  const currentUserIsLender = (req.auth.uid === tool.lenderUid);
  const otherUserId = (currentUserIsLender) ? tool.holderUid : tool.lenderUid;
  const relationId = getRelationId(req.auth.uid, otherUserId);

  // Ensure the relation exists
  const relationDocSnap = await db.collection("relations").doc(relationId).get();
  if (!relationDocSnap.exists) {
    throw new HttpsError("not-found", "Relation doesn't exist 🎭");
  }

  // Check if the loan exists and create it if it doesn't
  const relevantLoansSnap = await db.collection(`relations/${relationId}/loans`)
      .where("toolId", "==", toolId)
      .get();

  if (relevantLoansSnap.empty) {
    logger.debug("🔥No relevant loans found, creating a new one")
    const newLoan: ILoan = {
      borrowerUid: currentUserIsLender ? otherUserId : req.auth.uid,
      lenderUid: currentUserIsLender ? req.auth.uid : otherUserId,
      status: currentUserIsLender ? "returned" : "loaned", // Indicates status after successful handoff
      toolId,
      loanDate: FieldValue.serverTimestamp() as Timestamp,
    };
    await db.collection(`relations/${relationId}/loans`).add(newLoan);
  } else {
    logger.debug(`🔥Found ${relevantLoansSnap.docs.length} relevant loans, updating statuses`)
    // Loop through all loans that involve this tool and make sure they're marked appropriately
    for (const loanDoc of relevantLoansSnap.docs) {
      let loan = loanDoc.data() as ILoan;
      if (loan.status === "returned")
        continue;
      if (currentUserIsLender)
        loan.status = "returned";
      else
        loan.status = "loaned";
      await loanDoc.ref.set(loan, {merge: true});
      break;
    }
  }


  // Update the tool's holder to the current user
  const lendrUser = await getUserFromUid(req.auth.uid);

  const holder: ILendrUserPreview = {
    uid: req.auth.uid,
    displayName: lendrUser.displayName ?? `${lendrUser.firstName} ${lendrUser.lastName}`,
    photoURL: req.auth.token.picture,
  };
  logger.debug("🔥attaching holder: ", JSON.stringify(holder, null, 2))

  await toolDocSnap.ref.set({
    holderUid: req.auth.uid,
    holder: holder,
  }, {merge: true});

  return {
    status: "success",
    message: `Tool ${tool.name} received by ${req.auth.token.name}`,
  };
});