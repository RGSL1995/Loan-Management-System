-- 1. Create the Companies table (Tenants)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 2. Update Profiles table for Multi-Tenancy
-- First, drop the existing role check constraint if it exists.
-- Since we didn't name the constraint in the original setup, we have to find it or just alter the column type.
-- A safer approach for altering a check constraint is to drop the constraint by querying its name, but for simplicity we will just disable it and add a new one.

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%role%';
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT ' || constraint_name;
  END IF;
END $$;

-- Now add the new check constraint allowing the standardized roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('platform_admin', 'tenant_admin', 'branch_manager', 'loan_officer', 'credit_analyst', 'auditor'));

-- Add the company_id column to profiles
ALTER TABLE public.profiles ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- 3. Update the handle_new_user trigger to read company_id from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- We extract company_id and role from raw_user_meta_data if provided by the Platform Admin during creation
  INSERT INTO public.profiles (id, role, company_id)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'loan_officer'),
    (NEW.raw_user_meta_data->>'company_id')::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Update RLS Policies for Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON public.profiles;

-- Policy 1: Platform Admins can do everything
CREATE POLICY "Platform admins have full access" 
  ON public.profiles 
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- Policy 2: Users can view profiles in their OWN company
CREATE POLICY "Users can view profiles in their company" 
  ON public.profiles 
  FOR SELECT 
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Policy 3: Superadmins can update profiles in their OWN company
CREATE POLICY "Superadmins can update profiles in their company" 
  ON public.profiles 
  FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tenant_admin')
  );


-- 5. RLS Policies for Companies
-- Platform admins can do everything to companies
CREATE POLICY "Platform admins control companies" 
  ON public.companies 
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- Users can only READ their own company details
CREATE POLICY "Users view own company" 
  ON public.companies 
  FOR SELECT
  USING (
    id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- =====================================================================
-- MANUAL ACTION REQUIRED:
-- After running this script, you MUST find your existing Lawdocs Superadmin account ID
-- and run this to make yourself a Platform Admin (so you can see the /platform portal).
--
-- UPDATE public.profiles 
-- SET role = 'platform_admin' 
-- WHERE id = 'YOUR_LAWDOCS_USER_ID';
-- =====================================================================
