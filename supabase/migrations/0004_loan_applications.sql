-- Create loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_number VARCHAR(50) UNIQUE NOT NULL,

  -- Application Info
  loan_type VARCHAR(50) NOT NULL CHECK (loan_type IN ('personal_loan', 'business_loan')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'approved_with_conditions')),

  -- Applicant Details
  applicant_data JSONB NOT NULL,
  co_applicant_data JSONB,
  contact_person_data JSONB,

  -- Business Details
  associate_company_data JSONB,
  existing_loans JSONB DEFAULT '[]'::jsonb,

  -- Bank & Facility
  bank_account_data JSONB NOT NULL,
  proposed_facilities JSONB NOT NULL,

  -- Additional Info
  references JSONB NOT NULL,
  document_checklist JSONB NOT NULL,
  declaration_data JSONB NOT NULL,
  ckyc_consent JSONB NOT NULL,

  -- File attachments
  applicant_signature_file_id UUID,
  applicant_photo_file_id UUID,
  co_applicant_photo_file_id UUID,
  declaration_signature_file_id UUID,
  co_applicant_declaration_signature_file_id UUID,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  created_by UUID REFERENCES profiles(id),

  CONSTRAINT valid_co_applicant CHECK (
    (loan_type = 'personal_loan' AND co_applicant_data IS NULL) OR
    (loan_type = 'business_loan')
  )
);

-- Create indexes
CREATE INDEX idx_loan_applications_company_id ON loan_applications(company_id);
CREATE INDEX idx_loan_applications_applicant_id ON loan_applications(applicant_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_applications_created_at ON loan_applications(created_at);
CREATE INDEX idx_loan_applications_application_number ON loan_applications(application_number);

-- Enable RLS
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view applications in their company
CREATE POLICY "users_can_view_company_applications"
  ON loan_applications FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

-- Users can create applications in their company
CREATE POLICY "users_can_create_applications"
  ON loan_applications FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

-- Users can update own/company applications
CREATE POLICY "users_can_update_applications"
  ON loan_applications FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

-- Create a function to generate application numbers
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.application_number := 'APP-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(NEXTVAL('loan_application_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for application numbers
CREATE SEQUENCE IF NOT EXISTS loan_application_seq START 1001;

-- Create trigger for application number generation
CREATE TRIGGER generate_app_number
  BEFORE INSERT ON loan_applications
  FOR EACH ROW
  WHEN (NEW.application_number IS NULL)
  EXECUTE FUNCTION generate_application_number();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loan_application_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp update
CREATE TRIGGER update_loan_application_timestamp
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_application_timestamp();
