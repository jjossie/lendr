import {Timestamp} from "firebase/firestore";

export interface IRelation {
  id?: string // Added after retrieving from firestore
  loans: ILoan[];
  createdAt: Timestamp;
}

/**
 * For now, this is using references instead of embedding documents. Should
 * probably change that in the future.
 */
export interface ILoan {
  toolId: string;
  loanDate: Timestamp;
  returnDate: Timestamp;
  returnStatus: boolean;
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