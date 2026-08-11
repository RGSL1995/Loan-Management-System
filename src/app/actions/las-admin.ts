"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/rbac";
import {
  CreateLASProductFormSchema,
  UpdateLASProductFormSchema,
  UpdateLASSettingsFormSchema,
  type LASProduct,
  type LASSettings,
  type LASApprover,
  type CreateLASProductForm,
  type UpdateLASProductForm,
  type UpdateLASSettingsForm,
} from "@/lib/schemas/las";

// Helper: Get current user's company_id
async function getUserCompanyId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (error || !profile?.company_id) {
    throw new Error("Company not found");
  }

  return profile.company_id;
}

// Helper: Check if user is tenant admin
async function ensureAdminRole(): Promise<string> {
  const user = await requireRole(['tenant_admin']);
  if (!user.companyId) throw new Error("Company not found");
  return user.companyId;
}

// ============================================
// LAS PRODUCTS OPERATIONS
// ============================================

export async function getLASProducts() {
  try {
    const companyId = await getUserCompanyId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("las_products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data: data as LASProduct[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch products",
    };
  }
}

export async function createLASProduct(
  formData: CreateLASProductForm
) {
  try {
    const companyId = await ensureAdminRole();
    const supabase = await createClient();

    // Validate input
    const validated = CreateLASProductFormSchema.parse(formData);

    const { data, error } = await supabase
      .from("las_products")
      .insert({
        company_id: companyId,
        ...validated,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as LASProduct, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to create product",
    };
  }
}

export async function updateLASProduct(
  productId: string,
  formData: UpdateLASProductForm
) {
  try {
    const companyId = await ensureAdminRole();
    const supabase = await createClient();

    // Validate input
    const validated = UpdateLASProductFormSchema.parse(formData);

    const { data, error } = await supabase
      .from("las_products")
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("company_id", companyId) // Ensure isolation
      .select()
      .single();

    if (error) throw error;

    return { data: data as LASProduct, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to update product",
    };
  }
}

export async function deleteLASProduct(productId: string) {
  try {
    const companyId = await ensureAdminRole();
    const supabase = await createClient();

    const { error } = await supabase
      .from("las_products")
      .delete()
      .eq("id", productId)
      .eq("company_id", companyId); // Ensure isolation

    if (error) throw error;

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete product",
    };
  }
}

// ============================================
// LAS SETTINGS OPERATIONS
// ============================================

export async function getLASSettings() {
  try {
    const companyId = await getUserCompanyId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("las_settings")
      .select("*")
      .eq("company_id", companyId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows

    return { data: data as LASSettings | null, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch settings",
    };
  }
}

export async function updateLASSettings(
  formData: UpdateLASSettingsForm
) {
  try {
    const companyId = await ensureAdminRole();
    const supabase = await createClient();

    // Validate input
    const validated = UpdateLASSettingsFormSchema.parse(formData);

    // First try to update existing record
    const { data: existingSettings } = await supabase
      .from("las_settings")
      .select("id")
      .eq("company_id", companyId)
      .single();

    let data;
    let error;

    if (existingSettings) {
      // Update
      const result = await supabase
        .from("las_settings")
        .update({
          ...validated,
          updated_at: new Date().toISOString(),
        })
        .eq("company_id", companyId)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Insert
      const result = await supabase
        .from("las_settings")
        .insert({
          company_id: companyId,
          ...validated,
        })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    return { data: data as LASSettings, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to update settings",
    };
  }
}

// ============================================
// LAS APPROVERS OPERATIONS
// ============================================

export async function getLASApprovers() {
  try {
    const companyId = await getUserCompanyId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("las_approvers")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data: data as LASApprover[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch approvers",
    };
  }
}

export async function addLASApprover(approverData: {
  role: string;
  user_id: string;
  authority_limit: number;
  can_override: boolean;
}) {
  try {
    const companyId = await ensureAdminRole();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("las_approvers")
      .insert({
        company_id: companyId,
        ...approverData,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as LASApprover, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to add approver",
    };
  }
}

export async function updateLASApprover(
  approverId: string,
  approverData: {
    authority_limit: number;
    can_override: boolean;
  }
) {
  try {
    const companyId = await ensureAdminRole();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("las_approvers")
      .update(approverData)
      .eq("id", approverId)
      .eq("company_id", companyId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as LASApprover, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to update approver",
    };
  }
}

export async function removeLASApprover(approverId: string) {
  try {
    const companyId = await ensureAdminRole();
    const supabase = await createClient();

    const { error } = await supabase
      .from("las_approvers")
      .delete()
      .eq("id", approverId)
      .eq("company_id", companyId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to remove approver",
    };
  }
}
