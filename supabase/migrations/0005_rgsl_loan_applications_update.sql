-- Update loan_applications table to support RGSL form structure
-- This migration adds new JSONB columns for RGSL-specific form data

BEGIN;

-- Add new columns for RGSL form data
ALTER TABLE loan_applications
  ADD COLUMN IF NOT EXISTS loan_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS loan_tenure INTEGER,
  ADD COLUMN IF NOT EXISTS loan_purpose TEXT,
  ADD COLUMN IF NOT EXISTS loan_facility_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS branch VARCHAR(50) CHECK (branch IN ('noida', 'delhi')),
  ADD COLUMN IF NOT EXISTS applicant_type VARCHAR(50) CHECK (applicant_type IN ('individual', 'corporate', 'others')),
  ADD COLUMN IF NOT EXISTS individual_applicant_data JSONB,
  ADD COLUMN IF NOT EXISTS business_applicant_data JSONB,
  ADD COLUMN IF NOT EXISTS collateral_details JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS processing_fees_data JSONB,
  ADD COLUMN IF NOT EXISTS other_details TEXT,
  ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN DEFAULT FALSE;

-- Create indexes for new columns for better query performance
CREATE INDEX IF NOT EXISTS idx_loan_applications_applicant_type ON loan_applications(applicant_type);
CREATE INDEX IF NOT EXISTS idx_loan_applications_loan_amount ON loan_applications(loan_amount);
CREATE INDEX IF NOT EXISTS idx_loan_applications_declaration_accepted ON loan_applications(declaration_accepted);

-- Add comment documenting the new schema structure
COMMENT ON COLUMN loan_applications.applicant_type IS 'Type of applicant: individual, corporate, or others';
COMMENT ON COLUMN loan_applications.loan_amount IS 'Requested loan amount in INR';
COMMENT ON COLUMN loan_applications.loan_tenure IS 'Loan tenure in months';
COMMENT ON COLUMN loan_applications.loan_purpose IS 'Purpose of the loan';
COMMENT ON COLUMN loan_applications.loan_facility_type IS 'Type of loan facility';
COMMENT ON COLUMN loan_applications.branch IS 'Branch: Noida or Delhi';
COMMENT ON COLUMN loan_applications.individual_applicant_data IS 'JSONB containing individual applicant details (name, pan, aadhaar, addresses, work details, etc.)';
COMMENT ON COLUMN loan_applications.business_applicant_data IS 'JSONB containing business applicant details (entity name, company type, pan, cin, addresses, etc.)';
COMMENT ON COLUMN loan_applications.collateral_details IS 'JSONB array containing collateral/security details (type, charge, property age, status, address, etc.)';
COMMENT ON COLUMN loan_applications.processing_fees_data IS 'JSONB containing processing fees information (instrument type, amount, bank name, etc.)';
COMMENT ON COLUMN loan_applications.other_details IS 'Any other additional details provided by the applicant';
COMMENT ON COLUMN loan_applications.declaration_accepted IS 'Whether the applicant has accepted the declaration and terms';

-- Drop the old constraint if it exists and create a new one that's more flexible
ALTER TABLE loan_applications DROP CONSTRAINT IF EXISTS valid_co_applicant;

-- Create a new validation function for RGSL applications
CREATE OR REPLACE FUNCTION validate_rgsl_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate applicant type
  IF NEW.applicant_type NOT IN ('individual', 'corporate', 'others') THEN
    RAISE EXCEPTION 'Invalid applicant type. Must be individual, corporate, or others.';
  END IF;

  -- Ensure applicant data is provided based on type
  IF NEW.applicant_type = 'individual' AND NEW.individual_applicant_data IS NULL THEN
    RAISE EXCEPTION 'Individual applicant data is required when applicant_type is individual';
  END IF;

  IF NEW.applicant_type IN ('corporate', 'others') AND NEW.business_applicant_data IS NULL THEN
    RAISE EXCEPTION 'Applicant data is required when applicant_type is corporate or others';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_rgsl_application_trigger ON loan_applications;
CREATE TRIGGER validate_rgsl_application_trigger
  BEFORE INSERT OR UPDATE ON loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION validate_rgsl_application();

COMMIT;
