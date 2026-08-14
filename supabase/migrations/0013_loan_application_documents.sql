-- Create loan_application_documents table to store CKYC and other extracted documents
BEGIN;

CREATE TABLE IF NOT EXISTS public.loan_application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  document_type VARCHAR(50) CHECK (document_type IN ('aadhaar', 'pan', 'ckyc', 'gstin', 'other')),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_loan_app_documents_application_id ON public.loan_application_documents(application_id);
CREATE INDEX idx_loan_app_documents_document_type ON public.loan_application_documents(document_type);

-- Enable RLS
ALTER TABLE public.loan_application_documents ENABLE ROW LEVEL SECURITY;

-- Users can view documents for their company's applications
CREATE POLICY "users_can_view_company_application_documents"
  ON public.loan_application_documents FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM public.loan_applications
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Users can upload documents to their company's applications
CREATE POLICY "users_can_upload_application_documents"
  ON public.loan_application_documents FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM public.loan_applications
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loan_app_documents_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp update
CREATE TRIGGER update_loan_app_documents_timestamp
  BEFORE UPDATE ON public.loan_application_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_app_documents_timestamp();

COMMIT;
