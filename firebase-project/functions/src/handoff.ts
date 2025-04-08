import {HttpsError, onCall} from "firebase-functions/v2/https";
import {getFirestore} from "firebase-admin/firestore";
import {Tool} from "./models/tool.model";
import {getLoan, setLoanStatus} from "./controllers/relation.controller";
import { getRelationId } from "./utils/relation";
import {logger} from "firebase-functions";
import {getUserFromUid} from "./controllers/users.controller";
import {LendrUserPreview} from "./models/lendrUser.model";
import {firestore} from "firebase-admin";
import {sendExpoNotifications} from "./utils/notifications";
import Firestore = firestore.Firestore;
import { Loan } from "./models/loan.model";
import { NotFoundError } from "./utils/errors";

async function getToolByIdFromCallable(db: Firestore, toolId: string) {
  // Get the tool from the database
  const toolDocSnap = await db.collection("tools").doc(toolId).get();

  if (!toolDocSnap.exists) {
    throw new HttpsError("not-found", "Tool doesn't appear to exist 😂");
  }
  const tool = toolDocSnap.data() as Tool;
  return {toolDocSnap, tool};
}

async function getRelevantLoansSnap(db: Firestore, relationId: string, toolId: string) {
  return await db.collection(`relations/${relationId}/loans`)
      .where("toolId", "==", toolId)
      .get();
}

async function getRelationFromTool(db: Firestore, uid: string, tool: Tool) {
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
export const acceptHandoff = onCall(async (req) => {
  logger.debug("🔥acceptHandoff running");

  // Get the requesting User
  if (!req.auth || !req.auth.uid) {
    throw new HttpsError("unauthenticated", "User not logged in 🫥");
  }
  logger.debug("🔥auth: ", JSON.stringify(req.auth, null, 2));
  logger.debug("🔥uid: ", req.auth.uid);
  logger.debug("🔥user token: ", JSON.stringify(req.auth.token, null, 2));

  // const toolId = req.data.toolId;

  // Get the relation and loan IDs from the request
  const {relationId, loanId} = req.data;

  // Get the loan from the database
  const db = getFirestore();
  let loan: Loan;
  try {
    loan = await getLoan(db, relationId, loanId);
  } catch (e) {
    logger.error(e);
    throw new HttpsError("not-found", e.message);
  }

  const currentUserIsLender = (req.auth.uid === loan.lenderUid);
  const otherUserId = [loan.lenderUid, loan.borrowerUid].filter(id => id !== req.auth?.uid)[0];
  logger.debug(`🔥Current user (${currentUserIsLender ? "lender" : "borrower"}) accepting handoff from [${otherUserId}] (${currentUserIsLender ? "borrower" : "lender"})`)
  // const currentUser = await getUserFromUid(req.auth.uid);
  // const otherUser = await getUserFromUid(otherUserId);

  // Get the tool ID
  const {toolDocSnap, tool} = await getToolByIdFromCallable(db, loan.toolId);

  // Check if the tool is already received
  if (req.auth.uid == tool.holderUid){
    logger.error(`🔥Tool ${tool.name} is already in current user ( ${req.auth.uid} )'s possession.\nDouble check loan status.`);
    throw new HttpsError("ok", "Already received"); // TODO double check loan status here
  }

  // Set the new loan status
  await setLoanStatus(db, relationId, loanId, currentUserIsLender ? "returned" : "loaned");

  // Check if the loan exists and create it if it doesn't
  // const relevantLoansSnap = await getRelevantLoansSnap(db, relationId, loan.toolId);
  //
  // if (relevantLoansSnap.empty) {
  //   logger.debug("🔥No relevant loans found, creating a new one");
  //   const newLoan: ILoan = {
  //     borrowerUid: currentUserIsLender ? otherUserId : req.auth.uid,
  //     lenderUid: currentUserIsLender ? req.auth.uid : otherUserId,
  //     status: currentUserIsLender ? "returned" : "loaned", // Indicates status after successful handoff
  //     toolId: loan.toolId,
  //     loanDate: FieldValue.serverTimestamp() as Timestamp,
  //   };
  //   await db.collection(`relations/${relationId}/loans`).add(newLoan);
  // } else {
  //   logger.debug(`🔥Found ${relevantLoansSnap.docs.length} relevant loans, updating statuses`);
  //   // Loop through all loans that involve this tool and make sure they're marked appropriately
  //   for (const loanDoc of relevantLoansSnap.docs) {
  //     let loan = loanDoc.data() as ILoan;
  //     if (loan.status === "returned")
  //       continue;
  //     if (currentUserIsLender)
  //       loan.status = "returned";
  //     else
  //       loan.status = "loaned";
  //     await loanDoc.ref.set(loan, {merge: true});
  //     break;
  //   }
  // }

  // Update the tool's holder to the current user
  const currentUser = await getUserFromUid(req.auth.uid);
  if (!currentUser) {
    throw new NotFoundError("Current user not found");
  }

  let holder: LendrUserPreview = {
    uid: req.auth.uid,
    displayName: currentUser.displayName ?? `${currentUser.firstName} ${currentUser.lastName}`,
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
 * Called when either the lender or borrower is initiating a handoff. The other user must confirm the handoff
 * for the holder status to actually be changed. This does, however, change the loan status to either 'loanRequested'
 * or 'returnRequested'.
 * @type {Function<any, Promise<void>>}
 */
export const startHandoff = onCall(async (req) => {

  logger.debug("🔥startHandoff running");

  // Get the requesting User
  if (!req.auth || !req.auth.uid) {
    throw new HttpsError("unauthenticated", "User not logged in 🫥");
  }

  // Get the relationId & loanId from the query string
  const relationId = req.data.relationId;
  const loanId = req.data.loanId;

  // Get the loan from the database
  const db = getFirestore();
  let loan: Loan;
  try {
    loan = await getLoan(db, relationId, loanId);
  } catch (e) {
    logger.error(e);
    throw new HttpsError("not-found", e.message);
  }

  // Set the loan status based on who initiated the handoff
  if (req.auth.uid !== loan.lenderUid) {
    // Borrower made the call
    logger.debug(`🔥Borrower ${loan.borrowerUid} trying to initiate handoff`)
    // Make sure the loan status is valid
    if (loan.status !== "loaned"){
      logger.warn(`🔥Loan status invalid: ${loan.status}`)
      throw new HttpsError("failed-precondition",
          `🔥Loan status must be 'loaned' for borrower to initiate handoff (actual status: ${loan.status})`);
    }
    await setLoanStatus(db, relationId, loanId, "returnRequested");

  } else {
    // Lender made the call
    logger.debug(`🔥Lender ${loan.lenderUid} trying to initiate handoff`)
    // Make sure the loan status is valid
    if (loan.status !== "inquired"){
      logger.warn(`🔥Loan status invalid: ${loan.status}`)
      throw new HttpsError("failed-precondition",
          `🔥Loan status must be 'inquired' for lender to initiate handoff (actual status: ${loan.status})`);
    }
    await setLoanStatus(db, relationId, loanId, "loanRequested");
  }

  // Notify the borrower they get to use the tool! // TODO fix, might be other way around
  const borrower = await getUserFromUid(loan.borrowerUid);
  const lender = await getUserFromUid(loan.lenderUid);
  if (!borrower || !lender) {
    throw new NotFoundError(`User not found: Borrower UID ${loan.borrowerUid}: ${borrower}; Lender UID ${loan.lenderUid}: ${lender}`);
  }
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
  if (!req.auth || !req.auth.uid) {
    throw new HttpsError("unauthenticated", "User not logged in 🫥");
  }

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
    const loan = doc.data() as Loan;
    // Make sure the loan status is valid
    if (loan.status === "loaned") {
      loan.status = "returned";
    } else {
      logger.error(`Error: Skipping loan ${doc.id} because status is ${loan.status}`);
    }
  });

});