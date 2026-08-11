import { z } from "zod";

// LAP - Loan Against Property
// This schema defines the product_data JSONB payload for LAP applications.
// Add/remove fields here freely during development — no DB migration needed.

export const lapProductSchema = z.object({
  // Facility Details
  proposed_amount: z.number().min(1, "Proposed loan amount is required"),
  tenure_months: z.number().min(12).max(360),
  interest_rate: z.number().min(0).max(100),
  purpose: z.string().min(3, "Purpose is required"),
  mortgage_type: z.enum(["Equitable_Mortgage", "Registered_Mortgage", "Simple_Mortgage"]),

  // Property Details
  property: z.object({
    property_type: z.enum([
      "Residential_Flat",
      "Residential_House",
      "Commercial_Office",
      "Commercial_Shop",
      "Plot_Residential",
      "Plot_Commercial",
      "Industrial",
      "Other",
    ]),
    address: z.string().min(5, "Property address is required"),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^[0-9]{6}$/, "Invalid pincode"),
    area_sqft: z.number().min(1).optional(),
    survey_number: z.string().optional(),
    ownership_type: z.enum(["Self_Owned", "Joint_Owned", "Family_Owned"]),
  }),

  // Valuation
  valuation: z.object({
    market_value: z.number().min(0, "Market value is required"),
    distress_value: z.number().min(0).optional(),
    valuation_date: z.string().optional(), // ISO date string
    valuer_name: z.string().optional(),
    ltv_percent: z.number().min(0).max(100),
  }),

  // Title & Legal
  legal: z.object({
    title_clear: z.boolean().optional(),
    encumbrance_free: z.boolean().optional(),
    legal_report_date: z.string().optional(),
    solicitor_name: z.string().optional(),
    remarks: z.string().optional(),
  }).optional(),
});

export type LapProductData = z.infer<typeof lapProductSchema>;
