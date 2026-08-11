import { z } from "zod";

// SCL - Smart Credit Line (Revolving Credit Facility)
// This schema defines the product_data JSONB payload for SCL applications.
// Add/remove fields here freely during development — no DB migration needed.

export const sclProductSchema = z.object({
  // Credit Line Facility
  credit_limit: z.number().min(1, "Credit limit is required"),
  tenure_months: z.number().min(6).max(120),
  interest_rate: z.number().min(0).max(100),
  processing_fee_percent: z.number().min(0).max(10).optional(),

  // Revolving Terms
  revolving_type: z.enum([
    "Fully_Revolving",     // Borrower can redraw up to credit limit at any time
    "Partially_Revolving", // Redraw only up to a specified sub-limit
    "Non_Revolving",       // Once drawn, cannot be re-used (term loan behaviour)
  ]),
  drawdown_min: z.number().min(0).optional(),  // Minimum drawdown amount per tranche
  repayment_cycle: z.enum(["Monthly", "Quarterly", "Bullet"]),

  // Collateral (SCL can be unsecured or secured by a mix of collateral)
  collateral_type: z.enum([
    "Unsecured",
    "Secured_FD",       // Fixed Deposit
    "Secured_Property", // Property (cross-references LAP logic)
    "Secured_Mixed",
  ]),
  collateral_details: z.string().optional(), // Freeform description of collateral

  // Business Financials (for business SCL)
  business_financials: z.object({
    annual_turnover: z.number().min(0).optional(),
    net_profit: z.number().min(0).optional(),
    gst_annual: z.number().min(0).optional(),
    vintage_years: z.number().min(0).optional(),
  }).optional(),

  // Purpose
  purpose: z.string().min(3, "Purpose is required"),
});

export type SclProductData = z.infer<typeof sclProductSchema>;
