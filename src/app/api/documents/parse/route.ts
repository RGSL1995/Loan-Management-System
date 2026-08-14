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

    // Validate file size (20MB max - Claude API limit)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds 20MB limit. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
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
        model: "claude-opus-5",
        max_tokens: 4096,
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
    if (!result.content || result.content.length === 0) {
      console.error("Unexpected response structure:", result);
      return NextResponse.json(
        { success: false, error: "Unexpected API response format" },
        { status: 500 }
      );
    }

    // Find the text content (skip thinking blocks)
    let responseText: string | null = null;
    for (const block of result.content) {
      if (block.type === "text") {
        responseText = block.text;
        break;
      }
    }

    if (!responseText) {
      console.error("No text content in response:", result.content);
      return NextResponse.json(
        { success: false, error: "No text extracted from response. Please try uploading a clearer document." },
        { status: 500 }
      );
    }

    // Parse JSON from response with better error handling
    let parsedData: any = null;
    let jsonText = responseText.trim();

    // Try to extract JSON - find first { and match closing }
    const startIdx = jsonText.indexOf("{");
    if (startIdx === -1) {
      console.error("No JSON object found in response:", responseText.substring(0, 300));
      return NextResponse.json(
        { success: false, error: "Could not find data in document. Please fill the form manually." },
        { status: 400 }
      );
    }

    // Find matching closing brace
    let braceCount = 0;
    let endIdx = -1;
    for (let i = startIdx; i < jsonText.length; i++) {
      if (jsonText[i] === "{") braceCount++;
      if (jsonText[i] === "}") {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }

    if (endIdx === -1) {
      console.error("Could not find matching closing brace in response");
      console.error("Response text (first 1000 chars):", responseText.substring(0, 1000));
      return NextResponse.json(
        { success: false, error: "Invalid response format from document parser" },
        { status: 400 }
      );
    }

    const extractedJson = jsonText.substring(startIdx, endIdx);
    console.log("DEBUG: Extracted JSON length:", extractedJson.length);
    console.log("DEBUG: Extracted JSON (first 500 chars):", extractedJson.substring(0, 500));

    try {
      parsedData = JSON.parse(extractedJson);
      console.log("✅ Successfully parsed JSON, extracted fields:", Object.keys(parsedData));
    } catch (parseError: any) {
      console.error("❌ JSON Parse Error:", parseError.message);
      console.error("Extracted JSON (chars 0-500):", extractedJson.substring(0, 500));
      console.error("Extracted JSON (chars around error):", extractedJson.substring(Math.max(0, parseError.message.includes("position") ? parseInt(parseError.message.match(/\d+/)?.[0] || "0") - 100 : 0), Math.max(0, parseInt(parseError.message.match(/\d+/)?.[0] || "0")) + 100));

      return NextResponse.json(
        {
          success: false,
          error: "Document parsed but data format is invalid. Please fill the form manually.",
          details: parseError.message
        },
        { status: 400 }
      );
    }

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

CRITICAL JSON RULES:
- ONLY include fields that are clearly visible in the document
- If a field is not found, DO NOT include it (omit completely, no null values)
- NO trailing commas in arrays or objects
- ALL string values must be wrapped in double quotes
- ALL dates must be in YYYY-MM-DD format
- Return ONLY valid JSON (no markdown, no code blocks, no extra text)
- Test your JSON is valid before returning
- Do NOT include any fields with undefined or null values`;
  } else {
    // sanction_letter
    return `You are an expert document parser. Extract all loan details from this sanction letter and return ONLY valid JSON (no markdown, no extra text, just pure JSON).

Extract the following information:

{
  "loan_amount": "NUMERIC VALUE ONLY (extract just the number, e.g., 175000000)",
  "loan_tenure": "NUMERIC VALUE ONLY in months (extract just the number, e.g., 72)",
  "loan_purpose": "purpose of loan",
  "loan_facility_type": "type of facility",
  "applicant_type": "individual or corporate or others",
  "individual": {
    "name": "borrower/company name",
    "pan": "PAN if mentioned",
    "aadhaar": "Aadhaar if mentioned",
    "mobile": "contact number",
    "email": "email address",
    "current_address": "address mentioned"
  },
  "business": {
    "entity_name": "company name if corporate",
    "pan": "company PAN if mentioned",
    "cin_llpin": "CIN/LLPIN if mentioned"
  },
  "processing_fees": {
    "amount": "processing fee amount as number",
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
    "borrower_name": 0.95
  }
}

CRITICAL RULES:
- loan_amount: ONLY numeric value (remove Rs., commas, dashes, text). Example: "1,75,00,00,000" → 175000000
- loan_tenure: ONLY numeric value in months. Example: "72 Months from..." → 72
- applicant_type: "corporate" if company/pvt ltd, "individual" if person, "others" otherwise
- For corporate: set business.entity_name AND individual.name to company name
- NO trailing commas in arrays/objects
- NO null or undefined values - OMIT missing fields completely
- ALL string values in double quotes
- Dates MUST be YYYY-MM-DD format
- Return ONLY valid JSON (test it before responding)
- NO markdown, NO code blocks, NO extra text`;
  }
}
