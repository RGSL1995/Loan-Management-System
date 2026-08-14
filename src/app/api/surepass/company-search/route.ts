import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName || !companyName.trim()) {
      return NextResponse.json(
        { success: false, error: "Company name is required" },
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

    console.log(`[Surepass] Step 1️⃣ : Searching for CIN with company name: "${companyName}"`);

    // Step 1: Name to CIN
    const nameToCinResponse = await fetch(
      `${baseUrl}/api/v1/corporate/name-to-cin-list`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ company_name_search: companyName }),
      }
    );

    if (!nameToCinResponse.ok) {
      const errorText = await nameToCinResponse.text();
      console.error(`[Surepass] Name-to-CIN API Error: ${nameToCinResponse.status}`, errorText);
      return NextResponse.json(
        { success: false, error: `Name-to-CIN search failed: ${nameToCinResponse.status}` },
        { status: nameToCinResponse.status }
      );
    }

    const nameToCinData = await nameToCinResponse.json();
    const companyList = nameToCinData?.data?.company_list || [];

    if (!companyList || companyList.length === 0) {
      console.error("[Surepass] No companies found");
      return NextResponse.json(
        { success: false, error: "No companies found with that name" },
        { status: 404 }
      );
    }

    console.log(`[Surepass] Found ${companyList.length} matching companies. Getting first match...`);

    // Get CIN of first matching company
    const firstMatch = companyList[0];
    const cin = firstMatch.cin_number;
    const fetchedCompanyName = firstMatch.company_name;

    console.log(`[Surepass] Step 2️⃣ : Fetching company details for CIN: "${cin}"`);

    // Step 2: Company Details by CIN (in background)
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
    console.log(`[Surepass] Full company info:`, JSON.stringify(companyInfo, null, 2));

    // Extract address components from registered_address
    const extractState = (addr: string) => {
      const stateMatch = addr.match(/(?:Uttar Pradesh|Maharashtra|Delhi|Karnataka|Tamil Nadu|Gujarat|Rajasthan|West Bengal|Punjab|Haryana|Telangana|Andhra Pradesh)/i);
      return stateMatch ? stateMatch[0] : "";
    };
    const extractPin = (addr: string) => {
      const pinMatch = addr.match(/\b\d{6}\b/);
      return pinMatch ? pinMatch[0] : "";
    };
    const extractCity = (addr: string) => {
      const parts = addr.split(/(?:,|\s{2,})/);
      // Usually city is one of the middle parts, return first part that looks like a city
      return parts.length > 2 ? parts[parts.length - 4]?.trim() || "" : "";
    };

    return NextResponse.json({
      success: true,
      data: {
        entity_name: fetchedCompanyName || "",
        cin_llpin: companyInfo?.cin || cin,
        dol: companyInfo?.date_of_incorporation || "",
        pan: "",  // Not available from Surepass
        gstin_uin: "",  // Not available from Surepass
        company_type: companyInfo?.class_of_company || "",
        is_registered: companyInfo?.company_status?.toLowerCase() === "active" ? "yes" : "no",
        corporate_address: companyInfo?.registered_address || "",
        corporate_state: extractState(companyInfo?.registered_address || ""),
        corporate_pin: extractPin(companyInfo?.registered_address || ""),
        contact_no: "",  // Not available from Surepass
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
