"use server";

import { requireRole } from "@/lib/supabase/rbac";
import { revalidatePath } from "next/cache";

export type OpsCase = {
  id: string;
  title: string;
  description: string;
  type: "DEVIATION" | "ESCALATION" | "PDD" | "GENERAL";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignedTo: string;
  relatedEntityType: string;
  relatedEntityId: string;
  createdAt: string;
};

// Mock Data simulating what we'd pull from Supabase `ops_cases`
const mockOpsCases: OpsCase[] = [
  {
    id: "case-001",
    title: "LTV Deviation Approval (72%)",
    description: "Borrower LTV is 72% which exceeds the standard 65% limit for Commercial properties. Requires branch manager sign-off.",
    type: "DEVIATION",
    priority: "HIGH",
    status: "OPEN",
    assignedTo: "manager@finbyx.com",
    relatedEntityType: "LOAN",
    relatedEntityId: "LN-00921",
    createdAt: "2026-07-13T08:15:00Z"
  },
  {
    id: "case-002",
    title: "Missing Original Title Deed (PDD)",
    description: "Physical copy of the original title deed has not been deposited in the vault yet. SLA expires in 2 days.",
    type: "PDD",
    priority: "URGENT",
    status: "IN_PROGRESS",
    assignedTo: "vault.clerk@finbyx.com",
    relatedEntityType: "LOAN",
    relatedEntityId: "LN-00810",
    createdAt: "2026-07-10T14:00:00Z"
  },
  {
    id: "case-003",
    title: "Suspected Fraud Alert - Field Investigation",
    description: "Field investigator reported that the business address provided does not exist. Need immediate review.",
    type: "ESCALATION",
    priority: "URGENT",
    status: "OPEN",
    assignedTo: "manager@finbyx.com",
    relatedEntityType: "CLIENT",
    relatedEntityId: "CL-99120",
    createdAt: "2026-07-13T10:45:00Z"
  },
  {
    id: "case-004",
    title: "Interest Rate Concession Request",
    description: "Premium client requesting 0.5% concession on standard LAP rate.",
    type: "DEVIATION",
    priority: "MEDIUM",
    status: "RESOLVED",
    assignedTo: "manager@finbyx.com",
    relatedEntityType: "LOAN",
    relatedEntityId: "LN-00911",
    createdAt: "2026-07-11T09:00:00Z"
  }
];

export async function getOpsCases(filterType?: string) {
  // Any operational staff can view ops cases
  await requireRole(["tenant_admin", "loan_officer", "credit_manager", "operations_officer", "collections_officer"]);

  // Simulate network delay to Supabase
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockOpsCases];
  if (filterType && filterType !== "ALL") {
    filtered = filtered.filter(c => c.type === filterType);
  }

  // Sort by createdAt descending
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateOpsCaseStatus(caseId: string, newStatus: OpsCase["status"]) {
  // Only credit managers or admins can update ops case status
  await requireRole(["tenant_admin", "credit_manager", "operations_officer"]);

  // Simulate Supabase Update
  await new Promise((resolve) => setTimeout(resolve, 400));
  revalidatePath("/dashboard/operations/tasks");
  
  return { success: true, message: `Case ${caseId} marked as ${newStatus}` };
}
