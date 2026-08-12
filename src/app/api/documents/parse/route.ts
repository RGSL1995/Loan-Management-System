import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Check if API key is set
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set");
      return NextResponse.json(
        { success: false, error: "API key not configured. Please set ANTHROPIC_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as "loan_application" | "sanction_letter";
    const mimeType = file?.type;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate mime type - PDFs and images
    const supportedFormats = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!supportedFormats.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: "Please upload PDF, JPG, PNG, or WebP files." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const prompt = createParsingPrompt(documentType);

    // Send directly to Claude - it handles PDFs and images natively
    const content: any[] = [
      {
        type: "document",
        source: {
          type: "base64",
          media_type: mimeType,
          data: base64,
        },
      },
      {
        type: "text",
        text: prompt,
      },
    ];

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error?.message || JSON.stringify(error);
      console.error("Claude API Error Response:", error);
      throw new Error(`Claude API error: ${errorMessage}`);
    }

    const result = await response.json();

    // Handle different response structures
    if (!result.content || !result.content[0]) {
      console.error("Unexpected response structure:", result);
      return NextResponse.json(
        { success: false, error: "Unexpected API response format" },
        { status: 500 }
      );
    }

    const responseText = result.content[0].text;

    if (!responseText) {
      console.error("No text in response:", result.content[0]);
      return NextResponse.json(
        { success: false, error: "No text extracted from response" },
        { status: 500 }
      );
    }

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not find JSON in response:", responseText.substring(0, 200));
      return NextResponse.json(
        { success: false, error: "Could not parse document. Please fill the form manually." },
        { status: 400 }
      );
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: parsedData,
      message: "Document parsed successfully",
    });
  } catch (error: any) {
    console.error("Document parsing error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to parse document" },
      { status: 500 }
    );
  }
}

function createParsingPrompt(documentType: "loan_application" | "sanction_letter"): string {
  if (documentType === "loan_application") {
    return `You are an expert document parser. Extract all loan application information from this document and return ONLY valid JSON (no markdown, no extra text, just pure JSON).

Extract the following information and organize it as JSON:

{
  "loan_amount": "extracted loan amount as string",
  "loan_tenure": "tenure in months as string",
  "loan_purpose": "purpose of loan",
  "loan_facility_type": "type of facility",
  "branch": "noida or delhi",
  "applicant_type": "individual or corporate or others",
  "individual": {
    "name": "applicant name",
    "father_husband_name": "father/husband name",
    "gender": "male/female",
    "marital_status": "married/single/others",
    "dob": "date of birth in YYYY-MM-DD format",
    "qualification": "high_school/graduate/post_graduate/professional",
    "occupation": "salaried/business/housewife/others",
    "pan": "PAN number",
    "aadhaar": "Aadhaar number",
    "passport": "passport number",
    "mobile": "mobile number",
    "landline": "landline number",
    "email": "email address",
    "current_address": "current residential address",
    "current_state": "state",
    "current_city": "city",
    "current_pin": "PIN code",
    "residence_type": "rented/owned/other",
    "years_of_residence": "years as number",
    "permanent_address": "permanent address",
    "permanent_state": "state",
    "permanent_city": "city",
    "permanent_pin": "PIN code",
    "work_office_name": "office name",
    "work_address": "work address",
    "work_city": "work city",
    "work_pin": "work PIN",
    "work_landmark": "landmark",
    "work_landline": "work landline",
    "work_email": "work email"
  },
  "business": {
    "company_type": "public/pvt_ltd/partnership/llp",
    "is_registered": "yes/no",
    "entity_name": "company name",
    "dol": "date of incorporation in YYYY-MM-DD",
    "pan": "company PAN",
    "cin_llpin": "CIN/LLPIN/Reg No",
    "corporate_address": "corporate address",
    "corporate_state": "state",
    "corporate_pin": "PIN code",
    "contact_no": "contact number",
    "contact_email": "email",
    "registered_address": "registered office address",
    "registered_state": "state",
    "registered_pin": "PIN code",
    "ownership_type": "ownership type",
    "gstin_uin": "GSTIN/UIN"
  },
  "collaterals": [
    {
      "type": "plot/flat/land/project/builder_floor",
      "charge_type": "equitable_mortgage",
      "property_age": "less_5/5_15/15_25/25_40/above_40",
      "property_status": "ready/under_construction",
      "address": "collateral address",
      "details": "property details",
      "taluka": "taluka/tehsil",
      "village_city": "village/city",
      "pin": "PIN code"
    }
  ],
  "confidence_scores": {
    "loan_amount": 0.95,
    "applicant_name": 0.98,
    ...
  }
}

IMPORTANT:
- Only include fields that are clearly visible in the document
- For confidence scores, use values between 0.0 and 1.0 (1.0 = 100% confident)
- If a field is not found, omit it from the JSON (don't use null)
- Return ONLY the JSON object, no other text or markdown
- Ensure all dates are in YYYY-MM-DD format
- For amounts, extract as strings (e.g., "500000" or "5,00,000")`;
  } else {
    // sanction_letter
    return `You are an expert document parser. Extract all loan details from this sanction letter and return ONLY valid JSON (no markdown, no extra text, just pure JSON).

Extract the following information:

{
  "loan_amount": "sanctioned loan amount",
  "loan_tenure": "tenure/period in months",
  "loan_purpose": "purpose of loan",
  "loan_facility_type": "type of facility",
  "individual": {
    "name": "borrower name",
    "pan": "PAN if mentioned",
    "aadhaar": "Aadhaar if mentioned",
    "mobile": "contact number",
    "email": "email address",
    "current_address": "address mentioned"
  },
  "processing_fees": {
    "amount": "processing fee amount",
    "instrument_type": "cheque/dd/online",
    "instrument_no": "instrument number if mentioned",
    "bank_name": "bank name",
    "instrument_date": "date in YYYY-MM-DD"
  },
  "collaterals": [
    {
      "type": "property type if mentioned",
      "charge_type": "equitable_mortgage",
      "address": "property address if mentioned"
    }
  ],
  "other_details": "any other important details",
  "confidence_scores": {
    "loan_amount": 0.98,
    "borrower_name": 0.95,
    ...
  }
}

IMPORTANT:
- Extract only information clearly visible in the sanction letter
- Use confidence scores (0.0 to 1.0) for each extracted field
- Omit fields that are not found in the document
- Return ONLY the JSON object, no other text`;
  }
}
