-- Supabase Migration: 0005_kyc_logs.sql

-- Create the kyc_verification_logs table
CREATE TABLE IF NOT EXISTS public.kyc_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL, -- e.g., 'SUREPASS_PAN', 'SUREPASS_AADHAAR', 'SUREPASS_DIGILOCKER'
    status VARCHAR(50) NOT NULL, -- e.g., 'SUCCESS', 'FAILED', 'PENDING'
    request_payload JSONB, -- Omit PII, e.g., mask PAN or Aadhaar
    response_payload JSONB, -- Full response (mask PII before inserting if needed)
    reference_id VARCHAR(255), -- Vendor reference ID for tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.kyc_verification_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all logs in their company"
    ON public.kyc_verification_logs
    FOR SELECT
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('tenant_admin', 'super_admin')
    );

CREATE POLICY "System can insert logs"
    ON public.kyc_verification_logs
    FOR INSERT
    WITH CHECK (true); -- Usually restricted to service_role via backend
