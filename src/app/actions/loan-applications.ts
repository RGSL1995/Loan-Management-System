"use server";

import { createClient } from "@/lib/supabase/server";
import { CompleteLoanApplicationSchema, type CompleteLoanApplication } from "@/lib/schemas/loan-application";
import { z } from "zod";
import { createFineractLoan } from "@/lib/fineract/proxy";

async function getUserCompanyId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

export async function saveLoanApplication(
  applicationData: Partial<CompleteLoanApplication> & { product_data?: Record<string, any> },
  applicationId?: string,
  productType?: "LAS" | "LAP" | "SCL" | "GENERAL"
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const companyId = await getUserCompanyId();

    const info = (applicationData?.application_info || {}) as any;
    const loanType = info.loan_type || "PERSONAL_LOAN";

    // Build the primary payload for the existing loan_applications table (draft storage)
    const payload = {
      company_id: companyId,
      applicant_id: user.id,
      created_by: user.id,
      loan_type: loanType.toLowerCase(),
      applicant_data: applicationData?.applicant_details || {},
      co_applicant_data: applicationData?.co_applicant_details || null,
      contact_person_data: applicationData?.contact_person || null,
      associate_company_data: applicationData?.associate_companies || null,
      existing_loans: applicationData?.existing_loans || [],
      bank_account_data: applicationData?.bank_account || {},
      proposed_facilities: applicationData?.proposed_facilities || [],
      references: applicationData?.references || [],
      document_checklist: applicationData?.document_checklist || {},
      declaration_data: applicationData?.declaration || {},
      ckyc_consent: applicationData?.ckyc_consent || {},
    };

    let savedData: any;

    if (applicationId) {
      // Update existing application (only if draft)
      const { data: existing } = await supabase
        .from("loan_applications")
        .select("status")
        .eq("id", applicationId)
        .eq("company_id", companyId)
        .single();

      if (existing?.status !== "draft") {
        throw new Error("Can only edit draft applications");
      }

      const { data, error } = await supabase
        .from("loan_applications")
        .update(payload)
        .eq("id", applicationId)
        .select()
        .single();

      if (error) throw error;
      if (data) data.loan_type = data.loan_type.toUpperCase();
      savedData = data;

      // Also update product_data in loan_applications_v2 if productType provided
      if (productType && productType !== "GENERAL" && applicationData?.product_data) {
        await supabase
          .from("loan_applications_v2")
          .update({
            core_data: payload,
            product_data: applicationData.product_data,
          })
          .eq("company_id", companyId)
          // Match by a linkage: store the v1 id as reference
          .eq("product_type", productType);
      }

    } else {
      // Create new application in the existing table
      const { data, error } = await supabase
        .from("loan_applications")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      if (data) data.loan_type = data.loan_type.toUpperCase();
      savedData = data;

      // Also write to loan_applications_v2 for product-specific storage
      // This is the scalable store — product_data is pure JSONB, no migrations needed
      if (productType && productType !== "GENERAL") {
        const { error: v2Error } = await supabase
          .from("loan_applications_v2")
          .insert({
            company_id: companyId,
            // NOTE: client_id will be required when client management is fully implemented.
            // For now we use a placeholder UUID to allow saving. Update when client linking is done.
            client_id: "00000000-0000-0000-0000-000000000000",
            product_type: productType,
            status: "draft",
            core_data: payload,
            product_data: applicationData.product_data || {},
            created_by: user.id,
          });

        if (v2Error) {
          // Log but do not fail — the primary save succeeded
          console.warn("loan_applications_v2 insert warning:", v2Error.message);
        }
      }
    }

    return {
      data: savedData,
      error: null,
      message: "Application saved successfully",
    };

  } catch (err: any) {
    console.error("Save Loan Application Error:", err);
    return {
      data: null,
      error: err?.message || String(err) || "Failed to save application",
    };
  }
}

export async function submitLoanApplication(applicationId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const companyId = await getUserCompanyId();

    // Verify ownership and fetch complete application data
    const { data: application, error: fetchError } = await supabase
      .from("loan_applications")
      .select("*")
      .eq("id", applicationId)
      .eq("company_id", companyId)
      .single();

    if (fetchError || !application) {
      throw new Error('Application not found');
    }

    if (application.status !== "draft") {
      throw new Error("Can only submit draft applications");
    }

    // Reconstruct the CompleteLoanApplication object for strict validation
    const appToValidate = {
      application_info: {
        loan_type: application.loan_type.toUpperCase(),
        applicant_signature_file_id: application.applicant_signature_file_id || undefined,
        applicant_photo_file_id: application.applicant_photo_file_id || undefined,
        co_applicant_photo_file_id: application.co_applicant_photo_file_id || undefined,
      },
      applicant_details: application.applicant_data,
      co_applicant_details: application.co_applicant_data || undefined,
      contact_person: application.contact_person_data || undefined,
      associate_companies: application.associate_company_data || [],
      existing_loans: application.existing_loans,
      bank_account: application.bank_account_data,
      proposed_facilities: application.proposed_facilities,
      references: application.references,
      document_checklist: application.document_checklist,
      declaration: application.declaration_data,
      ckyc_consent: application.ckyc_consent,
    };

    // Validate the complete application data strictly
    try {
      CompleteLoanApplicationSchema.parse(appToValidate);
    } catch (parseErr) {
      if (parseErr instanceof z.ZodError) {
        const errorsList = parseErr.issues.map(
          (e: z.ZodIssue) => `${e.path.join(".") || "field"}: ${e.message}`
        );
        throw new Error(`Validation failed:\n${errorsList.join("\n")}`);
      }
      throw parseErr;
    }

    const { data, error } = await supabase
      .from("loan_applications")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select()
      .single();

    if (error) throw error;

    // Send to Fineract LOS (Mock) - COMMENTED OUT AS PER USER REQUEST TO KEEP IT IN SUPABASE
    // const principalAmount = appToValidate.proposed_facilities?.[0]?.amount || 50000;
    
    // await createFineractLoan({
    //   clientId: 1, // Mock client ID
    //   loanProductName: appToValidate.application_info.loan_type,
    //   principal: principalAmount,
    //   loanTerm: appToValidate.proposed_facilities?.[0]?.tenor || 12,
    //   interestRate: 15,
    //   repaymentStrategy: "EMI"
    // }, { tenantId: companyId });

    return {
      data,
      error: null,
      message: "Application submitted for review",
    };
  } catch (err: any) {
    console.error("Submit Loan Application Error:", err);
    return {
      data: null,
      error: err?.message || String(err) || "Failed to submit application",
    };
  }
}

export async function getLoanApplication(applicationId: string) {
  try {
    const supabase = await createClient();
    const companyId = await getUserCompanyId();

    const { data, error } = await supabase
      .from("loan_applications")
      .select("*")
      .eq("id", applicationId)
      .eq("company_id", companyId)
      .single();

    if (error) throw error;

    if (data) {
      data.loan_type = data.loan_type.toUpperCase();
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch application",
    };
  }
}

export async function getCompanyApplications() {
  try {
    const supabase = await createClient();
    const companyId = await getUserCompanyId();

    const { data, error } = await supabase
      .from("loan_applications")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (data) {
      data.forEach((app: any) => {
        app.loan_type = app.loan_type.toUpperCase();
      });
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch applications",
    };
  }
}

export async function deleteLoanApplication(applicationId: string) {
  try {
    const supabase = await createClient();
    const companyId = await getUserCompanyId();

    // Verify it's a draft
    const { data: app } = await supabase
      .from("loan_applications")
      .select("status")
      .eq("id", applicationId)
      .eq("company_id", companyId)
      .single();

    if (app?.status !== "draft") {
      throw new Error("Can only delete draft applications");
    }

    const { error } = await supabase
      .from("loan_applications")
      .delete()
      .eq("id", applicationId)
      .eq("company_id", companyId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete application",
    };
  }
}
