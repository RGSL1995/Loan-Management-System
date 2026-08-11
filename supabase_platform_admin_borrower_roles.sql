-- =====================================================================
-- Finbyx LAS — Platform Admin & Borrower Roles Migration
-- Version: 2.1 (follow-up to supabase_las_rbac_upgrade.sql)
-- Reference: RBAC SRS (RBAC.md), Who Can Access.pdf
--
-- Extends the 10-role LAS system with two roles from the original
-- "Who Can Access" spec that were previously scoped out:
--   - platform_admin: reduced-privilege platform-level staff (alongside super_admin)
--   - borrower: tenant-scoped self-service role for a client's own login
--
-- PREREQUISITE: Run supabase_las_rbac_upgrade.sql first.
-- =====================================================================

-- =====================================================================
-- STEP 1: Add client_id column to profiles (borrower -> Fineract client linkage)
-- =====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN client_id INTEGER;
    RAISE NOTICE 'Added client_id column to profiles';
  END IF;
END $$;

-- =====================================================================
-- STEP 2: Update Role CHECK constraint to include platform_admin + borrower
-- =====================================================================
DO $$
DECLARE
  constraint_name text;
BEGIN
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

ALTER TABLE public.profiles ADD CONSTRAINT profiles_las_role_check CHECK (
  role IN (
    'super_admin',
    'platform_admin',
    'tenant_admin',
    'loan_officer',
    'credit_manager',
    'operations_officer',
    'collections_officer',
    'recovery_officer',
    'finance_officer',
    'compliance_officer',
    'auditor',
    'borrower'
  )
);

-- =====================================================================
-- STEP 3: Security Definer Helper — is_platform_admin()
-- Mirrors is_super_admin() from supabase_las_rbac_upgrade.sql.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('platform_admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================================
-- STEP 4: Extend RLS policies — platform_admin gets super_admin-equivalent
-- READ access to profiles/companies. Destructive actions (deleting a
-- company, creating platform admins) stay gated at the server-action
-- layer via requireRole(['super_admin']) only — not via RLS — so they
-- are intentionally NOT granted here.
-- =====================================================================

DROP POLICY IF EXISTS "platform_admins_read_profiles" ON public.profiles;
CREATE POLICY "platform_admins_read_profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_platform_admin());

DROP POLICY IF EXISTS "platform_admins_read_companies" ON public.companies;
CREATE POLICY "platform_admins_read_companies"
  ON public.companies
  FOR SELECT
  USING (public.is_platform_admin());

-- =====================================================================
-- VERIFICATION
-- =====================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Finbyx platform_admin/borrower role migration completed successfully.';
  RAISE NOTICE '12-role system active: super_admin, platform_admin, tenant_admin, loan_officer, credit_manager, operations_officer, collections_officer, recovery_officer, finance_officer, compliance_officer, auditor, borrower';
END $$;
