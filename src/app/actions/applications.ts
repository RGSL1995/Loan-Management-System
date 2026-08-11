"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/rbac";
import { lasProductSchema } from "@/lib/schemas/products/las";
import { lapProductSchema } from "@/lib/schemas/products/lap";
import { sclProductSchema } from "@/lib/schemas/products/scl";

// Union type for product types at the server action level
type ProductType = "LAS" | "LAP" | "SCL";

// Core data schema — fields shared across ALL loan product applications
const coreApplicationSchema = z.object({
  co_applicant: z.any().optional(),
  references: z.array(z.any()).optional(),
  declaration: z.any().optional(),
  bank_account: z.any().optional(),
  documents: z.array(z.any()).optional(),
});

// Helper to validate product_data using the correct schema based on product_type
function validateProductData(productType: ProductType, data: unknown) {
  switch (productType) {
    case "LAS": return lasProductSchema.safeParse(data);
    case "LAP": return lapProductSchema.safeParse(data);
    case "SCL": return sclProductSchema.safeParse(data);
  }
}

/**
 * Creates a new loan application in Supabase, linked to a client.
 * Validates product_data against the correct product-specific Zod schema.
 */
export async function createApplication(
  clientId: string,
  productType: ProductType,
  coreData: unknown,
  productData: unknown
) {
  const user = await requireRole(["loan_officer", "tenant_admin", "super_admin"]);
  const supabase = await createSupabaseClient();

  // 1. Validate core data
  const coreValidation = coreApplicationSchema.safeParse(coreData);
  if (!coreValidation.success) {
    return { error: "Core data validation failed", details: coreValidation.error.format() };
  }

  // 2. Validate product-specific data (key to the flexible architecture)
  const productValidation = validateProductData(productType, productData);
  if (!productValidation.success) {
    return { error: `${productType} product data validation failed`, details: productValidation.error.format() };
  }

  // 3. Insert into Supabase
  const { data, error } = await supabase.from("loan_applications_v2").insert({
    company_id: user.companyId,
    client_id: clientId,
    product_type: productType,
    core_data: coreValidation.data,
    product_data: productValidation.data,
    created_by: user.userId,
    status: "draft",
  }).select("id, application_number, status").single();

  if (error) {
    console.error("Failed to create application:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/applications");
  return { success: true, data };
}

/**
 * Fetch all applications for a given client (cross-role, filtered by company via RLS).
 */
export async function getApplicationsByClient(clientId: string) {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("loan_applications_v2")
    .select(`
      id,
      application_number,
      product_type,
      status,
      created_at,
      updated_at,
      submitted_at,
      assigned_to,
      client_id
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

/**
 * Fetch all applications for a company — used by all role dashboards.
 * RLS on the table ensures tenants are always isolated.
 * Optional filters allow role-specific views without writing separate queries.
 */
export async function getApplicationsByCompany(filters?: {
  status?: string;
  productType?: ProductType;
  assignedTo?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("loan_applications_v2")
    .select(`
      id,
      application_number,
      product_type,
      status,
      created_at,
      submitted_at,
      assigned_to,
      client_id,
      clients (
        id,
        full_name,
        pan,
        mobile,
        kyc_status
      )
    `)
    .order("created_at", { ascending: false });

  // Apply optional filters for role-specific dashboard views
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.productType) query = query.eq("product_type", filters.productType);
  if (filters?.assignedTo) query = query.eq("assigned_to", filters.assignedTo);
  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.range(filters.offset, (filters.offset) + (filters.limit || 20) - 1);

  const { data, error } = await query;
  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

/**
 * Update application status with RBAC enforcement.
 * Only certain roles can transition to certain statuses.
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: "submitted" | "under_review" | "credit_approved" | "approved_with_conditions" | "rejected" | "disbursed"
) {
  // Status transition RBAC rules
  const staffRoles = ["loan_officer", "credit_manager", "tenant_admin", "super_admin"];
  const user = await requireRole(staffRoles as any);

  const supabase = await createSupabaseClient();

  // Credit-specific statuses require at least credit_manager role
  const creditOnlyStatuses = ["credit_approved", "approved_with_conditions", "rejected"];
  if (creditOnlyStatuses.includes(newStatus) && user.role === "loan_officer") {
    return { error: "Loan officers cannot set credit decision statuses" };
  }

  const updatePayload: Record<string, unknown> = { status: newStatus };
  if (newStatus === "submitted") updatePayload.submitted_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("loan_applications_v2")
    .update(updatePayload)
    .eq("id", applicationId)
    .select("id, application_number, status")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/applications");
  return { success: true, data };
}

/**
 * Fetch a single application with full details (core_data + product_data).
 * Used on the application detail page by all roles.
 */
export async function getApplicationById(applicationId: string) {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("loan_applications_v2")
    .select(`
      *,
      clients (*)
    `)
    .eq("id", applicationId)
    .single();

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}
