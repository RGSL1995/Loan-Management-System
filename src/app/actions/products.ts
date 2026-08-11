"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/rbac";
import {
  CreateProductFormSchema,
  UpdateProductFormSchema,
  type CreateProductForm,
  type UpdateProductForm,
  type Product,
  type ProductType,
  LASConfigSchema,
  GoldLoanConfigSchema,
  LAPConfigSchema,
  PersonalLoanConfigSchema,
} from "@/lib/schemas/products";

// ============================================
// HELPER: Get current user's company_id
// ============================================
async function getUserCompanyId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Profile fetch error:", error);
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!profile?.company_id) {
    console.error("No company_id in profile:", profile);
    throw new Error("Company not found in profile");
  }

  return profile.company_id;
}

// ============================================
// HELPER: Check admin role
// ============================================
async function ensureAdminRole(): Promise<string> {
  const user = await requireRole(['tenant_admin']);
  if (!user.companyId) throw new Error("Company not found");
  return user.companyId;
}

// ============================================
// HELPER: Validate config based on product_type
// ============================================
function validateProductConfig(productType: ProductType, config: any) {
  switch (productType) {
    case "las":
      return LASConfigSchema.parse(config);
    case "gold_loan":
      return GoldLoanConfigSchema.parse(config);
    case "lap":
      return LAPConfigSchema.parse(config);
    case "personal_loan":
      return PersonalLoanConfigSchema.parse(config);
    default:
      throw new Error(`Unknown product type: ${productType}`);
  }
}

// ============================================
// PRODUCTS OPERATIONS
// ============================================

export async function getProducts(productType?: ProductType) {
  try {
    const companyId = await getUserCompanyId();
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    // Filter by product type if specified
    if (productType) {
      query = query.eq("product_type", productType);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data as Product[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch products",
    };
  }
}

export async function getProductById(productId: string) {
  try {
    const companyId = await getUserCompanyId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("company_id", companyId)
      .single();

    if (error) throw error;

    return { data: data as Product, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Product not found",
    };
  }
}

export async function createProduct(formData: CreateProductForm) {
  try {
    const companyId = await ensureAdminRole();
    const supabase = await createClient();

    // Validate base fields
    const validated = CreateProductFormSchema.parse(formData);

    // Validate type-specific config
    const validatedConfig = validateProductConfig(
      validated.product_type,
      validated.config
    );

    const { data, error } = await supabase
      .from("products")
      .insert({
        company_id: companyId,
        name: validated.name,
        description: validated.description,
        product_type: validated.product_type,
        min_amount: validated.min_amount,
        max_amount: validated.max_amount,
        interest_rate_min: validated.interest_rate_min,
        interest_rate_max: validated.interest_rate_max,
        tenure_months: validated.tenure_months,
        processing_fee_percentage: validated.processing_fee_percentage,
        config: validatedConfig,
        status: validated.status,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as Product, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to create product",
    };
  }
}

export async function updateProduct(
  productId: string,
  formData: UpdateProductForm
) {
  try {
    const companyId = await ensureAdminRole();
    const supabase = await createClient();

    // Validate base fields
    const validated = UpdateProductFormSchema.parse(formData);

    // Validate type-specific config
    const validatedConfig = validateProductConfig(
      validated.product_type,
      validated.config
    );

    const { data, error } = await supabase
      .from("products")
      .update({
        name: validated.name,
        description: validated.description,
        product_type: validated.product_type,
        min_amount: validated.min_amount,
        max_amount: validated.max_amount,
        interest_rate_min: validated.interest_rate_min,
        interest_rate_max: validated.interest_rate_max,
        tenure_months: validated.tenure_months,
        processing_fee_percentage: validated.processing_fee_percentage,
        config: validatedConfig,
        status: validated.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("company_id", companyId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Product, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to update product",
    };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const companyId = await ensureAdminRole();
    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("company_id", companyId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete product",
    };
  }
}

export async function duplicateProduct(productId: string) {
  try {
    const companyId = await ensureAdminRole();
    const supabase = await createClient();

    // Fetch original product
    const { data: original, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("company_id", companyId)
      .single();

    if (fetchError || !original) throw new Error("Product not found");

    // Create copy with updated name
    const { data, error } = await supabase
      .from("products")
      .insert({
        company_id: companyId,
        name: `${original.name} (Copy)`,
        description: original.description,
        product_type: original.product_type,
        min_amount: original.min_amount,
        max_amount: original.max_amount,
        interest_rate_min: original.interest_rate_min,
        interest_rate_max: original.interest_rate_max,
        tenure_months: original.tenure_months,
        processing_fee_percentage: original.processing_fee_percentage,
        config: original.config,
        status: "INACTIVE", // Duplicate starts inactive
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as Product, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to duplicate product",
    };
  }
}
