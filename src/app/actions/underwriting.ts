"use server";

import { requireRole } from "@/lib/supabase/rbac";
import { revalidatePath } from "next/cache";

export type LoanDecision = "APPROVE" | "REJECT" | "SEND_BACK";

export async function processLoanDecision(loanId: string, decision: LoanDecision, notes: string) {
  // 1. Enforce RBAC (Checker Only)
  try {
    await requireRole(['tenant_admin', 'credit_manager']);
  } catch (err: any) {
    return { error: err.message || "Forbidden action." };
  }

  // 2. Mock Fineract API Call (e.g. POST /loans/{id}?command=approve)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 3. Success
  revalidatePath("/dashboard/operations/tasks");
  revalidatePath(`/dashboard/applications/${loanId}/underwriting`);
  
  return { 
    success: true, 
    message: `Loan ${loanId} successfully marked as ${decision}` 
  };
}
