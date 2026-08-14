-- Add individual loan detail columns to loan_applications table
BEGIN;

ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS loan_amount DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS loan_tenure INTEGER,
ADD COLUMN IF NOT EXISTS loan_purpose VARCHAR(500),
ADD COLUMN IF NOT EXISTS loan_facility_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS branch VARCHAR(100),
ADD COLUMN IF NOT EXISTS applicant_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS individual_applicant_data JSONB,
ADD COLUMN IF NOT EXISTS business_applicant_data JSONB,
ADD COLUMN IF NOT EXISTS collateral_details JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS processing_fees_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS other_details TEXT,
ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN DEFAULT false;

COMMIT;
