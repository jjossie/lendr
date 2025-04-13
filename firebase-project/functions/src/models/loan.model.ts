import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { Tool, toolPreviewSchema, toolSchema } from "./tool.model";
import { timestampSchema } from "./common.model";

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


export const loanInputSchema = z.object({
  toolId: z.string(),
  inquiryDate: timestampSchema.optional(),
  lenderUid: z.string(),
  borrowerUid: z.string(),
});

export const loanModelSchema = z.object({
  id: z.string(),
  toolId: z.string(),
  tool: toolPreviewSchema,
  inquiryDate: timestampSchema,
  loanDate: timestampSchema.optional(),
  returnDate: timestampSchema.optional(),
  status: loanStatusSchema,
  lenderUid: z.string(),
  borrowerUid: z.string(),
});


export type LoanStatusValidated = z.infer<typeof loanStatusSchema>;
export type LoanInputValidated = z.infer<typeof loanInputSchema>;
export type LoanModelValidated = z.infer<typeof loanModelSchema>;
