-- Create profiles_master table for storing individual and corporate profiles
BEGIN;

CREATE TABLE IF NOT EXISTS public.profiles_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  pan_number VARCHAR(50) NOT NULL,
  profile_type VARCHAR(20) NOT NULL CHECK (profile_type IN ('individual', 'corporate')),
  status VARCHAR(20) DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'complete')),

  -- Individual Profile Data
  individual_name VARCHAR(255),
  father_husband_name VARCHAR(255),
  dob DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(20),
  qualification VARCHAR(50),
  occupation VARCHAR(50),
  aadhaar VARCHAR(50),
  passport VARCHAR(50),
  mobile VARCHAR(20),
  email VARCHAR(255),
  current_address JSONB,
  permanent_address JSONB,

  -- Corporate Profile Data
  entity_name VARCHAR(255),
  cin_llpin VARCHAR(50),
  dol DATE,
  company_type VARCHAR(50),
  gstin VARCHAR(50),
  registered_address JSONB,
  contact_no VARCHAR(20),
  contact_email VARCHAR(255),

  -- KYC & Documents
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified')),
  kyc_documents JSONB,

  -- Audit
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_company_pan UNIQUE(company_id, pan_number)
);

-- Create indexes
CREATE INDEX idx_profiles_pan ON public.profiles_master(pan_number);
CREATE INDEX idx_profiles_company_pan ON public.profiles_master(company_id, pan_number);
CREATE INDEX idx_profiles_company ON public.profiles_master(company_id);
CREATE INDEX idx_profiles_kyc_status ON public.profiles_master(kyc_status);

-- Enable RLS
ALTER TABLE public.profiles_master ENABLE ROW LEVEL SECURITY;

-- Users can view profiles from their company
CREATE POLICY "users_can_view_company_profiles"
  ON public.profiles_master FOR SELECT
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Users can create profiles for their company
CREATE POLICY "users_can_create_company_profiles"
  ON public.profiles_master FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

-- Users can update profiles from their company
CREATE POLICY "users_can_update_company_profiles"
  ON public.profiles_master FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_profiles_master_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_master_timestamp
  BEFORE UPDATE ON public.profiles_master
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_master_timestamp();

COMMIT;
