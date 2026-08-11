-- Supabase Migration: 0003_unify_roles.sql
-- Goal: Unify the roles across the DB, Middleware, and UI to perfectly align with the new LOS/LMS workflow.

-- 1. Update existing mismatched roles in the table
UPDATE public.profiles SET role = 'super_admin' WHERE role = 'platform_admin';
UPDATE public.profiles SET role = 'super_admin' WHERE role = 'superadmin';
UPDATE public.profiles SET role = 'credit_officer' WHERE role = 'credit_analyst';
UPDATE public.profiles SET role = 'credit_officer' WHERE role = 'credit_manager';

-- 2. Drop the existing CHECK constraint on the role column
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. Add the new strict CHECK constraint mapping to our 8 allowed roles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
  'super_admin', 
  'tenant_admin', 
  'branch_manager', 
  'loan_officer', 
  'credit_officer', 
  'operations_officer', 
  'collections_officer', 
  'auditor'
));
