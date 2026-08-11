-- Operations Cases (Workflow Ticketing System)
-- Replaces "SOP Tasks" naming to ensure unique identity.

CREATE TYPE ops_case_type AS ENUM ('DEVIATION', 'ESCALATION', 'PDD', 'GENERAL');
CREATE TYPE ops_case_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE ops_case_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

CREATE TABLE public.ops_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type ops_case_type NOT NULL DEFAULT 'GENERAL',
    priority ops_case_priority NOT NULL DEFAULT 'MEDIUM',
    status ops_case_status NOT NULL DEFAULT 'OPEN',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    branch_id TEXT, -- Logical branch assignment
    related_entity_type TEXT, -- e.g., 'LOAN', 'CLIENT'
    related_entity_id TEXT,   -- e.g., Fineract ID '1001'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ops_cases ENABLE ROW LEVEL SECURITY;

-- Admins can see all cases
CREATE POLICY "Admins can view all ops cases"
    ON public.ops_cases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('tenant_admin', 'platform_admin')
        )
    );

-- Users can see cases assigned to them
CREATE POLICY "Users can view assigned ops cases"
    ON public.ops_cases FOR SELECT
    USING (assigned_to = auth.uid());
