-- 1. Create a table for user profiles
-- Uses the 8 unified roles from the LOS/LMS lifecycle
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'loan_officer' CHECK (role IN ('super_admin', 'tenant_admin', 'branch_manager', 'loan_officer', 'credit_officer', 'operations_officer', 'collections_officer', 'auditor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow super_admins to read all profiles
CREATE POLICY "Super admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 4. Create a trigger to automatically insert a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'loan_officer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- MANUAL ACTION REQUIRED:
-- After creating your first user in the Supabase Dashboard Authentication section,
-- you must manually run the following query to make them a super_admin:
-- 
-- UPDATE public.profiles 
-- SET role = 'super_admin' 
-- WHERE id = 'YOUR_USER_ID_HERE';
-- =====================================================================
