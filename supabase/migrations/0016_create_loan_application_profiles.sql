-- Create junction table linking profiles to loan applications
BEGIN;

CREATE TABLE IF NOT EXISTS public.loan_application_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles_master(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('primary_applicant', 'co_applicant', 'guarantor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_loan_profile_role UNIQUE(loan_application_id, profile_id, role)
);

-- Create indexes
CREATE INDEX idx_loan_app_profiles_loan_id ON public.loan_application_profiles(loan_application_id);
CREATE INDEX idx_loan_app_profiles_profile_id ON public.loan_application_profiles(profile_id);
CREATE INDEX idx_loan_app_profiles_role ON public.loan_application_profiles(role);

-- Enable RLS
ALTER TABLE public.loan_application_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view profiles linked to their company's applications
CREATE POLICY "users_can_view_loan_profiles"
  ON public.loan_application_profiles FOR SELECT
  USING (
    loan_application_id IN (
      SELECT id FROM public.loan_applications
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Users can create profile links for their company's applications
CREATE POLICY "users_can_create_loan_profiles"
  ON public.loan_application_profiles FOR INSERT
  WITH CHECK (
    loan_application_id IN (
      SELECT id FROM public.loan_applications
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
    AND profile_id IN (
      SELECT id FROM public.profiles_master
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Users can update profile links for their company's applications
CREATE POLICY "users_can_update_loan_profiles"
  ON public.loan_application_profiles FOR UPDATE
  USING (
    loan_application_id IN (
      SELECT id FROM public.loan_applications
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Users can delete profile links for their company's applications
CREATE POLICY "users_can_delete_loan_profiles"
  ON public.loan_application_profiles FOR DELETE
  USING (
    loan_application_id IN (
      SELECT id FROM public.loan_applications
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

COMMIT;
