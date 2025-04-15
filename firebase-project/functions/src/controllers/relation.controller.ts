import {NotFoundError} from "../utils/errors";
import {logger} from "firebase-functions";
import {FieldValue} from "firebase-admin/firestore";
import { LoanStatus, Loan } from "../models/loan.model";


export async function getLoan(db: FirebaseFirestore.Firestore, relationId: string, loanId: string): Promise<Loan> {
  const loanSnap = await db.collection(`relations/${relationId}/loans/`).doc(loanId).get();

  if (!loanSnap.exists) {
    logger.error("🔥Loan ${relationId}/loans/${loanId} does not exist")
    throw new NotFoundError(`Loan ${relationId}/loans/${loanId} does not exist`);
  }
  return {...loanSnap.data(), id: loanId} as Loan;
}

export async function setLoanStatus(db: FirebaseFirestore.Firestore, relationId: string, loanId: string, status: LoanStatus ) {
    let loanUpdate: any = {
      status: status,
      inquiryDate: (status === "inquired") ? FieldValue.serverTimestamp() : undefined,
      loanDate: (status === "loaned") ? FieldValue.serverTimestamp() : undefined,
      returnDate: (status === "returned") ? FieldValue.serverTimestamp() : undefined,
    };

    await db.collection(`relations/${relationId}/loans/`).doc(loanId).set(loanUpdate, {merge: true});
}