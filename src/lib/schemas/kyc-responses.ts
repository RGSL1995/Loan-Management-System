import { z } from "zod";

// Base schema for Surepass response format
export const surepassBaseResponseSchema = z.object({
  status: z.boolean().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  message_code: z.string().optional(),
});

// Comprehensive PAN Response Schema (Surepass)
export const surepassPanComprehensiveSchema = surepassBaseResponseSchema.extend({
  data: z.object({
    pan_number: z.string(),
    full_name: z.string().optional(),
    first_name: z.string().optional(),
    middle_name: z.string().optional(),
    last_name: z.string().optional(),
    title: z.string().optional(),
    gender: z.string().optional(),
    dob: z.string().optional(), // Date of birth
    status: z.string(), // e.g. "VALID"
    aadhaar_seeding_status: z.string().optional(),
  }).optional()
});

export type SurepassPanComprehensiveResponse = z.infer<typeof surepassPanComprehensiveSchema>;

// DigiLocker Generation Schema
export const surepassDigiLockerLinkSchema = surepassBaseResponseSchema.extend({
  data: z.object({
    url: z.string(),
    valid_till: z.string().optional(),
    session_id: z.string().optional(), // Or transaction ID depending on exact surepass implementation
  }).optional()
});

export type SurepassDigiLockerLinkResponse = z.infer<typeof surepassDigiLockerLinkSchema>;

// Mock Webhook Schema (For when DigiLocker completes)
export const surepassDigiLockerWebhookSchema = z.object({
  event: z.string(), // e.g., "digilocker.completed"
  reference_id: z.string(),
  status: z.string(),
  payload: z.any().optional(), // Contains the actual documents extracted
});

// CIBIL Report Schema
export const surepassCibilReportSchema = surepassBaseResponseSchema.extend({
  data: z.object({
    cibil_score: z.number().optional(),
    report_id: z.string().optional(),
    status: z.string(), // e.g., "SUCCESS" or "NOT_FOUND"
    summary: z.object({
      total_accounts: z.number().optional(),
      active_accounts: z.number().optional(),
      overdue_accounts: z.number().optional(),
      current_balance: z.number().optional(),
    }).optional(),
  }).optional()
});

export type SurepassCibilReportResponse = z.infer<typeof surepassCibilReportSchema>;

// CIBIL Report PDF Download Schema
export const surepassCibilPdfSchema = surepassBaseResponseSchema.extend({
  data: z.object({
    pdf_url: z.string(),
    expires_at: z.string().optional(),
  }).optional()
});

export type SurepassCibilPdfResponse = z.infer<typeof surepassCibilPdfSchema>;

// Company Details (CIN / MCA) Schema
export const surepassCompanyDetailsSchema = surepassBaseResponseSchema.extend({
  data: z.object({
    cin: z.string(),
    company_name: z.string(),
    company_status: z.string().optional(),
    roc_code: z.string().optional(),
    registration_number: z.string().optional(),
    company_category: z.string().optional(),
    class_of_company: z.string().optional(),
    date_of_incorporation: z.string().optional(),
    authorized_capital: z.string().optional(),
    paid_up_capital: z.string().optional(),
    email_id: z.string().optional(),
    registered_address: z.string().optional(),
    directors: z.array(z.object({
      din: z.string(),
      name: z.string(),
      designation: z.string().optional(),
      date_of_appointment: z.string().optional(),
    })).optional()
  }).optional()
});

export type SurepassCompanyDetailsResponse = z.infer<typeof surepassCompanyDetailsSchema>;

// Corporate GSTIN Schema
export const surepassGstinSchema = surepassBaseResponseSchema.extend({
  data: z.object({
    gstin: z.string(),
    legal_name: z.string(),
    trade_name: z.string().optional(),
    status: z.string(), // e.g., "Active"
    registration_date: z.string().optional(),
    constitution_of_business: z.string().optional(),
    taxpayer_type: z.string().optional(),
    center_jurisdiction: z.string().optional(),
    state_jurisdiction: z.string().optional(),
    principal_place_address: z.string().optional(),
    nature_of_core_business: z.string().optional(),
  }).optional()
});

export type SurepassGstinResponse = z.infer<typeof surepassGstinSchema>;

// eSign Generation Schema
export const surepassEsignSchema = surepassBaseResponseSchema.extend({
  data: z.object({
    document_id: z.string(),
    sign_url: z.string(),
    expires_at: z.string().optional(),
  }).optional()
});

export type SurepassEsignResponse = z.infer<typeof surepassEsignSchema>;

// Bank Verification (Penny Drop) Schema
export const surepassBankVerificationSchema = surepassBaseResponseSchema.extend({
  data: z.object({
    client_id: z.string(),
    account_exists: z.boolean(),
    full_name: z.string(),
    remarks: z.string().optional(),
    ifsc_details: z.object({
      bank: z.string().optional(),
      branch: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
    }).optional()
  }).optional()
});

export type SurepassBankVerificationResponse = z.infer<typeof surepassBankVerificationSchema>;
