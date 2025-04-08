import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { Tool } from "./tool.model";

const loanStatusSchema = z.enum(["inquired", "loanRequested", "loaned", "returnRequested", "returned", "canceled"]);
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


export const loanSchema = z.object({
  id: z.string().optional(),
  toolId: z.string(),
  tool: z.any().optional(),
  inquiryDate: z.instanceof(Timestamp).optional(),
  loanDate: z.instanceof(Timestamp).optional(),
  returnDate: z.instanceof(Timestamp).optional(),
  status: loanStatusSchema,
  lenderUid: z.string(),
  borrowerUid: z.string(),
});


export type LoanValidated = z.infer<typeof loanSchema>;
export type LoanStatusValidated = z.infer<typeof loanStatusSchema>;
