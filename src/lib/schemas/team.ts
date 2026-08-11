import { z } from "zod";

// Must stay in sync with VALID_ROLES in src/lib/supabase/rbac.ts
// and the CHECK constraint in supabase_las_rbac_upgrade.sql
export const inviteSchema = z.object({
  email: z.string().email("Invalid user email address"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.enum([
    "tenant_admin",
    "loan_officer",
    "credit_manager",
    "operations_officer",
    "collections_officer",
    "recovery_officer",
    "finance_officer",
    "compliance_officer",
    "auditor",
  ]),
  deliveryEmail: z.string().email("Recipient email address is required"),
});

export type InviteValues = z.infer<typeof inviteSchema>;
