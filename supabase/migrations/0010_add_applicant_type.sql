-- Add applicant_type column to loan_applications table
BEGIN;

ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS applicant_type VARCHAR(50)
CHECK (applicant_type IN ('individual', 'corporate', 'others'));

-- Set default for existing rows
UPDATE public.loan_applications
SET applicant_type = 'individual'
WHERE applicant_type IS NULL;

-- Make it NOT NULL
ALTER TABLE public.loan_applications
ALTER COLUMN applicant_type SET NOT NULL;

COMMIT;
