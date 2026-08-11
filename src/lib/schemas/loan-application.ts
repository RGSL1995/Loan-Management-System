import { z } from 'zod'

const isAtLeast18 = (val: string) => {
  if (!val) return false;
  const dob = new Date(val);
  if (isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18;
};

// Verhoeff Checksum Algorithm for Aadhaar validation
const verhoeffTableD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];
const verhoeffTableP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

function validateVerhoeff(str: string): boolean {
  if (!/^\d{12}$/.test(str)) return false;
  let c = 0;
  const myArray = str.split('').reverse().map(Number);
  for (let i = 0; i < myArray.length; i++) {
    c = verhoeffTableD[c][verhoeffTableP[i % 8][myArray[i]]];
  }
  return c === 0;
}

// Family relationship filter list
const FAMILY_KEYWORDS = [
  'spouse', 'father', 'mother', 'brother', 'sister', 'son', 'daughter',
  'parent', 'sibling', 'child', 'family', 'wife', 'husband', 'uncle', 'aunt',
  'cousin', 'grandfather', 'grandmother', 'nephew', 'niece', 'relative', 'rel'
];

const isFamilyRelationship = (rel: string) => {
  const normalized = rel.toLowerCase().trim();
  return FAMILY_KEYWORDS.some(keyword => normalized.includes(keyword));
};

// Enums (realignment with Excel sheets)
export const LoanTypeEnum = z.enum(['PERSONAL_LOAN', 'BUSINESS_LOAN'])
export const LegalStatusEnum = z.enum(['PVT_LTD', 'PUBLIC_LTD', 'PARTNERSHIP_FIRM', 'PROPRIETORSHIP', 'OTHERS'])
export const ResidenceStatusEnum = z.enum(['OWNED', 'RENTED', 'COMPANY_PROVIDED', 'OTHERS'])
export const MaritalStatusEnum = z.enum(['SINGLE', 'MARRIED'])
export const GenderEnum = z.enum(['M', 'F', 'THIRD_GENDER'])
export const CategoryEnum = z.enum(['GENERAL', 'SC', 'ST', 'OTHERS'])
export const EducationEnum = z.enum(['UG', 'GRADUATE', 'PROFESSIONAL', 'PG', 'OTHERS'])
export const FacilityTypeEnum = z.enum(['PERSONAL_LOAN', 'BUSINESS_LOAN'])
export const DocumentStatusEnum = z.enum(['PENDING', 'VERIFIED', 'REJECTED'])

// Section 1: Application Setup Info
export const ApplicationInfoSchema = z.object({
  loan_type: LoanTypeEnum,
  sourcing_channel: z.enum(['BRANCH', 'DSA', 'DIGITAL', 'DST']).default('DIGITAL'),
  applicant_photo_file_id: z.string().optional(),
  applicant_signature_file_id: z.string().optional(),
  co_applicant_photo_file_id: z.string().optional(),
})

export type ApplicationInfo = z.infer<typeof ApplicationInfoSchema>

// Common Address Block Schema
export const AddressBlockSchema = z.object({
  address_line1: z.string().min(1, 'Address line 1 required'),
  address_line2: z.string().optional(),
  landmark: z.string().optional(),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Valid 6-digit Pincode required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  ownership: ResidenceStatusEnum.default('OTHERS'),
  years_at_address: z.number().int().nonnegative().optional(),
  years_in_city: z.number().int().nonnegative().optional(),
})

export type AddressBlock = z.infer<typeof AddressBlockSchema>

// Section 2: Applicant Details
export const ApplicantDetailsSchema = z.object({
  // Name matches entity name (Business) or individual name (Personal)
  name: z.string().min(2, 'Name must be at least 2 characters'),
  fathers_spouse_name: z.string().optional(), // Personal only
  legal_status: LegalStatusEnum.default('OTHERS'), // Business only
  date_of_birth_or_incorporation: z.string().min(1, 'Date is required'),
  roc_registration_number: z.string().optional(), // Business Pvt/Public/LLP
  partnership_deed_no: z.string().optional(), // Business Partnership
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Valid PAN required (e.g. ABCDE1234F)'),
  gst_registration_number: z.string().optional(), // Business
  residential_address: AddressBlockSchema.optional(), // Principal place of business (Business) or residence (Personal)
  permanent_address: AddressBlockSchema.optional(), // Personal only
  registered_office_address: AddressBlockSchema.optional(), // Business only
  built_up_area: z.string().optional(), // Business
  permanent_employees: z.number().int().nonnegative().default(0),
  temporary_employees: z.number().int().nonnegative().default(0),
  advance_tax_paid: z.boolean().default(false),
  email: z.string().email('Valid email required'),
  mobile_number: z.string().regex(/^[6-9][0-9]{9}$/, 'Valid 10-digit mobile number required'),
  landline_number: z.string().optional(),
})

export type ApplicantDetails = z.infer<typeof ApplicantDetailsSchema>

// Section 3: Co-Applicant Details
export const CoApplicantDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  fathers_spouse_name: z.string().min(2, 'Father/Spouse name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required').refine(isAtLeast18, {
    message: 'Co-applicant must be at least 18 years old',
  }),
  marital_status: MaritalStatusEnum.optional(),
  gender: GenderEnum.optional(),
  dependents_count: z.number().int().nonnegative().default(0),
  is_indian_citizen: z.boolean().default(true),
  category: CategoryEnum.optional(),
  residential_address: AddressBlockSchema.optional(),
  permanent_address: AddressBlockSchema.optional(),
  mobile_number: z.string().regex(/^[6-9][0-9]{9}$/, 'Valid 10-digit mobile number required').optional(),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Valid PAN required').optional(),
  email: z.string().email('Valid email required').optional(),
  correspondence_address: z.enum(['RESIDENCE', 'OFFICE', 'NEW_PROPERTY']).optional(),
  education_qualification: EducationEnum.optional(),
  coapp_photo_file_id: z.string().optional(),
  coapp_signature_file_id: z.string().optional(),
})

export type CoApplicantDetails = z.infer<typeof CoApplicantDetailsSchema>

// Section 4: Contact Person (Business Only)
export const ContactPersonSchema = z.object({
  name: z.string().min(2, 'Contact name must be at least 2 characters'),
  designation: z.string().min(1, 'Designation required'),
  mobile_number: z.string().regex(/^[6-9][0-9]{9}$/, 'Valid 10-digit mobile number required'),
  email: z.string().email('Valid email required'),
})

export type ContactPerson = z.infer<typeof ContactPersonSchema>

// Section 5: Associate/Group Company (Business Only)
export const AssociateCompanySchema = z.object({
  company_name: z.string().min(1, 'Company name required'),
  business_profile: z.string().optional(),
  sales_last_fy: z.number().nonnegative().optional(),
  pat_last_fy: z.number().optional(), // Negatives allowed
  total_borrowings: z.number().nonnegative().optional(),
  total_net_worth: z.number().optional(), // Negatives allowed
})

export type AssociateCompany = z.infer<typeof AssociateCompanySchema>

// Section 6: Existing Loans (Obligations)
export const ExistingLoanSchema = z.object({
  loan_type: z.string().min(1, 'Loan type required'), // Custom drop-down enums in UI
  institution_name: z.string().min(1, 'Institution name required'),
  account_number: z.string().min(1, 'Account number required'),
  loan_amount: z.number().positive('Amount must be positive'),
  emi: z.number().nonnegative('EMI must be >= 0'),
  outstanding_principal: z.number().nonnegative('Outstanding principal must be >= 0'),
  balance_tenure_months: z.number().int().nonnegative('Tenure months must be >= 0'),
})

export type ExistingLoan = z.infer<typeof ExistingLoanSchema>

// Section 7: Bank Account
export const BankAccountSchema = z.object({
  account_holder_name: z.string().min(2, 'Account holder name required'),
  bank_name: z.string().min(1, 'Bank name required'),
  branch: z.string().min(1, 'Branch name required'),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Valid IFSC code required (e.g. HDFC0000243)'),
  account_operated_since: z.string().optional(), // MM/YYYY format
  account_number: z.string().min(9, 'Account number must be 9-18 digits').max(18, 'Account number must be 9-18 digits'),
  account_type: z.enum(['INDIVIDUAL', 'JOINT']),
  is_verified: z.boolean().default(false), // Penny-drop outcome
})

export type BankAccount = z.infer<typeof BankAccountSchema>

// Section 8: Proposed Facility
export const ProposedFacilitySchema = z.object({
  facility_type: FacilityTypeEnum,
  facility_amount_lakhs: z.number().positive('Facility amount must be positive'),
  loan_tenure_years: z.number().positive('Tenure must be positive'),
})

export type ProposedFacility = z.infer<typeof ProposedFacilitySchema>

// Section 9: References
export const ReferenceSchema = z.object({
  name: z.string().min(2, 'Reference name must be at least 2 characters'),
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Valid 6-digit Pincode required'),
  occupation: z.string().optional(),
  phone_number: z.string().optional(),
  mobile_number: z.string().regex(/^[6-9][0-9]{9}$/, 'Valid 10-digit mobile number required'),
  relationship: z.string().min(1, 'Relationship is required'),
  years_known: z.number().int().positive('Years known must be positive'),
})

export type Reference = z.infer<typeof ReferenceSchema>

// Section 10: Document Checklist Upload Item
export const DocumentUploadItemSchema = z.object({
  document_name: z.string(),
  is_submitted: z.boolean().default(false),
  file_id: z.string().optional(),
  file_name: z.string().optional(),
  file_size: z.number().optional(),
  status: DocumentStatusEnum.default('PENDING'),
  is_api_satisfied: z.boolean().default(false),
})

export type DocumentUploadItem = z.infer<typeof DocumentUploadItemSchema>
export const DocumentChecklistSchema = z.record(z.string(), DocumentUploadItemSchema)
export type DocumentChecklist = z.infer<typeof DocumentChecklistSchema>

// Section 11: Declarations & eSignatures
export const DeclarationSchema = z.object({
  decl_accepted: z.boolean().refine(val => val === true, { message: 'Must accept terms and conditions' }),
  consent_credit_bureau: z.boolean().refine(val => val === true, { message: 'Must consent to credit bureau check' }),
  consent_data_sharing: z.boolean().refine(val => val === true, { message: 'Must consent to data sharing' }),
  consent_ekyc_aadhaar: z.boolean().default(false),
  aadhaar_number: z.string().optional().refine(val => !val || validateVerhoeff(val), {
    message: 'Valid 12-digit Aadhaar (Verhoeff checksum verified) required'
  }),
  service_agency_rel_no: z.string().optional(),
  applicant_signature_file_id: z.string().optional(),
  declaration_date: z.string().min(1, 'Date is required'),
  
  // Co-applicant declaration fields (optional, conditional on presence)
  co_applicant_decl_accepted: z.boolean().optional(),
  co_applicant_consent_credit_bureau: z.boolean().optional(),
  co_applicant_consent_data_sharing: z.boolean().optional(),
  co_applicant_consent_ekyc_aadhaar: z.boolean().optional(),
  co_applicant_aadhaar_number: z.string().optional().refine(val => !val || validateVerhoeff(val), {
    message: 'Valid 12-digit Co-applicant Aadhaar (Verhoeff checksum verified) required'
  }),
  co_applicant_signature_file_id: z.string().optional(),
  co_applicant_declaration_date: z.string().optional(),
})

export type Declaration = z.infer<typeof DeclarationSchema>

// Section 12: CKYC Consent (Retained for backwards compatibility/Supabase)
export const CKYCConsentSchema = z.object({
  // Defaults to false — the UI does not currently render a standalone CKYC consent
  // checkbox, so we avoid breaking submission when this field is absent.
  consent_provided: z.boolean().default(false),
})

export type CKYCConsent = z.infer<typeof CKYCConsentSchema>

// Complete dynamic Loan Application validation schema
export const CompleteLoanApplicationSchema = z.object({
  application_info: ApplicationInfoSchema,
  applicant_details: ApplicantDetailsSchema,
  co_applicant_details: CoApplicantDetailsSchema.optional().nullable(),
  contact_person: ContactPersonSchema.optional().nullable(),
  associate_companies: z.array(AssociateCompanySchema).default([]),
  existing_loans: z.array(ExistingLoanSchema).default([]),
  bank_account: BankAccountSchema,
  proposed_facilities: z.array(ProposedFacilitySchema).min(1, 'At least one proposed facility required'),
  references: z.array(ReferenceSchema).min(2, 'Exactly 2 references required').max(2, 'Exactly 2 references required'),
  document_checklist: DocumentChecklistSchema,
  declaration: DeclarationSchema,
  ckyc_consent: CKYCConsentSchema.optional(),
}).superRefine((data, ctx) => {
  const isBusiness = data.application_info.loan_type === 'BUSINESS_LOAN';
  const isPersonal = data.application_info.loan_type === 'PERSONAL_LOAN';

  // 1. Applicant details validation based on loan type
  if (isPersonal) {
    if (!data.applicant_details.fathers_spouse_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['applicant_details', 'fathers_spouse_name'],
        message: "Father's or Spouse's name is required for Personal loans",
      });
    }
    // Check age 18-65 for personal loan
    const dob = data.applicant_details.date_of_birth_or_incorporation;
    if (!isAtLeast18(dob)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['applicant_details', 'date_of_birth_or_incorporation'],
        message: 'Applicant must be at least 18 years old',
      });
    }
    // Check PAN is individual (4th character P)
    const pan = data.applicant_details.pan_number;
    if (pan && pan[3] !== 'P') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['applicant_details', 'pan_number'],
        message: 'PAN fourth character must be P for individual applicants',
      });
    }
    // Check permanent address is present
    if (!data.applicant_details.permanent_address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['applicant_details', 'permanent_address'],
        message: 'Permanent address is required for Personal loans',
      });
    }
  }

  if (isBusiness) {
    // Check PAN character is corporate/company/firm/proprietor
    const pan = data.applicant_details.pan_number;
    if (pan && !['C', 'F', 'P'].includes(pan[3])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['applicant_details', 'pan_number'],
        message: 'PAN fourth character must be C (Company), F (Firm/LLP) or P (Proprietorship) for Business loans',
      });
    }
    // Validate CIN / Registration Number if corporate
    const status = data.applicant_details.legal_status;
    if (['PVT_LTD', 'PUBLIC_LTD'].includes(status)) {
      const cin = data.applicant_details.roc_registration_number;
      if (!cin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['applicant_details', 'roc_registration_number'],
          message: 'ROC Registration Number (CIN) is required for limited companies',
        });
      } else if (!/^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(cin)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['applicant_details', 'roc_registration_number'],
          message: 'Invalid CIN format',
        });
      }
    }
    // Validate partnership deed if partnership
    if (status === 'PARTNERSHIP_FIRM') {
      if (!data.applicant_details.partnership_deed_no) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['applicant_details', 'partnership_deed_no'],
          message: 'Partnership deed registration number is required for partnership firms',
        });
      }
    }
    // Validate Registered Office Address is present
    if (!data.applicant_details.registered_office_address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['applicant_details', 'registered_office_address'],
        message: 'Registered office address is required for Business loans',
      });
    }
    // Contact Person is required
    if (!data.contact_person) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contact_person'],
        message: 'Authorized contact person details are required for Business loans',
      });
    }
  }

  // 2. Reference validation - ensure relationships do NOT include family keywords
  if (data.references) {
    data.references.forEach((ref, index) => {
      if (isFamilyRelationship(ref.relationship)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['references', index, 'relationship'],
          message: 'References must be non-family members',
        });
      }
    });
  }

  // 3. Bank Account penny-drop verification check
  if (data.bank_account && !data.bank_account.is_verified) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['bank_account', 'is_verified'],
      message: 'At least one verified bank account (Penny-Drop completed) is required to proceed',
    });
  }

  // 4. Co-Applicant verification
  if (data.co_applicant_details) {
    const co = data.co_applicant_details;
    // DOB age limit check
    if (!isAtLeast18(co.date_of_birth)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['co_applicant_details', 'date_of_birth'],
        message: 'Co-applicant must be at least 18 years old',
      });
    }
    // Check Aadhaar if Aadhaar eKYC consent given
    if (data.declaration.co_applicant_consent_ekyc_aadhaar && !data.declaration.co_applicant_aadhaar_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['declaration', 'co_applicant_aadhaar_number'],
        message: 'Co-applicant Aadhaar number is required when Aadhaar consent is checked',
      });
    }
  }
});

export type CompleteLoanApplication = z.infer<typeof CompleteLoanApplicationSchema>
