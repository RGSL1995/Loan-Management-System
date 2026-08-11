import { z } from "zod";

export const loanFormSchema = z.object({
  clientId: z.string().min(1, "Client must be selected"),
  productId: z.string().min(1, "Loan product is required"),
  principalAmount: z.coerce.number().min(1000, "Minimum principal is 1000"),
  loanTerm: z.coerce.number().int().min(1, "Term must be at least 1 month"),
  interestRate: z.coerce.number().min(0, "Interest rate cannot be negative").max(100, "Interest rate cannot exceed 100%"),
  repaymentStrategy: z.string().min(1, "Repayment strategy is required"),
});

export type LoanFormValues = z.infer<typeof loanFormSchema>;

export const securitySchema = z.object({
  isin: z.string().min(1, "ISIN is required"),
  name: z.string().min(1, "Security name is required"),
  qty: z.coerce.number().positive("Quantity must be positive"),
  price: z.coerce.number().positive("Price must be positive"),
  ltv: z.coerce.number().positive("LTV must be positive").max(100, "LTV cannot exceed 100"),
});

export const lasFormSchema = z.object({
  clientId: z.string().min(1, "Client must be selected"),
  requestedLimit: z.coerce.number().positive("Requested limit must be positive"),
  securities: z.array(securitySchema).min(1, "At least one security must be pledged"),
});

export type LasFormValues = z.infer<typeof lasFormSchema>;

export const lapFormSchema = z.object({
  clientId: z.string().min(1, "Client must be selected"),
  propertyClass: z.enum(["Residential", "Commercial", "Plot"]),
  assessedValue: z.coerce.number().positive("Assessed value must be positive"),
  netIncome: z.coerce.number().positive("Net income must be positive"),
  existingObligations: z.coerce.number().min(0, "Existing obligations cannot be negative"),
  requestedAmount: z.coerce.number().positive("Requested amount must be positive"),
});

export type LapFormValues = z.infer<typeof lapFormSchema>;

export const sclFormSchema = z.object({
  clientId: z.string().min(1, "Client must be selected"),
  requestedLimit: z.coerce.number().positive("Requested limit must be positive"),
  consentAA: z.literal(true, {
    message: "Account Aggregator consent is required"
  }),
  consentBureau: z.literal(true, {
    message: "Bureau pull consent is required"
  }),
  kfsAccepted: z.literal(true, {
    message: "Key Fact Statement must be accepted to proceed"
  }),
});

export type SclFormValues = z.infer<typeof sclFormSchema>;
