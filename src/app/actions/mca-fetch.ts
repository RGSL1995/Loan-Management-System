"use server";

import { createClient } from "@/lib/supabase/server";

interface MCACorporateDetails {
  entity_name?: string;
  cin_llpin?: string;
  pan?: string;
  dol?: string;
  company_type?: string;
  registration_status?: string;
  corporate_address?: string;
  corporate_state?: string;
  corporate_pin?: string;
  registered_address?: string;
  registered_state?: string;
  registered_pin?: string;
  contact_no?: string;
  contact_email?: string;
  gstin_uin?: string;
  directors?: Array<{
    name: string;
    din?: string;
    designation?: string;
  }>;
}

export async function fetchMCADetails(
  companyName: string,
  mcaUsername: string,
  mcaPassword: string,
  applicationId?: string,
  sessionId?: string,
  otp?: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Call the API route which handles the actual scraping
    const response = await fetch(`/api/mca/fetch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyName,
        sessionId,
        otp,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch MCA details");
    }

    const result = await response.json();
    const companyDetails: MCACorporateDetails = result.data;

    // If applicationId provided, save the credentials and details
    if (applicationId) {
      // Encrypt credentials before storing (in production, use proper encryption)
      const encryptedCreds = {
        username: mcaUsername,
        // In production, encrypt the password with a key
        password: Buffer.from(mcaPassword).toString('base64'),
      };

      const { error: updateError } = await supabase
        .from("loan_applications")
        .update({
          mca_credentials: encryptedCreds,
          mca_company_details: companyDetails,
          mca_last_fetched_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (updateError) throw updateError;
    }

    return {
      success: true,
      data: companyDetails,
      message: "Company details fetched successfully from MCA",
    };
  } catch (error: any) {
    console.error("MCA Fetch Error:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch MCA details",
      data: null,
    };
  }
}
