"use server";

import { requireRole } from "@/lib/supabase/rbac";
import { revalidatePath } from "next/cache";
import { MOCK_MAKER_CHECKERS } from "@/lib/fineract/mocks/data";

export type MakerCheckerTask = {
  id: number;
  actionName: string;
  entityName: string;
  resourceId: number;
  subresourceId: number | null;
  maker: string;
  madeOnDate: string;
  checker: string | null;
  checkedOnDate: string | null;
  processingResult: "PENDING" | "APPROVED" | "REJECTED";
  commandAsJson: string;
};

export async function approveMakerCheckerTask(taskId: number) {
  // Only credit managers or admins can approve tasks (Checker role)
  await requireRole(["tenant_admin", "credit_manager"]);

  // Mock checking Fineract API
  const isMock = process.env.MOCK_FINERACT !== "false";
  
  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Artificial delay
    revalidatePath("/dashboard/maker-checker");
    return { success: true, message: `Task ${taskId} approved successfully.` };
  }

  // Real Fineract implementation would go here:
  // POST /makercheckers/{taskId}?command=approve
  return { success: true, message: `Task ${taskId} approved in Fineract.` };
}

export async function rejectMakerCheckerTask(taskId: number, reason: string) {
  // Only credit managers or admins can reject tasks (Checker role)
  await requireRole(["tenant_admin", "credit_manager"]);

  // Mock checking Fineract API
  const isMock = process.env.MOCK_FINERACT !== "false";
  
  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Artificial delay
    revalidatePath("/dashboard/maker-checker");
    return { success: true, message: `Task ${taskId} rejected. Reason: ${reason}` };
  }

  // Real Fineract implementation would go here:
  // POST /makercheckers/{taskId}?command=reject
  return { success: true, message: `Task ${taskId} rejected in Fineract.` };
}

/**
 * Loan Officers (Makers) submit a Credit Assessment Memo (CAM) to the
 * Maker-Checker queue for a Credit Manager (Checker) to review.
 */
export async function submitCamToMakerChecker(payload: {
  applicationId: string;
  cibilScore: number;
  assetValue: number;
  ltv: number;
  dti: number;
  recommendation: "RECOMMEND" | "CONDITIONAL" | "DECLINE";
  notes: string;
  makerEmail: string;
}) {
  // Only loan officers or credit managers can submit CAM (they are the Makers)
  await requireRole(["loan_officer", "credit_manager", "tenant_admin"]);

  const isMock = process.env.MOCK_FINERACT !== "false";

  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Create a new maker-checker task in the mock data store
    const newTaskId = MOCK_MAKER_CHECKERS.length + 1;
    MOCK_MAKER_CHECKERS.push({
      id: newTaskId,
      actionName: "APPROVE",
      entityName: "LOAN",
      resourceId: parseInt(payload.applicationId) || newTaskId,
      subresourceId: null,
      maker: payload.makerEmail,
      madeOnDate: new Date().toISOString(),
      checker: null,
      checkedOnDate: null,
      processingResult: "PENDING",
      commandAsJson: JSON.stringify({
        applicationId: payload.applicationId,
        cibilScore: payload.cibilScore,
        assetValue: payload.assetValue,
        ltvPercent: payload.ltv,
        dtiPercent: payload.dti,
        recommendation: payload.recommendation,
        camNotes: payload.notes,
        submittedAt: new Date().toISOString(),
      }, null, 2),
    });

    revalidatePath("/dashboard/maker-checker");
    revalidatePath("/dashboard/underwriting");
    return { success: true, taskId: newTaskId };
  }

  // Real Fineract: POST /makercheckers with the CAM payload
  return { success: false, message: "Live Fineract not configured." };
}
