import {Timestamp} from "firebase-admin/firestore";
import {LendrUser} from "./lendrUser";
import {Tool} from "./tool";

export interface Relation {
  id?: string // Added after retrieving from firestore
  users: LendrUser[];
  createdAt: Timestamp;
  lastMessage?: ChatMessage; // Hydrated after retrieval
  otherUser?: LendrUser; // Hydrated after retrieval
  // Need to figure out how to include subcollection data. Or don't do it at all?
}

export interface ChatViewListItem {
  id: string // Added after retrieving from firestore
  users?: LendrUser[];
  createdAt: Timestamp;
  lastMessage?: ChatMessage; // Hydrated after retrieval
  otherUser: LendrUser;
}

export type LoanStatus = "inquired" | "loanRequested" | "loaned" | "returnRequested" | "returned" | "canceled";

/**
 * For now, this is using references instead of embedding documents. Should
 * probably change that in the future.
 */
export interface Loan {
  id?: string;
  toolId: string;
  tool?: Tool;
  inquiryDate?: Timestamp;
  loanDate?: Timestamp;
  returnDate?: Timestamp;
  status: LoanStatus;
  lenderUid: string;
  borrowerUid: string;
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderUid: string;
  receiverUid: string;
  createdAt: Timestamp;
  replyingToId?: string;
  reaction?: ChatReaction;
  media?: any;
}

export interface ChatReaction {
  emoji: string;
  userRef: string;
}