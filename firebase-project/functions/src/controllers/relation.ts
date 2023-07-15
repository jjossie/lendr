import {NotFoundError} from "../utils/errors";
import {ILoan, LoanStatus} from "../models/Relation";
import {logger} from "firebase-functions";


export function getRelationId(currentUserId: string, otherUserId: string) {
  // Sort the two user IDs alphabetically to ensure that the relation is unique.
  const sortedUserIds = [currentUserId, otherUserId].sort();
  return `${sortedUserIds[0]}-${sortedUserIds[1]}`;
}

export async function getLoan(db: FirebaseFirestore.Firestore, relationId: string, loanId: string): Promise<ILoan> {
  const loanSnap = await db.collection(`relations/${relationId}/loans/`).doc(loanId).get();

  if (!loanSnap.exists) {
    logger.error("🔥Loan ${relationId}/loans/${loanId} does not exist")
    throw new NotFoundError(`Loan ${relationId}/loans/${loanId} does not exist`);
  }
  return {...loanSnap.data(), id: loanId} as ILoan;
}

export async function setLoanStatus(db: FirebaseFirestore.Firestore, relationId: string, loanId: string, status: LoanStatus ) {
  await db.collection(`relations/${relationId}/loans/`).doc(loanId).set({
    status: status
  }, {merge: true});

}