import { z } from "zod";

// LAS - Loan Against Securities
// This schema defines the product_data JSONB payload for LAS applications.
// Add/remove fields here freely during development — no DB migration needed.

export const lasProductSchema = z.object({
  // Facility Details
  proposed_limit: z.number().min(1, "Proposed limit is required"),
  drawing_power: z.number().min(1, "Drawing power is required"),
  tenure_months: z.number().min(1).max(360),
  interest_rate: z.number().min(0).max(100),
  purpose: z.string().min(3, "Purpose is required"),

  // Pledged Securities
  pledged_securities: z.array(
    z.object({
      security_type: z.enum(["Equity", "MutualFund", "Bonds", "ETF", "Other"]),
      isin: z.string().optional(),
      security_name: z.string().min(1),
      quantity: z.number().min(1),
      current_market_value: z.number().min(0),
      haircut_percent: z.number().min(0).max(100),
      eligible_value: z.number().min(0), // Computed: market_value * (1 - haircut/100)
    })
  ).min(1, "At least one security must be pledged"),

  // LTV Calculation (computed, but stored for audit)
  total_market_value: z.number().min(0),
  total_eligible_value: z.number().min(0),
  ltv_percent: z.number().min(0).max(100),

  // Depository & DP Account
  dp_name: z.string().optional(),
  dp_account_number: z.string().optional(),
  demat_account_number: z.string().optional(),
});

export type LasProductData = z.infer<typeof lasProductSchema>;
