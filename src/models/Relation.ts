import {DocumentReference, Timestamp} from "firebase/firestore";
import {ILendrUser} from "./ILendrUser";
import {ITool} from "./Tool";

export interface IRelation {
  loans: ILoan[];
  createdAt: Timestamp;
}

/**
 * For now, this is using references instead of embedding documents. Should
 * probably change that in the future.
 */
export interface ILoan {
  toolRef: DocumentReference<ITool>;
  loanDate: Timestamp;
  returnDate: Timestamp;
  returnStatus: boolean;
  lenderRef: DocumentReference<ILendrUser>;
  borrowerRef: DocumentReference<ILendrUser>;
}

export interface IChatMessage {
  text: string;
  senderRef: DocumentReference<ILendrUser>;
  timestamp: Timestamp;
  media?: any;
}