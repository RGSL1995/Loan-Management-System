import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { cin } = await request.json();

    if (!cin || !cin.trim()) {
      return NextResponse.json(
        { success: false, error: "CIN is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SUREPASS_API_BEARER_TOKEN;
    if (!apiKey) {
      console.error("Missing SUREPASS_API_BEARER_TOKEN");
      return NextResponse.json(
        { success: false, error: "API configuration missing" },
        { status: 500 }
      );
    }

    const baseUrl = "https://kyc-api.surepass.app";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    console.log(`[Surepass] Fetching company details for CIN: "${cin}"`);

    // Company Details by CIN
    const companyDetailsResponse = await fetch(
      `${baseUrl}/api/v1/corporate/company-details`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ id_number: cin }),
      }
    );

    if (!companyDetailsResponse.ok) {
      const errorText = await companyDetailsResponse.text();
      console.error(`[Surepass] Company-Details API Error: ${companyDetailsResponse.status}`, errorText);
      return NextResponse.json(
        { success: false, error: `Company details fetch failed: ${companyDetailsResponse.status}` },
        { status: companyDetailsResponse.status }
      );
    }

    const responseData = await companyDetailsResponse.json();
    const companyInfo = responseData?.data?.details?.company_info || responseData?.data?.company_info;

    if (!companyInfo) {
      console.error("[Surepass] No company info found in response:", responseData);
      return NextResponse.json(
        { success: false, error: "Invalid company details response" },
        { status: 400 }
      );
    }

    console.log(`[Surepass] ✅ Successfully fetched company details for CIN: ${cin}`);

    return NextResponse.json({
      success: true,
      data: {
        entity_name: companyInfo?.company_name || "",
        cin_llpin: companyInfo?.cin || cin,
        dol: companyInfo?.date_of_incorporation || "",
        pan: companyInfo?.pan || "",
        gstin_uin: companyInfo?.gstin_uin || "",
        company_type: companyInfo?.company_type || "",
        is_registered: companyInfo?.company_status?.toLowerCase() === "active" ? "yes" : "no",
        corporate_address: companyInfo?.registered_address || "",
        corporate_state: companyInfo?.state || "",
        corporate_pin: companyInfo?.pin_code || "",
        contact_no: companyInfo?.phone || "",
        contact_email: companyInfo?.email_id || "",
      },
    });
  } catch (error) {
    console.error("[Surepass] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch company details",
      },
      { status: 500 }
    );
  }
}
