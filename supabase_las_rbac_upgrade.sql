-- =====================================================================
-- Finbyx LAS — RBAC Schema Upgrade Migration
-- Version: 2.0
-- Reference: RBAC SRS (finbyx_rbac_srs.md), Who Can Access.pdf
--
-- This script upgrades the existing profiles + companies tables
-- to support the full 10-role LAS system with strict multi-tenant
-- data isolation and Row Level Security.
--
-- PREREQUISITE: Run supabase_setup.sql and supabase_multitenant_upgrade.sql first.
-- =====================================================================

-- =====================================================================
-- STEP 1: Update Companies table — add slug and fineract_tenant_id
-- =====================================================================
DO $$
BEGIN
  -- Add slug column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN slug TEXT UNIQUE;
    RAISE NOTICE 'Added slug column to companies';
  END IF;

  -- Add fineract_tenant_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'fineract_tenant_id'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN fineract_tenant_id TEXT DEFAULT 'default';
    RAISE NOTICE 'Added fineract_tenant_id column to companies';
  END IF;
END $$;


-- =====================================================================
-- STEP 2: Update Profiles table — add full_name, email, is_active, updated_at
-- =====================================================================
DO $$
BEGIN
  -- Add full_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE 'Added full_name column to profiles';
  END IF;

  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
    RAISE NOTICE 'Added email column to profiles';
  END IF;

  -- Add is_active column if it doesn't exist (default true)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    RAISE NOTICE 'Added is_active column to profiles';
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    RAISE NOTICE 'Added updated_at column to profiles';
  END IF;
END $$;

-- Backfill email for any existing rows created before the email column
-- existed (or created by a trigger version that didn't set it). Without
-- this, any WHERE email = '...' match below silently matches zero rows.
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;


-- =====================================================================
-- STEP 3: Update Role CHECK constraint to the full 10-role LAS set
-- Safely drops the old constraint (whatever its name), migrates existing
-- data to valid roles, and adds the new constraint.
-- =====================================================================
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Find and drop any existing CHECK constraint on the role column
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%role%'
  LOOP
    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT ' || constraint_name;
    RAISE NOTICE 'Dropped old role constraint: %', constraint_name;
  END LOOP;
END $$;

-- Migrate existing roles: ONLY lawdocs-finbyx@gmail.com is platform super_admin
UPDATE public.profiles SET role = 'tenant_admin' WHERE role = 'platform_admin';
UPDATE public.profiles SET role = 'super_admin' WHERE email = 'lawdocs-finbyx@gmail.com';
UPDATE public.profiles SET role = 'credit_manager' WHERE role = 'branch_manager';
UPDATE public.profiles SET role = 'collections_officer' WHERE role = 'collections_agent';
UPDATE public.profiles SET role = 'loan_officer' WHERE role NOT IN (
  'super_admin', 'tenant_admin', 'loan_officer', 'credit_manager', 
  'operations_officer', 'collections_officer', 'recovery_officer', 
  'finance_officer', 'compliance_officer', 'auditor'
);

-- Add the new 10-role CHECK constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_las_role_check CHECK (
  role IN (
    'super_admin',
    'tenant_admin',
    'loan_officer',
    'credit_manager',
    'operations_officer',
    'collections_officer',
    'recovery_officer',
    'finance_officer',
    'compliance_officer',
    'auditor'
  )
);


-- =====================================================================
-- STEP 4: Update handle_new_user trigger
-- Reads role, company_id, full_name from raw_user_meta_data.
-- Defaults to 'loan_officer' if no role is specified.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, company_id, full_name, email, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'loan_officer'),
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================
-- STEP 5: Create updated_at auto-update trigger
-- Automatically sets updated_at whenever a profile row is modified.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop if exists first to avoid conflict, then create
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =====================================================================
-- STEP 6: Drop ALL existing RLS policies dynamically and recreate them
-- Ensures 100% idempotency when re-running this migration script.
-- =====================================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Drop all existing policies on public.profiles
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;

  -- Drop all existing policies on public.companies
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.companies', pol.policyname);
  END LOOP;
END $$;


-- =====================================================================
-- STEP 7: Security Definer Helper Functions (Bypasses RLS Recursion)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_tenant_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- =====================================================================
-- STEP 8: Create new RLS policies — Profiles table
-- =====================================================================

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Super Admins have unrestricted access to all profiles
CREATE POLICY "super_admins_full_profile_access"
  ON public.profiles
  FOR ALL
  USING (public.is_super_admin());

-- Policy 2: Users can view their own profile (always allowed)
CREATE POLICY "users_view_own_profile"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- Policy 3: Users can view profiles within their own company
CREATE POLICY "users_view_company_profiles"
  ON public.profiles
  FOR SELECT
  USING (company_id IS NOT NULL AND company_id = public.get_auth_company_id());

-- Policy 4: Tenant Admins can insert/update/delete profiles in their company
CREATE POLICY "tenant_admins_manage_company_profiles"
  ON public.profiles
  FOR ALL
  USING (
    company_id IS NOT NULL 
    AND company_id = public.get_auth_company_id() 
    AND public.is_tenant_admin()
  );


-- =====================================================================
-- STEP 9: Create new RLS policies — Companies table
-- =====================================================================

-- Ensure RLS is enabled
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Policy 1: Super Admins have full control over all companies
CREATE POLICY "super_admins_full_company_access"
  ON public.companies
  FOR ALL
  USING (public.is_super_admin());

-- Policy 2: Users can only READ their own company details
CREATE POLICY "users_view_own_company"
  ON public.companies
  FOR SELECT
  USING (id = public.get_auth_company_id());

-- Policy 3: Tenant Admins can update their own company (e.g., name, settings)
CREATE POLICY "tenant_admins_update_own_company"
  ON public.companies
  FOR UPDATE
  USING (
    id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tenant_admin'
    )
  );


-- =====================================================================
-- VERIFICATION: Print confirmation
-- =====================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Finbyx LAS RBAC Migration completed successfully.';
  RAISE NOTICE '10-role system active: super_admin, tenant_admin, loan_officer, credit_manager, operations_officer, collections_officer, recovery_officer, finance_officer, compliance_officer, auditor';
END $$;


-- =====================================================================
-- MANUAL ACTION REQUIRED:
-- After running this script, update your existing super_admin user:
--
-- UPDATE public.profiles
-- SET role = 'super_admin'
-- WHERE id = 'YOUR_USER_ID_HERE';
--
-- To find your user ID:
-- SELECT id, email FROM auth.users;
-- =====================================================================
