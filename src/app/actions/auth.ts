"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}

export async function onboardUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string || "loan_officer";
  const companyId = formData.get("company_id") as string;
  const fullName = formData.get("full_name") as string || "";
  
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // SECURITY: Only super_admin and tenant_admin can create new users
  const { requireRole } = await import("@/lib/supabase/rbac");
  try {
    await requireRole(["super_admin", "tenant_admin"]);
  } catch {
    return { error: "You do not have permission to create users." };
  }

  // We use the admin client to bypass RLS and create a user directly
  const supabaseAdmin = await createAdminClient();

  // Create the user in Auth with role + company_id as metadata
  // The handle_new_user trigger reads these from raw_user_meta_data
  // and inserts them into the profiles table automatically.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Auto-confirm email so they can log in immediately
    user_metadata: {
      role: role,
      company_id: companyId,
      full_name: fullName,
    },
  });

  if (authError) {
    return { error: authError.message };
  }
  
  revalidatePath("/dashboard/settings/team");
  return { success: `Successfully created user: ${email} with role: ${role}` };
}

