-- Migration: Add Fineract integration columns to profiles
-- Run this in your Supabase SQL Editor

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS office_id text,
ADD COLUMN IF NOT EXISTS fineract_staff_id text;

-- Add a comment to the columns
COMMENT ON COLUMN public.profiles.office_id IS 'Maps to Fineract officeId for branch routing';
COMMENT ON COLUMN public.profiles.fineract_staff_id IS 'Maps to Fineract staffId for assignment and maker-checker tracking';
