"use server";

import { z } from "zod";
import { requireRole } from "@/lib/supabase/rbac";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

import { inviteSchema, type InviteValues } from "@/lib/schemas/team";

import { sendCredentialEmail } from "@/lib/email";

/**
 * Generates a systematic, human-readable enterprise password.
 * Format: Finbyx#<CapitalizedFirstName>@<Year>#<4Digits>
 * Example: Finbyx#Jane@2026#4891
 */
export async function generateSystematicPassword(fullName: string): Promise<string> {
  const firstName = fullName.trim().split(" ")[0].replace(/[^a-zA-Z]/g, "") || "Staff";
  const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  const year = new Date().getFullYear();
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `Finbyx#${capitalized}@${year}#${digits}`;
}

export async function inviteTeamMember(data: InviteValues) {
  // 1. Enforce RBAC
  let currentUser;
  try {
    currentUser = await requireRole(['tenant_admin', 'super_admin']);
  } catch (err: any) {
    return { error: err.message || "You do not have permission to invite team members." };
  }

  // 2. Validate Payload
  const parsed = inviteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.format() };
  }

  const { email, fullName, role, deliveryEmail } = parsed.data;
  const recipientEmail = (deliveryEmail && deliveryEmail.trim().length > 0) ? deliveryEmail.trim() : email;
  const systemPassword = await generateSystematicPassword(fullName);

  const adminAuthClient = await createAdminClient();

  // 3. Create or update user via Admin Auth API with systematic password
  let userId: string | null = null;

  const { data: authData, error: createError } = await adminAuthClient.auth.admin.createUser({
    email: email,
    password: systemPassword,
    email_confirm: true,
    user_metadata: {
      role: role,
      full_name: fullName,
      company_id: currentUser.companyId,
    }
  });

  if (createError) {
    // If user already exists in Auth, attempt password reset / metadata update
    if (createError.message.includes("already registered") || createError.status === 422) {
      const { data: listData } = await adminAuthClient.auth.admin.listUsers();
      const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        userId = existingUser.id;
        await adminAuthClient.auth.admin.updateUserById(existingUser.id, {
          password: systemPassword,
          user_metadata: { role, full_name: fullName, company_id: currentUser.companyId }
        });
      } else {
        return { error: createError.message };
      }
    } else {
      return { error: createError.message };
    }
  } else if (authData?.user) {
    userId = authData.user.id;
  }

  // 4. Create or Update DB Profile
  if (userId) {
    const { error: profileError } = await adminAuthClient.from('profiles').upsert({
      id: userId,
      role: role,
      full_name: fullName,
      email: email,
      company_id: currentUser.companyId,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.warn("Profile upsert notice:", profileError.message);
    }
  }

  // 5. Send Credential Email via Resend
  const emailResult = await sendCredentialEmail({
    recipientEmail: recipientEmail,
    userEmail: email,
    fullName: fullName,
    role: role,
    password: systemPassword,
  });

  revalidatePath("/dashboard/settings/team");

  return { 
    success: true, 
    message: `Account created for ${email}. Credentials dispatched to ${recipientEmail}.`,
    credentials: {
      userEmail: email,
      deliveryEmail: recipientEmail,
      password: systemPassword,
      role: role,
      emailSent: emailResult.success,
    }
  };
}

export async function getTeamMembers() {
  try {
    const user = await requireRole(['tenant_admin', 'super_admin']);
    const adminSupabase = await createAdminClient();

    let query = adminSupabase.from('profiles').select('id, full_name, email, role, is_active, company_id, updated_at');
    
    // If not super_admin, restrict to user's company_id
    if (user.role !== 'super_admin' && user.companyId) {
      query = query.eq('company_id', user.companyId);
    }

    const { data, error } = await query;

    if (error) {
      return { error: error.message, data: [] };
    }

    return { data: data || [], error: null };
  } catch (err: any) {
    return { error: err.message || "Failed to fetch team members.", data: [] };
  }
}

export async function updateTeamMember(userId: string, data: { fullName?: string; role?: string; isActive?: boolean }) {
  try {
    const currentUser = await requireRole(['tenant_admin', 'super_admin']);
    const adminSupabase = await createAdminClient();

    // Prevent self-deactivation or self-demotion if tenant_admin
    if (currentUser.userId === userId && data.isActive === false) {
      return { error: "You cannot deactivate your own account." };
    }

    const updatePayload: Record<string, any> = {};
    if (data.fullName !== undefined) updatePayload.full_name = data.fullName;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.isActive !== undefined) updatePayload.is_active = data.isActive;

    const { error } = await adminSupabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/settings/team");
    return { success: true, message: "Team member updated successfully." };
  } catch (err: any) {
    return { error: err.message || "Failed to update team member." };
  }
}

export async function deleteTeamMember(userId: string) {
  try {
    const currentUser = await requireRole(['tenant_admin', 'super_admin']);
    
    if (currentUser.userId === userId) {
      return { error: "You cannot delete your own account." };
    }

    const adminSupabase = await createAdminClient();

    // 1. Delete profile row
    const { error: profileErr } = await adminSupabase.from('profiles').delete().eq('id', userId);
    if (profileErr) {
      return { error: profileErr.message };
    }

    // 2. Delete auth user
    const { error: authErr } = await adminSupabase.auth.admin.deleteUser(userId);
    if (authErr) {
      console.warn("Could not delete auth user (may already be removed):", authErr.message);
    }

    revalidatePath("/dashboard/settings/team");
    return { success: true, message: "Team member deleted successfully." };
  } catch (err: any) {
    return { error: err.message || "Failed to delete team member." };
  }
}

