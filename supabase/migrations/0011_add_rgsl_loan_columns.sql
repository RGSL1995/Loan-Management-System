-- Add all RGSL loan application columns to loan_applications table
BEGIN;

-- Add missing columns
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS branch VARCHAR(100),
ADD COLUMN IF NOT EXISTS loan_facility_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS individual_applicant_data JSONB,
ADD COLUMN IF NOT EXISTS business_applicant_data JSONB,
ADD COLUMN IF NOT EXISTS collateral_details JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS processing_fees_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS other_details TEXT;

COMMIT;
