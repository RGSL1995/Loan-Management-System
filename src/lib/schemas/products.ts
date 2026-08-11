import { z } from "zod";

// ============================================
// PRODUCT TYPE ENUM
// ============================================
export const ProductTypeEnum = z.enum([
  "las",
  "gold_loan",
  "lap",
  "personal_loan",
]);

export type ProductType = z.infer<typeof ProductTypeEnum>;

// ============================================
// TYPE-SPECIFIC CONFIG SCHEMAS
// ============================================

// LAS (Loan Against Securities)
export const LASConfigSchema = z.object({
  security_type: z.enum(["gold", "stocks", "mutual_funds", "bonds"]),
  ltv_percentage: z.number().min(10).max(100),
  haircut_percentage: z.number().min(0).max(50),
  require_nsdl_pledge: z.boolean().default(true),
});

export type LASConfig = z.infer<typeof LASConfigSchema>;

// Gold Loan
export const GoldLoanConfigSchema = z.object({
  gold_purity_min: z.number().min(750).max(999), // 750=18K, 916=22K
  rate_source: z.enum(["MCX", "IBJA", "MANUAL"]),
  melting_charges_percent: z.number().min(0).max(10),
  storage_charges_annual_percent: z.number().min(0).max(5),
  require_insurance: z.boolean().default(false),
  making_charges_percent: z.number().min(0).max(5).optional(),
});

export type GoldLoanConfig = z.infer<typeof GoldLoanConfigSchema>;

// LAP (Loan Against Property)
export const LAPConfigSchema = z.object({
  property_types: z.array(
    z.enum(["residential", "commercial", "land", "multi_unit"])
  ),
  ltv_percentage: z.number().min(10).max(80),
  require_legal_verification: z.boolean().default(true),
  require_insurance: z.boolean().default(true),
  min_property_value: z.number().positive(),
  max_property_value: z.number().positive().optional(),
  require_property_appraisal: z.boolean().default(true),
});

export type LAPConfig = z.infer<typeof LAPConfigSchema>;

// Personal Loan (Unsecured)
export const PersonalLoanConfigSchema = z.object({
  credit_score_min: z.number().min(300).max(900),
  require_income_proof: z.boolean().default(true),
  max_leverage_ratio: z.number().positive(), // Income multiple (e.g., 10x salary)
  quick_approval_below: z.number().positive().optional(), // Auto-approve below this
  bureau_checks_required: z.array(z.enum(["cibil", "experian", "equifax"])),
});

export type PersonalLoanConfig = z.infer<typeof PersonalLoanConfigSchema>;

// ============================================
// DISCRIMINATED UNION: Config by Product Type
// ============================================
export const ProductConfigSchema = z.discriminatedUnion("product_type", [
  z.object({
    product_type: z.literal("las"),
    config: LASConfigSchema,
  }),
  z.object({
    product_type: z.literal("gold_loan"),
    config: GoldLoanConfigSchema,
  }),
  z.object({
    product_type: z.literal("lap"),
    config: LAPConfigSchema,
  }),
  z.object({
    product_type: z.literal("personal_loan"),
    config: PersonalLoanConfigSchema,
  }),
]);

// ============================================
// BASE PRODUCT SCHEMA
// ============================================
export const BaseProductSchema = z.object({
  id: z.string().uuid().optional(),
  company_id: z.string().uuid(),
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  min_amount: z.number().int().positive(),
  max_amount: z.number().int().positive(),
  interest_rate_min: z.number().min(0).max(50),
  interest_rate_max: z.number().min(0).max(50),
  tenure_months: z.array(z.number().int().positive()).min(1),
  processing_fee_percentage: z.number().min(0).max(10),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// ============================================
// FULL PRODUCT SCHEMA (with type-specific config)
// ============================================
export const ProductSchema = BaseProductSchema.extend({
  product_type: ProductTypeEnum,
  config: z.union([LASConfigSchema, GoldLoanConfigSchema, LAPConfigSchema, PersonalLoanConfigSchema]),
}).refine(
  // Ensure config matches product_type
  (data) => {
    if (data.product_type === "las" && !("security_type" in data.config)) return false;
    if (data.product_type === "gold_loan" && !("gold_purity_min" in data.config)) return false;
    if (data.product_type === "lap" && !("property_types" in data.config)) return false;
    if (data.product_type === "personal_loan" && !("credit_score_min" in data.config)) return false;
    return true;
  },
  { message: "Config structure doesn't match product type" }
);

export type Product = z.infer<typeof ProductSchema>;

// ============================================
// FORM SCHEMAS (for client-side input)
// ============================================

// Create form (without auto-generated fields)
export const CreateProductFormSchema = BaseProductSchema.omit({
  id: true,
  company_id: true,
  created_at: true,
  updated_at: true,
}).merge(z.object({
  product_type: ProductTypeEnum,
  config: z.record(z.string(), z.any()).default({}),
}));

export type CreateProductForm = z.infer<typeof CreateProductFormSchema>;

// Update form
export const UpdateProductFormSchema = BaseProductSchema.omit({
  id: true,
  company_id: true,
  created_at: true,
  updated_at: true,
}).merge(z.object({
  product_type: ProductTypeEnum,
  config: z.record(z.string(), z.any()).default({}),
}));

export type UpdateProductForm = z.infer<typeof UpdateProductFormSchema>;

// ============================================
// PRODUCT TYPE LABELS & METADATA
// ============================================
export const ProductTypeMetadata: Record<ProductType, { label: string; description: string; icon: string }> = {
  las: {
    label: "Loan Against Securities",
    description: "Borrow against your gold, stocks, mutual funds, or bonds",
    icon: "📈",
  },
  gold_loan: {
    label: "Gold Loan",
    description: "Quick loans against physical gold at best rates",
    icon: "👑",
  },
  lap: {
    label: "Loan Against Property",
    description: "Borrow against your residential or commercial property",
    icon: "🏠",
  },
  personal_loan: {
    label: "Personal Loan",
    description: "Unsecured personal loans based on credit profile",
    icon: "💰",
  },
};
