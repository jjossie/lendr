import {HttpsError, onCall} from "firebase-functions/v2/https";
import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";
import {ITool} from "./models/Tool";
import {getLoan, getRelationId, setLoanStatus} from "./controllers/relation";
import {ILoan} from "./models/Relation";
import {logger} from "firebase-functions";
import {getUserFromUid} from "./controllers/users";
import {ILendrUserPreview} from "./models/ILendrUser";
import {firestore} from "firebase-admin";
import {sendExpoNotifications} from "./utils/notifications";
import Firestore = firestore.Firestore;

async function getToolByIdFromCallable(db: Firestore, toolId: string) {
  // Get the tool from the database
  const toolDocSnap = await db.collection("tools").doc(toolId).get();

  if (!toolDocSnap.exists) {
    throw new HttpsError("not-found", "Tool doesn't appear to exist 😂");
  }
  const tool = toolDocSnap.data() as ITool;
  return {toolDocSnap, tool};
}

async function getRelevantLoansSnap(db: FirebaseFirestore.Firestore, relationId: string, toolId: string) {
  return await db.collection(`relations/${relationId}/loans`)
      .where("toolId", "==", toolId)
      .get();
}

async function getRelationFromTool(db: FirebaseFirestore.Firestore, uid: string, tool: ITool) {
  // Figure out the other user's UID so that we can get the relation
  const currentUserIsLender = (uid === tool.lenderUid); // TODO this logic doesn't work. Not universally, at least.
  const otherUserId = [tool.lenderUid, tool.holderUid].filter(id => id !== uid)[0];
  if (!otherUserId)
    throw new HttpsError("internal", "No other user ID found");

  const relationId = getRelationId(uid, otherUserId);
  logger.debug("🔥getRelationFromTool(): otherUserId:", otherUserId);
  logger.debug("🔥getRelationFromTool(): relationID:", relationId);

  // Ensure the relation exists
  const relationDocSnap = await db.collection("relations").doc(relationId).get();
  if (!relationDocSnap.exists) {
    throw new HttpsError("not-found", "Relation doesn't exist 🎭");
  }
  return {currentUserIsLender, otherUserId, relationId};
}

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
  const db = getFirestore();
  const {toolDocSnap, tool} = await getToolByIdFromCallable(db, toolId);

  // Check if the tool is already received
  if (req.auth.uid == tool.holderUid)
    throw new HttpsError("ok", "Already received");

  const {currentUserIsLender, otherUserId, relationId} = await getRelationFromTool(db, req.auth.uid, tool);

  // Check if the loan exists and create it if it doesn't
  const relevantLoansSnap = await getRelevantLoansSnap(db, relationId, toolId);

  if (relevantLoansSnap.empty) {
    logger.debug("🔥No relevant loans found, creating a new one");
    const newLoan: ILoan = {
      borrowerUid: currentUserIsLender ? otherUserId : req.auth.uid,
      lenderUid: currentUserIsLender ? req.auth.uid : otherUserId,
      status: currentUserIsLender ? "returned" : "loaned", // Indicates status after successful handoff
      toolId,
      loanDate: FieldValue.serverTimestamp() as Timestamp,
    };
    await db.collection(`relations/${relationId}/loans`).add(newLoan);
  } else {
    logger.debug(`🔥Found ${relevantLoansSnap.docs.length} relevant loans, updating statuses`);
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

  let holder: ILendrUserPreview = {
    uid: req.auth.uid,
    displayName: lendrUser.displayName ?? `${lendrUser.firstName} ${lendrUser.lastName}`,
  };
  if (req.auth.token.picture)
    holder.photoURL = req.auth.token.picture;

  logger.debug("🔥attaching holder: ", JSON.stringify(holder, null, 2));

  await toolDocSnap.ref.set({
    holderUid: req.auth.uid,
    holder: holder,
  }, {merge: true});

  return {
    status: "success",
    message: `Tool ${tool.name} received by ${holder.displayName}`,
  };
});


/**
 * Called when a lender is handing off the tool to the borrower.
 * @type {Function<any, Promise<void>>}
 */
export const requestHandoff = onCall(async (req) => {

  logger.debug("🔥requestHandoff running");

  // Get the requesting User
  if (!req.auth || !req.auth.uid) {
    throw new HttpsError("unauthenticated", "User not logged in 🫥");
  }

  // Get the relationId & loanId from the query string
  const relationId = req.data.relationId;
  const loanId = req.data.loanId;

  // Get the loan from the database
  const db = getFirestore();
  let loan: ILoan;
  try {
    loan = await getLoan(db, relationId, loanId);
  } catch (e) {
    throw new HttpsError("not-found", e.message);
  }

  // Make sure the Lender made the call
  if (req.auth.uid !== loan.lenderUid)
    throw new HttpsError("permission-denied", "You must be the lender to initiate the loan handoff");

  // Make sure the loan status is valid
  if (loan?.status === "inquired") {
    await setLoanStatus(db, relationId, loanId, "loanRequested");
  } else {
    logger.error(`🔥Error: Skipping loan ${loanId} because status is ${loan.status}`);
  }

  // Notify the borrower they get to use the tool!
  const borrower = await getUserFromUid(loan.borrowerUid);
  const lender = await getUserFromUid(loan.lenderUid);
  await sendExpoNotifications(
      borrower.expoPushTokens,
      "Tool Available!",
      `${lender.displayName} user is giving you ${loan?.tool?.name}`,
      {}, // TODO put redirect info here
  );
});

/**
 * Called when a borrower is trying to return the tool.
 * @type {Function<any, Promise<void>>}
 */
export const requestReturn = onCall(async (req) => {
  // Get the tool ID from the query string
  const toolId = req.data.toolId;

  // Get the tool from the database
  const db = getFirestore();
  const {tool, toolDocSnap} = await getToolByIdFromCallable(db, toolId);

  // Get the relationship
  const {currentUserIsLender, otherUserId, relationId} = await getRelationFromTool(db, req.auth.uid, tool);


  // Make sure the Borrower made the call
  if (currentUserIsLender)
    throw new HttpsError("permission-denied", "You must be the borrower to initiate the return");


  // Get all relevant loans
  const relevantLoansSnap = await getRelevantLoansSnap(db, relationId, toolId);

  if (relevantLoansSnap.empty)
    throw new HttpsError("failed-precondition", "Loan does not exist! cannot initiate an unsolicited return");


  // Set the loan status to loanRequested
  relevantLoansSnap.docs.forEach(doc => {
    const loan = doc.data() as ILoan;
    // Make sure the loan status is valid
    if (loan.status === "loaned") {
      loan.status = "returned";
    } else {
      logger.error(`Error: Skipping loan ${doc.id} because status is ${loan.status}`);
    }
  });

});