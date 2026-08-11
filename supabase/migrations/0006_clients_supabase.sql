-- Migration: 0006_clients_supabase.sql
-- Creates a Supabase-native clients table as the source of truth for borrower KYC.
-- Fineract sync is handled separately via fineract_client_id (populated post-production sync).

CREATE TABLE IF NOT EXISTS public.clients (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

    -- Core Identity
    full_name           VARCHAR(255) NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100),
    dob                 DATE,
    gender              VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other', 'Unknown')),

    -- Contact
    mobile              VARCHAR(15) NOT NULL,
    email               VARCHAR(255),

    -- Government IDs (store masked versions for display; raw handled by KYC layer)
    pan                 VARCHAR(10),  -- e.g., ABCDE1234F (full PAN for search; KYC logs store the rest)
    aadhaar_last4       VARCHAR(4),   -- ONLY last 4 digits per UIDAI compliance

    -- KYC Status
    kyc_status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (kyc_status IN ('pending', 'in_progress', 'verified', 'rejected')),
    pan_verified        BOOLEAN NOT NULL DEFAULT FALSE,
    digilocker_verified BOOLEAN NOT NULL DEFAULT FALSE,
    dpdp_consent        BOOLEAN NOT NULL DEFAULT FALSE,
    dpdp_consent_at     TIMESTAMP WITH TIME ZONE,

    -- Address (flexible JSONB to accommodate permanent vs current address)
    address_json        JSONB DEFAULT '{}'::jsonb,

    -- Office / Branch
    office_id           TEXT,

    -- Fineract Integration (nullable until production sync)
    fineract_client_id  BIGINT UNIQUE,

    -- Metadata
    created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_pan ON public.clients(pan);
CREATE INDEX IF NOT EXISTS idx_clients_mobile ON public.clients(mobile);
CREATE INDEX IF NOT EXISTS idx_clients_kyc_status ON public.clients(kyc_status);
CREATE INDEX IF NOT EXISTS idx_clients_fineract_id ON public.clients(fineract_client_id);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see clients belonging to their own company
CREATE POLICY "users_can_view_company_clients"
    ON public.clients FOR SELECT
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    );

-- Policy: Loan officers and admins can create clients
CREATE POLICY "staff_can_create_clients"
    ON public.clients FOR INSERT
    WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('loan_officer', 'tenant_admin', 'super_admin')
    );

-- Policy: Loan officers and admins can update client data
CREATE POLICY "staff_can_update_clients"
    ON public.clients FOR UPDATE
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('loan_officer', 'tenant_admin', 'super_admin')
    );

-- Auto-update updated_at on every change
CREATE OR REPLACE FUNCTION public.update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at_trigger
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_clients_updated_at();
