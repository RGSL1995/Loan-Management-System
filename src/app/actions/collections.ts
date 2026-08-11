"use server";

import { z } from "zod";
import { requireRole } from "@/lib/supabase/rbac";
import { revalidatePath } from "next/cache";

import { repaymentSchema, type RepaymentValues } from "@/lib/schemas/collections";

export async function recordRepayment(data: RepaymentValues) {
  // 1. Enforce RBAC
  // Only collections officers or admins can record payments
  await requireRole(['tenant_admin', 'collections_officer']);

  // 2. Validate Payload
  const parsed = repaymentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.format() };
  }

  // 3. Mock Fineract API Call (e.g. POST /loans/{loanId}/transactions?command=repayment)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 4. Success Response
  revalidatePath(`/dashboard/loans/${data.loanId}`);
  
  return { 
    success: true, 
    message: `Successfully recorded repayment of ₹${data.amount} for loan ${data.loanId}` 
  };
}
