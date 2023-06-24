import {Timestamp} from "firebase-admin/firestore";
import {ILendrUser} from "./ILendrUser";

export interface IRelation {
  id?: string // Added after retrieving from firestore
  users: ILendrUser[];
  createdAt: Timestamp;
  lastMessage?: IChatMessage; // Hydrated after retrieval
  otherUser?: ILendrUser; // Hydrated after retrieval
  // Need to figure out how to include subcollection data. Or don't do it at all?
}

export interface IChatViewListItem {
  id: string // Added after retrieving from firestore
  users?: ILendrUser[];
  createdAt: Timestamp;
  lastMessage?: IChatMessage; // Hydrated after retrieval
  otherUser: ILendrUser;
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
  id?: string;
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