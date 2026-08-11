-- Migration: Elevate all existing users to tenant_admin
-- Run this in your Supabase SQL Editor

UPDATE public.profiles
SET role = 'tenant_admin'
WHERE role = 'user' OR role IS NULL;
