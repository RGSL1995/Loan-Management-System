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
  applicationData: any,
  applicationId?: string,
  productType?: "LAS" | "LAP" | "SCL" | "GENERAL"
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const companyId = await getUserCompanyId();

    // Handle both old format and new RGSL format
    const isRGSLFormat = applicationData.loan_amount !== undefined;

    let payload: any;

    if (isRGSLFormat) {
      // New RGSL format from RGSLLoanApplicationForm
      payload = {
        company_id: companyId,
        applicant_id: user.id,
        created_by: user.id,
        loan_type: applicationData.applicant_type === 'individual' ? 'personal_loan' : 'business_loan',
        applicant_type: applicationData.applicant_type,
        loan_amount: applicationData.loan_amount ? parseFloat(applicationData.loan_amount) : null,
        loan_tenure: applicationData.loan_tenure ? parseInt(applicationData.loan_tenure) : null,
        loan_purpose: applicationData.loan_purpose || '',
        loan_facility_type: applicationData.loan_facility_type || '',
        branch: applicationData.branch || '',
        individual_applicant_data: applicationData.individual || null,
        business_applicant_data: applicationData.business || null,
        collateral_details: applicationData.collaterals || [],
        processing_fees_data: applicationData.processing_fees || {},
        other_details: applicationData.other_details || '',
        declaration_accepted: applicationData.declaration_accepted || false,
        // Keep legacy fields for backward compatibility
        applicant_data: applicationData.individual || applicationData.business || {},
        bank_account_data: {},
        proposed_facilities: [],
        references: [],
        document_checklist: {},
        declaration_data: { accepted: applicationData.declaration_accepted || false },
        ckyc_consent: {},
      };
    } else {
      // Legacy format from old LoanApplicationForm
      const info = (applicationData?.application_info || {}) as any;
      const loanType = info.loan_type || "PERSONAL_LOAN";

      payload = {
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
    }

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
      if (data) data.loan_type = data.loan_type?.toUpperCase?.();
      savedData = data;

    } else {
      // Create new application in the existing table
      const { data, error } = await supabase
        .from("loan_applications")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      if (data) data.loan_type = data.loan_type?.toUpperCase?.();
      savedData = data;
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

    // Check if this is an RGSL format application
    const isRGSLFormat = application.applicant_type !== undefined && application.applicant_type !== null;

    if (!isRGSLFormat) {
      // Legacy format validation
      const appToValidate = {
        application_info: {
          loan_type: application.loan_type?.toUpperCase?.(),
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
    } else {
      // RGSL format validation - check required fields
      if (!application.loan_amount || !application.loan_tenure) {
        throw new Error("Loan amount and tenure are required");
      }
      if (!application.individual_applicant_data && !application.business_applicant_data) {
        throw new Error("Applicant details are required");
      }
      if (!application.declaration_accepted) {
        throw new Error("Declaration must be accepted before submission");
      }
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
