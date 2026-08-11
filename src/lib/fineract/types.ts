import { z } from "zod";

// Core entity schemas for Fineract API responses

export const FineractClientSchema = z.object({
  id: z.number(),
  accountNo: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  displayName: z.string(),
  mobileNo: z.string().nullable(),
  emailAddress: z.string().email().nullable(),
  dateOfBirth: z.string().nullable(),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE", "CLOSED"]),
  activationDate: z.string().nullable(),
  officeId: z.number(),
  staffId: z.number().nullable(),
  savingsProductId: z.number().nullable(),
});

export type FineractClient = z.infer<typeof FineractClientSchema>;

export const LoanProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  shortName: z.string(),
  description: z.string().nullable(),
  currencyCode: z.string(),
  principal: z.number(),
  minPrincipal: z.number().nullable(),
  maxPrincipal: z.number().nullable(),
  numberOfRepayments: z.number(),
  repaymentFrequencyType: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"]),
  interestRatePerPeriod: z.number(),
  interestCalculationPeriodType: z.enum(["DAILY", "SAME_AS_REPAYMENT_PERIOD"]),
  amortizationType: z.enum(["EQUAL_INSTALLMENTS", "EQUAL_PRINCIPAL"]),
  accountingRule: z.enum(["NONE", "CASH_BASED", "ACCRUAL_BASED"]),
});

export type LoanProduct = z.infer<typeof LoanProductSchema>;

export const LoanApplicationSchema = z.object({
  id: z.number(),
  accountNo: z.string(),
  clientId: z.number(),
  loanProductId: z.number(),
  loanProductName: z.string(),
  principal: z.number(),
  approvedPrincipal: z.number().nullable(),
  submittedOnDate: z.string(),
  approvedOnDate: z.string().nullable(),
  expectedDisbursementDate: z.string().nullable(),
  actualDisbursementDate: z.string().nullable(),
  loanTermInDays: z.number(),
  numberOfRepayments: z.number(),
  repaymentEvery: z.number(),
  interestRatePerPeriod: z.number(),
  interestType: z.enum(["FLAT", "DECLINING_BALANCE"]),
  status: z.enum([
    "SUBMITTED_AND_PENDING_APPROVAL",
    "APPROVED",
    "ACTIVE",
    "CLOSED_WRITTEN_OFF",
    "CLOSED_RESCINDED",
    "CLOSED_REJECTED",
  ]),
  disbursed: z.boolean().nullable(),
  repaidEvery: z.enum(["DAYS", "WEEKS", "MONTHS", "YEARS"]),
  expecteddisbursementdate: z.string().nullable(),
  interestCalculationPeriodType: z.enum(["DAILY", "SAME_AS_REPAYMENT_PERIOD"]).nullable(),
});

export type LoanApplication = z.infer<typeof LoanApplicationSchema>;

export const LoanScheduleSchema = z.object({
  id: z.number().nullable(),
  period: z.number(),
  fromDate: z.string(),
  toDate: z.string(),
  dueDate: z.string(),
  principalAmount: z.number(),
  interestAmount: z.number(),
  feeChargesAmount: z.number(),
  penaltyChargesAmount: z.number(),
  totalAmount: z.number(),
  principalAmountPaid: z.number().nullable(),
  interestAmountPaid: z.number().nullable(),
  feeChargesAmountPaid: z.number().nullable(),
  penaltyChargesAmountPaid: z.number().nullable(),
  totalAmountPaid: z.number().nullable(),
  complete: z.boolean(),
});

export type LoanSchedule = z.infer<typeof LoanScheduleSchema>;

export const SavingsAccountSchema = z.object({
  id: z.number(),
  accountNo: z.string(),
  clientId: z.number(),
  productId: z.number(),
  productName: z.string(),
  currency: z.object({
    code: z.string(),
    name: z.string(),
    decimalPlaces: z.number(),
  }),
  accountBalance: z.number(),
  approvedBalance: z.number().nullable(),
  status: z.enum(["SUBMITTED_AND_PENDING_APPROVAL", "APPROVED", "ACTIVE", "CLOSED"]),
  activationDate: z.string().nullable(),
});

export type SavingsAccount = z.infer<typeof SavingsAccountSchema>;

export const GLAccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  glCode: z.string(),
  accountType: z.enum(["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"]),
  accountUsage: z.enum(["DETAIL", "HEADER"]),
  parentAccountId: z.number().nullable(),
  accountBalance: z.number().nullable(),
  disabled: z.boolean(),
});

export type GLAccount = z.infer<typeof GLAccountSchema>;

export const JournalEntrySchema = z.object({
  id: z.number(),
  officeId: z.number(),
  accountId: z.number(),
  referenceNumber: z.string().nullable(),
  comments: z.string().nullable(),
  amount: z.number(),
  entryType: z.enum(["DEBIT", "CREDIT"]),
  transactionDate: z.string(),
  submittedOnDate: z.string(),
  createdDate: z.string(),
  createdByUserId: z.number(),
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const FineractErrorSchema = z.object({
  httpStatusCode: z.number(),
  defaultUserMessage: z.string(),
  userMessageGlobalizationCode: z.string(),
  errors: z.array(
    z.object({
      parameter: z.string(),
      code: z.string(),
      value: z.unknown().nullable(),
      developerMessage: z.string(),
      userMessageGlobalizationCode: z.string(),
    })
  ).optional(),
});

export type FineractError = z.infer<typeof FineractErrorSchema>;

// Request/Response wrapper types
export interface ProxyResponse<T> {
  data?: T;
  error?: FineractError;
  status: number;
  headers: Record<string, string>;
}

export interface FineractProxyOptions {
  tenantId?: string;
  headers?: Record<string, string>;
}
