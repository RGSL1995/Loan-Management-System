import { z } from "zod";

export const repaymentSchema = z.object({
  loanId: z.string().min(1, "Loan ID is required"),
  amount: z.coerce.number().positive("Repayment amount must be positive"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  transactionDate: z.string().min(1, "Transaction date is required"),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type RepaymentValues = z.infer<typeof repaymentSchema>;
