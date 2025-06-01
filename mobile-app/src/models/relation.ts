import {Timestamp} from "firebase/firestore";
import {LendrUser} from "./lendrUser";
import {ToolPreview} from "./tool";
import { LendrUserPreview } from "./lendrUser.zod";

export interface Relation {
  id?: string // Added after retrieving from firestore
  users: LendrUser[];
  createdAt: Timestamp;
  lastMessage?: ChatMessage; // Hydrated after retrieval
  otherUser?: LendrUser; // Hydrated after retrieval
  // Need to figure out how to include subcollection data. Or don't do it at all?
}

export interface RelationHydrated extends Relation {
  otherUser: LendrUser;
  lastMessage: ChatMessage;
  // loans: ILoan[];
}

export interface ChatViewListItem {
  id: string // Added after retrieving from firestore
  createdAt: Timestamp;
  lastMessage?: ChatMessage; // Hydrated after retrieval
  otherUser: LendrUserPreview;
}


export interface Loan {
  id?: string;
  toolId: string;
  tool?: ToolPreview;
  inquiryDate?: Timestamp;
  loanDate?: Timestamp;
  returnDate?: Timestamp;
  status: "inquired" | "loanRequested" | "loaned" | "returnRequested" | "returned" | "canceled";
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