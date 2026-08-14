-- Setup RGSL Group company and link user
BEGIN;

-- Create RGSL Group company if it doesn't exist
INSERT INTO public.companies (name)
SELECT 'RGSL Group'
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE name = 'RGSL Group');

-- Update user profile with company_id
UPDATE public.profiles
SET company_id = (SELECT id FROM public.companies WHERE name = 'RGSL Group' LIMIT 1)
WHERE email = 'yash.jangid@rgslgroup.com';

COMMIT;
