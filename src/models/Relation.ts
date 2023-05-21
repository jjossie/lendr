import {FieldValue, Timestamp} from "firebase/firestore";
import {ILendrUser} from "./ILendrUser";

export interface IRelation {
  id?: string // Added after retrieving from firestore
  users: ILendrUser[];
  loans: ILoan[] | FieldValue;
  createdAt: Timestamp;
}

/**
 * For now, this is using references instead of embedding documents. Should
 * probably change that in the future.
 */
export interface ILoan {
  toolId: string;
  inquiryDate?: Timestamp;
  loanDate?: Timestamp;
  returnDate?: Timestamp;
  returnStatus?: boolean;
  lenderUid: string;
  borrowerUid: string;
}

export interface IChatMessage {
  text: string;
  senderUid: string;
  receiverUid: string;
  createdAt: Timestamp;
  replyingToId?: string;
  reaction?: IChatReaction;
  media?: any;
}

export interface IChatReaction {
  emoji: string;
  userRef: string;
}