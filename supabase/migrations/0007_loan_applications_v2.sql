-- Migration: 0007_loan_applications_v2.sql
-- Replaces the rigid 0004 general loan_applications schema with a flexible,
-- product-driven architecture. Uses JSONB for product_data to allow form fields
-- to evolve freely during development without new migrations.

-- Step 1: Create the product type enum for strict type safety at the DB level
DO $$ BEGIN
    CREATE TYPE loan_product_type AS ENUM ('LAS', 'LAP', 'SCL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Create application status enum
DO $$ BEGIN
    CREATE TYPE loan_application_status AS ENUM (
        'draft',
        'submitted',
        'under_review',
        'credit_approved',
        'approved_with_conditions',
        'rejected',
        'disbursed'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Step 3: Create the new flexible loan_applications table
-- NOTE: This uses a v2 name to avoid conflict with the existing 0004 table.
-- During production migration, the old table will be renamed/dropped separately.
CREATE TABLE IF NOT EXISTS public.loan_applications_v2 (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id              UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

    -- Link to Supabase clients table (source of truth for borrower identity)
    client_id               UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,

    -- Product type — drives which Zod schema is used for validation
    product_type            loan_product_type NOT NULL,

    -- Application lifecycle status
    status                  loan_application_status NOT NULL DEFAULT 'draft',

    -- Auto-generated application number, e.g., LAS-202507-001001
    application_number      VARCHAR(50) UNIQUE,

    -- Fields common to ALL products: co-applicant, references, declaration, DPDP
    -- Validated on the TypeScript/Zod layer against a shared core schema
    core_data               JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Product-specific fields ONLY.
    -- LAS: securities, LTV%, pledge details
    -- LAP: property, valuation, title report, mortgage type
    -- SCL: credit line limit, revolving terms, utilization rules
    -- Validated on the TypeScript/Zod layer against product-specific schemas.
    -- Add/remove fields here during development WITHOUT writing new migrations.
    product_data            JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Staff assignments
    assigned_to             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by              UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Fineract Integration (nullable until production sync)
    fineract_loan_id        BIGINT UNIQUE,

    -- Timestamps
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at            TIMESTAMP WITH TIME ZONE
);

-- Indexes for all common query patterns across roles
CREATE INDEX IF NOT EXISTS idx_loan_apps_v2_company_id ON public.loan_applications_v2(company_id);
CREATE INDEX IF NOT EXISTS idx_loan_apps_v2_client_id ON public.loan_applications_v2(client_id);
CREATE INDEX IF NOT EXISTS idx_loan_apps_v2_product_type ON public.loan_applications_v2(product_type);
CREATE INDEX IF NOT EXISTS idx_loan_apps_v2_status ON public.loan_applications_v2(status);
CREATE INDEX IF NOT EXISTS idx_loan_apps_v2_assigned_to ON public.loan_applications_v2(assigned_to);
CREATE INDEX IF NOT EXISTS idx_loan_apps_v2_created_at ON public.loan_applications_v2(created_at DESC);

-- Enable RLS
ALTER TABLE public.loan_applications_v2 ENABLE ROW LEVEL SECURITY;

-- RLS: All staff in the company can view applications
CREATE POLICY "staff_can_view_company_applications"
    ON public.loan_applications_v2 FOR SELECT
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    );

-- RLS: Borrowers can ONLY view their own application (linked via client_id)
CREATE POLICY "borrower_can_view_own_application"
    ON public.loan_applications_v2 FOR SELECT
    USING (
        client_id IN (
            SELECT id FROM public.clients
            WHERE fineract_client_id = (
                SELECT client_id FROM public.profiles WHERE id = auth.uid()
            )
        )
    );

-- RLS: Loan officers and admins can create applications
CREATE POLICY "staff_can_create_applications"
    ON public.loan_applications_v2 FOR INSERT
    WITH CHECK (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('loan_officer', 'tenant_admin', 'super_admin')
    );

-- RLS: Staff can update applications in their company
CREATE POLICY "staff_can_update_applications"
    ON public.loan_applications_v2 FOR UPDATE
    USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('loan_officer', 'credit_manager', 'tenant_admin', 'super_admin')
    );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_loan_applications_v2_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER loan_applications_v2_updated_at_trigger
    BEFORE UPDATE ON public.loan_applications_v2
    FOR EACH ROW EXECUTE FUNCTION public.update_loan_applications_v2_updated_at();

-- Auto-generate application number based on product_type prefix
CREATE SEQUENCE IF NOT EXISTS loan_application_v2_seq START 1001;

CREATE OR REPLACE FUNCTION public.generate_application_number_v2()
RETURNS TRIGGER AS $$
BEGIN
    NEW.application_number := 
        NEW.product_type || '-' || 
        TO_CHAR(NOW(), 'YYYYMM') || '-' || 
        LPAD(NEXTVAL('loan_application_v2_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_app_number_v2
    BEFORE INSERT ON public.loan_applications_v2
    FOR EACH ROW
    WHEN (NEW.application_number IS NULL)
    EXECUTE FUNCTION public.generate_application_number_v2();
