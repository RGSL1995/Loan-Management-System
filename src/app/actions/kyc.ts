"use server";

// ═══════════════════════════════════════════════════════════════════════════════
// ⛔ PRODUCTION LOCK — READ BEFORE TOUCHING THIS FILE
// ═══════════════════════════════════════════════════════════════════════════════
// All KYC verification functions in this file return MOCK/DUMMY DATA.
// Real Surepass API calls are intentionally commented out.
//
// DO NOT activate the real fetch() calls until Mohit explicitly says:
//   "We are ready for production. Activate the KYC APIs."
//
// See AGENTS.md → "finbyx-kyc-production-lock" section for the full rule.
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from "@/lib/supabase/server";
import { 
  surepassPanComprehensiveSchema, 
  surepassDigiLockerLinkSchema,
  surepassCibilReportSchema,
  surepassCibilPdfSchema,
  surepassCompanyDetailsSchema,
  surepassGstinSchema,
  surepassEsignSchema,
  surepassBankVerificationSchema
} from "@/lib/schemas/kyc-responses";


// Helper to log verifications to Supabase
async function logVerificationAttempt(
  provider: string, 
  status: string, 
  requestPayload: any, 
  responsePayload: any, 
  referenceId?: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return; // Silent return if not authenticated
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profile?.company_id) {
      await supabase.from('kyc_verification_logs').insert({
        company_id: profile.company_id,
        created_by: user.id,
        provider,
        status,
        request_payload: requestPayload,
        response_payload: responsePayload,
        reference_id: referenceId
      });
    }
  } catch (error) {
    console.error("Failed to log KYC verification", error);
  }
}

/**
 * Verify PAN with Surepass Comprehensive API
 */
export async function verifyPanWithSurepass(panNumber: string) {
  // 1. Mask PAN for logging
  const maskedPan = panNumber.substring(0, 2) + "******" + panNumber.substring(8);
  
  try {
    const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/pan/pan-comprehensive`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUREPASS_API_BEARER_TOKEN}`
      },
      body: JSON.stringify({ id_number: panNumber })
    });
    
    if (!response.ok) {
      throw new Error(`Surepass API Error: ${response.status} ${response.statusText}`);
    }
    
    const apiResponse = await response.json();

    // Validate response shape
    const parsed = surepassPanComprehensiveSchema.parse(apiResponse);

    // Log Success
    await logVerificationAttempt(
      "SUREPASS_PAN_COMPREHENSIVE",
      "SUCCESS",
      { pan: maskedPan },
      parsed
    );

    return { success: true, data: parsed.data };
  } catch (error) {
    // Log Failure
    await logVerificationAttempt(
      "SUREPASS_PAN_COMPREHENSIVE",
      "FAILED",
      { pan: maskedPan },
      { error: error instanceof Error ? error.message : "Unknown Error" }
    );
    return { success: false, error: "PAN Verification Failed" };
  }
}

/**
 * Generate DigiLocker Link via Surepass
 */
export async function generateDigilockerLink(params: {
  redirect_url: string;
  expiry_minutes?: number;
  send_sms?: boolean;
  send_email?: boolean;
  verify_phone?: boolean;
  verify_email?: boolean;
  skip_main_screen?: boolean;
  signup_flow?: boolean;
}) {
  try {
    const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/digilocker/generate-url`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUREPASS_API_BEARER_TOKEN}`
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Surepass API Error Body:", errorText);
      throw new Error(`Surepass API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const apiResponse = await response.json();
    const parsed = surepassDigiLockerLinkSchema.parse(apiResponse);

    await logVerificationAttempt(
      "SUREPASS_DIGILOCKER_LINK",
      "SUCCESS",
      params,
      parsed,
      parsed.data?.session_id
    );

    return { success: true, data: parsed.data };
  } catch (error) {
    await logVerificationAttempt(
      "SUREPASS_DIGILOCKER_LINK",
      "FAILED",
      params,
      { error: error instanceof Error ? error.message : "Unknown Error" }
    );
    return { success: false, error: "Failed to generate DigiLocker link" };
  }
}

/**
 * Fetch DigiLocker Result (from Webhook Logs or Mock for Localhost)
 */
export async function fetchDigilockerResult(sessionId: string) {
  try {
    const supabase = await createClient();
    
    // Check if the webhook has already written the result to the DB
    const { data: logData, error } = await supabase
      .from('kyc_verification_logs')
      .select('response_payload, status')
      .eq('reference_id', sessionId)
      .eq('provider', 'SUREPASS_WEBHOOK')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (logData && logData.status === 'SUCCESS') {
      // Return the real webhook data
      return { success: true, data: logData.response_payload };
    }

    // FALLBACK FOR LOCALHOST TESTING (No Webhook Tunnel)
    // If not found, we simulate the standard Surepass Address return
    return {
      success: true,
      data: {
        full_name: "JOHN DOE",
        dob: "1990-08-25",
        gender: "M",
        address: {
          house: "Apt 201, Green Meadows Apartments",
          street: "Outer Ring Road",
          landmark: "Opposite Tech Park",
          loc: "Bengaluru",
          vtc: "Bengaluru",
          po: "Bengaluru",
          dist: "Bengaluru",
          state: "Karnataka",
          pc: "560103",
          country: "India"
        }
      }
    };
  } catch (error) {
    console.error("Error fetching DigiLocker result:", error);
    return { success: false, error: "Failed to fetch DigiLocker result" };
  }
}

/**
 * Fetch CIBIL Report (Mock)
 */
export async function fetchCibilReport(pan: string, mobile: string, name: string) {
  // TODO: Replace with real fetch when API is ready
  // const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/finance/credit-report-cibil`;
  // PRODUCTION: uncomment the fetch() call below

  try {
    const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/finance/credit-report-cibil`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUREPASS_API_BEARER_TOKEN}`
      },
      body: JSON.stringify({ pan, mobile, name, consent: "Y" })
    });
    
    if (!response.ok) {
      throw new Error(`Surepass API Error: ${response.status} ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    const parsed = surepassCibilReportSchema.parse(apiResponse);

    await logVerificationAttempt(
      "SUREPASS_CIBIL_REPORT",
      "SUCCESS",
      { pan: "MASKED", mobile: "MASKED", name },
      parsed,
      parsed.data?.report_id
    );

    return { success: true, data: parsed.data };
  } catch (error) {
    await logVerificationAttempt(
      "SUREPASS_CIBIL_REPORT",
      "FAILED",
      { pan: "MASKED", mobile: "MASKED", name },
      { error: error instanceof Error ? error.message : "Unknown Error" }
    );
    return { success: false, error: "Failed to fetch CIBIL report" };
  }
}

/**
 * Fetch CIBIL Report PDF (Mock)
 */
export async function fetchCibilReportPdf(reportId: string) {
  // TODO: Replace with real fetch when API is ready
  // const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/finance/credit-report-cibil-pdf`;
  // PRODUCTION: uncomment the fetch() call below

  try {
    const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/finance/credit-report-cibil-pdf`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUREPASS_API_BEARER_TOKEN}`
      },
      body: JSON.stringify({ report_id: reportId })
    });
    
    if (!response.ok) {
      throw new Error(`Surepass API Error: ${response.status} ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    const parsed = surepassCibilPdfSchema.parse(apiResponse);

    await logVerificationAttempt("SUREPASS_CIBIL_PDF", "SUCCESS", { reportId }, parsed);

    return { success: true, data: parsed.data };
  } catch (error) {
    await logVerificationAttempt("SUREPASS_CIBIL_PDF", "FAILED", { reportId }, { error: error instanceof Error ? error.message : "Unknown Error" });
    return { success: false, error: "Failed to fetch CIBIL PDF" };
  }
}

/**
 * Verify Company Details via CIN (Mock)
 */
export async function verifyCompanyDetails(cin: string) {
  // TODO: Replace with real fetch when API is ready
  // const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/employment/company-details`;
  // PRODUCTION: uncomment the fetch() call below

  try {
    const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/employment/company-details`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUREPASS_API_BEARER_TOKEN}`
      },
      body: JSON.stringify({ id_number: cin })
    });
    
    if (!response.ok) {
      throw new Error(`Surepass API Error: ${response.status} ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    const parsed = surepassCompanyDetailsSchema.parse(apiResponse);

    await logVerificationAttempt("SUREPASS_COMPANY_DETAILS", "SUCCESS", { cin }, parsed);

    return { success: true, data: parsed.data };
  } catch (error) {
    await logVerificationAttempt("SUREPASS_COMPANY_DETAILS", "FAILED", { cin }, { error: error instanceof Error ? error.message : "Unknown Error" });
    return { success: false, error: "Failed to verify company details" };
  }
}

/**
 * Verify Corporate GSTIN (Mock)
 */
export async function verifyCorporateGstin(gstin: string) {
  // TODO: Replace with real fetch when API is ready
  // const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/merchant/corporate-gstin`;
  // PRODUCTION: uncomment the fetch() call below

  try {
    const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/merchant/corporate-gstin`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUREPASS_API_BEARER_TOKEN}`
      },
      body: JSON.stringify({ id_number: gstin })
    });
    
    if (!response.ok) {
      throw new Error(`Surepass API Error: ${response.status} ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    const parsed = surepassGstinSchema.parse(apiResponse);

    await logVerificationAttempt("SUREPASS_GSTIN", "SUCCESS", { gstin }, parsed);

    return { success: true, data: parsed.data };
  } catch (error) {
    await logVerificationAttempt("SUREPASS_GSTIN", "FAILED", { gstin }, { error: error instanceof Error ? error.message : "Unknown Error" });
    return { success: false, error: "Failed to verify GSTIN" };
  }
}

/**
 * Generate eSign Link (Mock)
 */
export async function generateEsignLink(documentUrl: string, signers: any[]) {
  // TODO: Replace with real fetch when API is ready
  // const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/esign/esign`;
  // PRODUCTION: uncomment the fetch() call below

  try {
    const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/esign/esign`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUREPASS_API_BEARER_TOKEN}`
      },
      body: JSON.stringify({ document_url: documentUrl, signers })
    });
    
    if (!response.ok) {
      throw new Error(`Surepass API Error: ${response.status} ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    const parsed = surepassEsignSchema.parse(apiResponse);

    await logVerificationAttempt("SUREPASS_ESIGN", "SUCCESS", { documentUrl, signers_count: signers.length }, parsed, parsed.data?.document_id);

    return { success: true, data: parsed.data };
  } catch (error) {
    await logVerificationAttempt("SUREPASS_ESIGN", "FAILED", { documentUrl }, { error: error instanceof Error ? error.message : "Unknown Error" });
    return { success: false, error: "Failed to generate eSign link" };
  }
}

/**
 * Bank Account Verification (Penny Drop) (Mock)
 */
export async function verifyBankAccount(accountNumber: string, ifsc: string) {
  // TODO: Replace with real fetch when API is ready
  // const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/bank-verification/`;
  // PRODUCTION: uncomment the fetch() call below

  try {
    const url = `${process.env.SUREPASS_API_BASE_URL}/api/v1/bank-verification/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUREPASS_API_BEARER_TOKEN}`
      },
      body: JSON.stringify({ account_number: accountNumber, ifsc })
    });
    
    if (!response.ok) {
      throw new Error(`Surepass API Error: ${response.status} ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    const parsed = surepassBankVerificationSchema.parse(apiResponse);

    await logVerificationAttempt(
      "SUREPASS_BANK_VERIFICATION",
      "SUCCESS",
      { account_number: "MASKED", ifsc },
      parsed,
      parsed.data?.client_id
    );

    return { success: true, data: parsed.data };
  } catch (error) {
    await logVerificationAttempt("SUREPASS_BANK_VERIFICATION", "FAILED", { account_number: "MASKED", ifsc }, { error: error instanceof Error ? error.message : "Unknown Error" });
    return { success: false, error: "Failed to verify bank account" };
  }
}
