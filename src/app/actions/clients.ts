"use server";

import { z } from "zod";
import { requireRole } from "@/lib/supabase/rbac";
import { revalidatePath } from "next/cache";
import { clientFormSchema, type ClientFormValues } from "@/lib/schemas/clients";
import { listFineractClients, createFineractClient } from "@/lib/fineract/proxy";
import { createClient as createSupabaseClient, createAdminClient } from "@/lib/supabase/server";
import { generateSystematicPassword } from "@/app/actions/team";
import { sendCredentialEmail } from "@/lib/email";

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE-NATIVE CLIENT FUNCTIONS
// These are the primary CRUD operations for the new `clients` Supabase table.
// Fineract functions below remain for backward compatibility and eventual sync.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a client directly in the Supabase `clients` table.
 * This is the new primary client creation flow (replaces Fineract mock).
 */
export async function createClientInSupabase(data: ClientFormValues) {
  const user = await requireRole(["loan_officer", "tenant_admin", "super_admin"]);

  // Validate incoming data against the updated schema
  const parsed = clientFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", details: parsed.error.format(), data: null };
  }

  const supabase = await createSupabaseClient();

  const { data: newClient, error } = await supabase
    .from("clients")
    .insert({
      company_id: user.companyId,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name ?? null,
      full_name: [parsed.data.first_name, parsed.data.last_name].filter(Boolean).join(" "),
      dob: parsed.data.dob,
      gender: parsed.data.gender,
      mobile: parsed.data.mobile,
      email: parsed.data.email ?? null,
      pan: parsed.data.pan,
      aadhaar_last4: parsed.data.aadhaar.slice(-4), // Store only last 4 digits
      address_json: parsed.data.address_json ?? {},
      office_id: parsed.data.office_id,
      dpdp_consent: parsed.data.dpdp_consent,
      dpdp_consent_at: parsed.data.dpdp_consent ? new Date().toISOString() : null,
      kyc_status: "pending",
      created_by: user.userId,
    })
    .select("id, full_name, kyc_status, created_at")
    .single();

  if (error) {
    console.error("Failed to create client in Supabase:", error);
    return { success: false, error: error.message, data: null };
  }

  revalidatePath("/dashboard/clients");
  return { success: true, data: newClient, error: null };
}

/**
 * Fetches all clients for the current user's company from the `clients` table.
 * RLS on the table automatically restricts to the user's company.
 */
export async function getClientsFromSupabase(options?: {
  search?: string;
  limit?: number;
  offset?: number;
  kyc_status?: string;
}) {
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("clients")
    .select("id, full_name, pan, mobile, email, kyc_status, pan_verified, digilocker_verified, created_at, office_id")
    .order("created_at", { ascending: false });

  // Optional filters
  if (options?.search) {
    query = query.or(
      `full_name.ilike.%${options.search}%,pan.ilike.%${options.search}%,mobile.ilike.%${options.search}%`
    );
  }
  if (options?.kyc_status) query = query.eq("kyc_status", options.kyc_status);
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, (options.offset) + (options.limit || 20) - 1);

  const { data, error } = await query;
  if (error) return { error: error.message, data: null };
  return { data, error: null };
}



export async function submitClientForm(data: ClientFormValues) {
  // Only loan officers (Makers) can create clients
  await requireRole(['tenant_admin', 'loan_officer']);

  // 2. Validate incoming data
  const parsed = clientFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.format() };
  }

  // 3. Fineract API Call
  const tenantId = await getTenantId();
  const result = await createFineractClient(parsed.data, { tenantId });
  
  if (result.error) {
    return { error: result.error, status: result.status };
  }

  // 4. Success
  revalidatePath("/dashboard/clients");
  return { success: true, clientId: (result.data as any)?.clientId || "C-" + Math.floor(Math.random() * 10000) };
}

async function getTenantId(): Promise<string | undefined> {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      
      return profile?.company_id;
    }
  } catch (error) {
    console.error("Failed to get tenant ID:", error);
  }
  return undefined;
}

export async function getClients(limit?: number, offset?: number) {
  try {
    const tenantId = await getTenantId();
    const result = await listFineractClients({ tenantId, limit, offset });
    
    if (result.error) {
      return { error: result.error, data: null };
    }
    
    return { data: result.data, error: null };
  } catch (error) {
    return { 
      error: { 
        defaultUserMessage: error instanceof Error ? error.message : "Failed to fetch clients" 
      }, 
      data: null 
    };
  }
}

export async function createClient(clientData: Record<string, unknown>) {
  try {
    await requireRole(['tenant_admin', 'loan_officer']);
    const tenantId = await getTenantId();
    const result = await createFineractClient(clientData, { tenantId });

    if (result.error) {
      return { error: result.error, data: null };
    }

    return { data: result.data, error: null };
  } catch (error) {
    return {
      error: {
        defaultUserMessage: error instanceof Error ? error.message : "Failed to create client"
      },
      data: null
    };
  }
}

/**
 * Grants a client self-service portal access: creates a `borrower`
 * Supabase auth user linked to the given Fineract clientId, scoped to
 * the requesting staff member's company. Only Loan Officers and Tenant
 * Admins can grant portal access.
 */
export async function provisionBorrowerAccess(clientId: number, fullName: string, email: string) {
  const currentUser = await requireRole(['tenant_admin', 'loan_officer']);

  const parsed = z.object({
    clientId: z.number().int().positive(),
    fullName: z.string().min(2),
    email: z.string().email(),
  }).safeParse({ clientId, fullName, email });

  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.format() };
  }

  const adminSupabase = await createAdminClient();
  const password = await generateSystematicPassword(fullName);

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'borrower',
      full_name: fullName,
      company_id: currentUser.companyId,
      client_id: clientId,
    },
  });

  if (authError || !authData?.user) {
    return { error: authError?.message || "Failed to create borrower portal account." };
  }

  const { error: profileError } = await adminSupabase.from('profiles').upsert({
    id: authData.user.id,
    role: 'borrower',
    full_name: fullName,
    email,
    company_id: currentUser.companyId,
    client_id: clientId,
    is_active: true,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    console.warn("Borrower profile upsert notice:", profileError.message);
  }

  const emailResult = await sendCredentialEmail({
    recipientEmail: email,
    userEmail: email,
    fullName,
    role: 'borrower',
    password,
  });

  return {
    success: true,
    message: `Portal access granted for ${email}. Credentials ${emailResult.success ? "emailed" : "generated (email delivery failed)"}.`,
  };
}
