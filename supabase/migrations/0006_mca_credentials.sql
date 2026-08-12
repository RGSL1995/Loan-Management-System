-- Add MCA credentials and company details to loan_applications table
BEGIN;

ALTER TABLE loan_applications
  ADD COLUMN IF NOT EXISTS mca_credentials JSONB,
  ADD COLUMN IF NOT EXISTS mca_company_details JSONB,
  ADD COLUMN IF NOT EXISTS mca_last_fetched_at TIMESTAMP;

COMMENT ON COLUMN loan_applications.mca_credentials IS 'Encrypted MCA login credentials (username, password)';
COMMENT ON COLUMN loan_applications.mca_company_details IS 'Cached company details fetched from MCA';
COMMENT ON COLUMN loan_applications.mca_last_fetched_at IS 'Timestamp when MCA details were last fetched';

COMMIT;
