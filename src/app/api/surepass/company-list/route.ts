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

    console.log(`[Surepass] Searching for companies matching: "${companyName}"`);

    // Name to CIN - get list of matching companies
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

    console.log(`[Surepass] Found ${companyList.length} matching companies`);

    // Return list of companies for user to select
    return NextResponse.json({
      success: true,
      companies: companyList.map((company: any) => ({
        cin: company.cin_number,
        name: company.company_name,
        type: company.company_type,
      })),
    });
  } catch (error) {
    console.error("[Surepass] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to search companies",
      },
      { status: 500 }
    );
  }
}
