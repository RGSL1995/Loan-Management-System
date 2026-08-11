"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireRole } from "@/lib/supabase/rbac"
import { sendCredentialEmail } from "@/lib/email"
import { generateSystematicPassword } from "@/app/actions/team"

const CreatePlatformAdminSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
})

const OnboardCompanySchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters."),
  adminEmail: z.string().email("Invalid email address."),
  adminPassword: z.string().min(8, "Password must be at least 8 characters."),
})

export async function onboardCompany(prevState: any, formData: FormData) {
  try {
    await requireRole(['super_admin', 'platform_admin'])

    const validatedFields = OnboardCompanySchema.safeParse({
      companyName: formData.get("companyName"),
      adminEmail: formData.get("adminEmail"),
      adminPassword: formData.get("adminPassword"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Please fill in all fields correctly."
      }
    }

    const { companyName, adminEmail, adminPassword } = validatedFields.data
    const supabase = createAdminClient()

    // 1. Create the Company Tenant
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({ name: companyName })
      .select('id')
      .single()

    if (companyError || !newCompany) {
      console.error("Error creating company:", companyError)
      return { success: false, message: "Failed to create the company in the database." }
    }

    // 2. Create the Tenant Admin User via Admin Auth API
    const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm the email so they can log in immediately
      user_metadata: {
        role: 'tenant_admin',
        company_id: newCompany.id,
      }
    })

    if (authError) {
      console.error("Error creating admin user:", authError)
      // Cleanup the orphaned company if user creation fails
      await supabase.from('companies').delete().eq('id', newCompany.id)
      return { success: false, message: authError.message }
    }

    revalidatePath("/platform/companies")
    return { success: true, message: "Company and Tenant Admin account created successfully!" }

  } catch (error) {
    console.error("Onboarding error:", error)
    const message = error instanceof Error && error.message.startsWith("Forbidden")
      ? error.message
      : "An unexpected error occurred during onboarding."
    return { success: false, message }
  }
}

/**
 * Lists platform-level staff (super_admin + platform_admin), i.e. profiles
 * with no company_id. Gated to super_admin/platform_admin only.
 */
export async function getPlatformUsers() {
  try {
    await requireRole(['super_admin', 'platform_admin'])
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, is_active, updated_at')
      .is('company_id', null)
      .in('role', ['super_admin', 'platform_admin'])

    if (error) {
      return { error: error.message, data: [] }
    }
    return { data: data || [], error: null }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to fetch platform users.", data: [] }
  }
}

/**
 * Creates a new platform_admin user (no company_id). Only super_admin can
 * create platform admins — platform admins cannot create more of themselves.
 */
export async function createPlatformAdmin(prevState: any, formData: FormData) {
  try {
    await requireRole(['super_admin'])

    const validatedFields = CreatePlatformAdminSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Please fill in all fields correctly."
      }
    }

    const { fullName, email } = validatedFields.data
    const supabase = createAdminClient()
    const password = await generateSystematicPassword(fullName)

    const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'platform_admin',
        full_name: fullName,
      }
    })

    if (authError || !newAuthUser?.user) {
      console.error("Error creating platform admin:", authError)
      return { success: false, message: authError?.message || "Failed to create platform admin user." }
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: newAuthUser.user.id,
      role: 'platform_admin',
      full_name: fullName,
      email,
      company_id: null,
      is_active: true,
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.warn("Platform admin profile upsert notice:", profileError.message)
    }

    const emailResult = await sendCredentialEmail({
      recipientEmail: email,
      userEmail: email,
      fullName,
      role: 'platform_admin',
      password,
    })

    revalidatePath("/platform/platform-users")
    return {
      success: true,
      message: `Platform admin account created for ${email}. Credentials ${emailResult.success ? "emailed" : "generated (email delivery failed)"}.`,
    }
  } catch (error) {
    console.error("Create platform admin error:", error)
    const message = error instanceof Error && error.message.startsWith("Forbidden")
      ? error.message
      : "An unexpected error occurred while creating the platform admin."
    return { success: false, message }
  }
}
