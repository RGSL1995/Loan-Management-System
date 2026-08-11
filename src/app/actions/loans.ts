"use server";

import { z } from "zod";
import { requireRole } from "@/lib/supabase/rbac";
import { revalidatePath } from "next/cache";
import { proxyToFineract, listFineractLoans, createFineractLoan, approveFineractLoan, disburseFineractLoan } from "@/lib/fineract/proxy";
import { createClient } from "@/lib/supabase/server";

import { loanFormSchema, type LoanFormValues, lasFormSchema, type LasFormValues, lapFormSchema, type LapFormValues, sclFormSchema, type SclFormValues } from "@/lib/schemas/loans";

async function getTenantId(): Promise<string | undefined> {
  try {
    const supabase = await createClient();
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

export async function submitLoanApplication(data: LoanFormValues) {
  await requireRole(['tenant_admin', 'loan_officer']);
  const parsed = loanFormSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.format() };
  const tenantId = await getTenantId();
  const result = await createFineractLoan(parsed.data, { tenantId });
  if (result.error) return { error: result.error, status: result.status };
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/operations/tasks");
  return { success: true, loanId: (result.data as any)?.loanId || "LN-" + Math.floor(Math.random() * 10000) };
}

export async function submitLasApplication(data: LasFormValues) {
  await requireRole(['tenant_admin', 'loan_officer']);
  const parsed = lasFormSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.format() };
  let totalDp = 0;
  for (const sec of parsed.data.securities) {
    totalDp += (sec.qty * sec.price) * (sec.ltv / 100);
  }
  if (parsed.data.requestedLimit > totalDp) return { error: "Requested limit exceeds calculated Drawing Power" };
  const tenantId = await getTenantId();
  const result = await createFineractLoan(parsed.data, { tenantId });
  if (result.error) return { error: result.error, status: result.status };
  revalidatePath("/dashboard/applications");
  return { success: true, loanId: (result.data as any)?.loanId || "LAS-" + Math.floor(Math.random() * 10000) };
}

export async function submitLapApplication(data: LapFormValues) {
  await requireRole(['tenant_admin', 'loan_officer']);
  const parsed = lapFormSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.format() };
  const ltvLimits: Record<string, number> = { "Residential": 0.65, "Commercial": 0.55, "Plot": 0.50 };
  const ltvCap = parsed.data.assessedValue * (ltvLimits[parsed.data.propertyClass] || 0.50);
  const estimatedEmi = parsed.data.requestedAmount * 0.012;
  const foir = (parsed.data.existingObligations + estimatedEmi) / parsed.data.netIncome;
  if (foir > 0.60) return { error: `Capacity breach: FOIR ${Math.round(foir*100)}% exceeds 60% limit` };
  if (parsed.data.requestedAmount > ltvCap) return { error: `LTV breach: Requested amount exceeds ${ltvLimits[parsed.data.propertyClass]*100}% of property value` };
  const tenantId = await getTenantId();
  const result = await createFineractLoan(parsed.data, { tenantId });
  if (result.error) return { error: result.error, status: result.status };
  revalidatePath("/dashboard/applications");
  return { success: true, loanId: (result.data as any)?.loanId || "LAP-" + Math.floor(Math.random() * 10000) };
}

export async function submitSclApplication(data: SclFormValues) {
  await requireRole(['tenant_admin', 'loan_officer']);
  const parsed = sclFormSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.format() };
  if (!parsed.data.kfsAccepted) return { error: "Key Fact Statement must be accepted" };
  const tenantId = await getTenantId();
  const result = await createFineractLoan(parsed.data, { tenantId });
  if (result.error) return { error: result.error, status: result.status };
  revalidatePath("/dashboard/applications");
  return { success: true, loanId: (result.data as any)?.loanId || "SCL-" + Math.floor(Math.random() * 10000) };
}

export async function getLoans(clientId?: number) {
  try {
    const tenantId = await getTenantId();
    const result = await listFineractLoans(clientId, { tenantId });
    if (result.error) return { error: result.error, data: null };
    return { data: result.data, error: null };
  } catch (error) {
    return { error: { defaultUserMessage: error instanceof Error ? error.message : "Failed to fetch loans" }, data: null };
  }
}

/**
 * Borrower self-service: returns only the loans belonging to the
 * currently authenticated borrower's linked Fineract client_id.
 */
export async function getMyLoans() {
  try {
    const user = await requireRole(['borrower']);
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("client_id")
      .eq("id", user.userId)
      .single();

    const clientId = profile?.client_id;
    if (!clientId) {
      return { error: { defaultUserMessage: "No loan account is linked to this login yet. Contact your loan officer." }, data: null };
    }

    return await getLoans(clientId);
  } catch (error) {
    return { error: { defaultUserMessage: error instanceof Error ? error.message : "Failed to fetch your loans" }, data: null };
  }
}

export async function createLoan(loanData: Record<string, unknown>) {
  try {
    await requireRole(['loan_officer']);
    const tenantId = await getTenantId();
    const result = await createFineractLoan(loanData, { tenantId });
    if (result.error) return { error: result.error, data: null };
    return { data: result.data, error: null };
  } catch (error) {
    return { error: { defaultUserMessage: error instanceof Error ? error.message : "Failed to create loan" }, data: null };
  }
}

export async function approveLoan(loanId: number, approvalData: Record<string, unknown>) {
  try {
    await requireRole(['credit_manager']);
    const tenantId = await getTenantId();
    const result = await approveFineractLoan(loanId, approvalData, { tenantId });
    if (result.error) return { error: result.error, data: null };
    return { data: result.data, error: null };
  } catch (error) {
    return { error: { defaultUserMessage: error instanceof Error ? error.message : "Failed to approve loan" }, data: null };
  }
}

export async function disburseLoan(loanId: number, disburseData: Record<string, unknown>) {
  try {
    await requireRole(['operations_officer']);
    const tenantId = await getTenantId();
    const result = await disburseFineractLoan(loanId, disburseData, { tenantId });
    if (result.error) return { error: result.error, data: null };
    return { data: result.data, error: null };
  } catch (error) {
    return { error: { defaultUserMessage: error instanceof Error ? error.message : "Failed to disburse loan" }, data: null };
  }
}
