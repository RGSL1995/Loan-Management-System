import { z } from "zod";

// LAS Product Schema - What companies configure
export const LASProductSchema = z.object({
  id: z.string().uuid().optional(),
  company_id: z.string().uuid(),
  name: z.string().min(3).max(100), // "Gold LAS", "Stock LAS"
  security_type: z.enum(["gold", "stocks", "mutual_funds", "bonds"]),
  min_amount: z.number().positive(),
  max_amount: z.number().positive(),
  ltv_percentage: z.number().min(10).max(100), // 10% to 100%
  haircut_percentage: z.number().min(0).max(50).default(5), // Safety margin
  tenure_months: z.array(z.number().positive()).min(1), // [12, 24, 36, 60]
  interest_rate: z.number().min(0).max(50), // 0% to 50% p.a.
  processing_fee_percentage: z.number().min(0).max(10).default(1),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type LASProduct = z.infer<typeof LASProductSchema>;

// LAS Settings Schema - Company-wide rules
export const LASSettingsSchema = z.object({
  id: z.string().uuid().optional(),
  company_id: z.string().uuid(),
  require_kyo_check: z.boolean().default(true),
  require_approval: z.boolean().default(true),
  require_cibil_check: z.boolean().default(true),
  require_bureau_pull: z.boolean().default(true),
  auto_approve_below: z.number().positive().optional(), // Auto-approve below this amount
  max_default_days_before_liquidation: z.number().min(30).max(180).default(90),
  require_nsdl_pledge: z.boolean().default(true), // For stocks/MFs
  enable_auto_liquidation: z.boolean().default(false),
  max_security_age_days: z.number().positive().optional(), // Expire pledges after N days
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type LASSettings = z.infer<typeof LASSettingsSchema>;

// Security Eligibility Schema - Which securities are allowed
export const LASSecutityEligibilitySchema = z.object({
  id: z.string().uuid().optional(),
  company_id: z.string().uuid(),
  security_type: z.enum(["gold", "stocks", "mutual_funds", "bonds"]),
  enabled: z.boolean().default(true),
  min_security_value: z.number().positive().optional(),
  exchange_id: z.string().optional(), // NSE, BSE for stocks
  rating_required: z.string().optional(), // AAA, AA, A for bonds
  blacklist_ids: z.array(z.string()).optional(), // Blacklisted security IDs
  created_at: z.string().datetime().optional(),
});

export type LASSecurityEligibility = z.infer<typeof LASSecutityEligibilitySchema>;

// Approver Schema - Who can approve loans
export const LASApproverSchema = z.object({
  id: z.string().uuid().optional(),
  company_id: z.string().uuid(),
  role: z.enum(["loan_officer", "credit_manager", "director", "super_user"]),
  user_id: z.string().uuid(),
  authority_limit: z.number().positive(), // Can approve up to this amount
  can_override: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
});

export type LASApprover = z.infer<typeof LASApproverSchema>;

// Form schemas for user input
export const CreateLASProductFormSchema = LASProductSchema.omit({
  id: true,
  company_id: true,
  created_at: true,
  updated_at: true,
});

export type CreateLASProductForm = z.infer<typeof CreateLASProductFormSchema>;

export const UpdateLASProductFormSchema = LASProductSchema.omit({
  id: true,
  company_id: true,
  created_at: true,
  updated_at: true,
});

export type UpdateLASProductForm = z.infer<typeof UpdateLASProductFormSchema>;

export const UpdateLASSettingsFormSchema = LASSettingsSchema.omit({
  id: true,
  company_id: true,
  created_at: true,
  updated_at: true,
});

export type UpdateLASSettingsForm = z.infer<typeof UpdateLASSettingsFormSchema>;
