"use server";

import { createClient } from "@/lib/supabase/server";

interface ParsedDocumentData {
  loan_amount?: string;
  loan_tenure?: string;
  loan_purpose?: string;
  loan_facility_type?: string;
  applicant_type?: "individual" | "business";
  individual?: {
    name?: string;
    father_husband_name?: string;
    gender?: string;
    marital_status?: string;
    dob?: string;
    qualification?: string;
    occupation?: string;
    pan?: string;
    aadhaar?: string;
    passport?: string;
    mobile?: string;
    landline?: string;
    email?: string;
    current_address?: string;
    current_state?: string;
    current_city?: string;
    current_pin?: string;
    residence_type?: string;
    years_of_residence?: string;
    permanent_address?: string;
    permanent_state?: string;
    permanent_city?: string;
    permanent_pin?: string;
    work_office_name?: string;
    work_address?: string;
    work_city?: string;
    work_pin?: string;
    work_landmark?: string;
    work_landline?: string;
    work_email?: string;
  };
  business?: {
    company_type?: string;
    is_registered?: string;
    entity_name?: string;
    dol?: string;
    pan?: string;
    cin_llpin?: string;
    corporate_address?: string;
    corporate_state?: string;
    corporate_pin?: string;
    contact_no?: string;
    contact_email?: string;
    registered_address?: string;
    registered_state?: string;
    registered_pin?: string;
    ownership_type?: string;
    gstin_uin?: string;
  };
  collaterals?: Array<{
    type?: string;
    charge_type?: string;
    property_age?: string;
    property_status?: string;
    address?: string;
    details?: string;
    taluka?: string;
    village_city?: string;
    pin?: string;
  }>;
  processing_fees?: {
    instrument_type?: string;
    instrument_no?: string;
    amount?: string;
    bank_name?: string;
    instrument_date?: string;
  };
  other_details?: string;
  confidence_scores?: Record<string, number>;
}

export async function parseDocumentWithClaude(
  base64Data: string,
  mimeType: string,
  documentType: "loan_application" | "sanction_letter"
): Promise<{
  success: boolean;
  data?: ParsedDocumentData;
  error?: string;
  message?: string;
}> {
  try {
    // Validate mime type
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(mimeType)) {
      return {
        success: false,
        error: "Invalid file format. Please upload PDF, JPG, PNG, or WebP.",
      };
    }

    // Note: Since we're using Claude API on the backend, we need to use a real API call
    // For MVP, we'll create a structured prompt for Claude to parse the document

    const prompt = createParsingPrompt(documentType);

    // Call Claude API via your backend endpoint
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType === "application/pdf" ? "image/png" : mimeType,
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || "Unknown error"}`);
    }

    const result = await response.json();
    const responseText = result.content[0].text;

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: "Could not parse document. Please fill the form manually.",
      };
    }

    const parsedData = JSON.parse(jsonMatch[0]) as ParsedDocumentData;

    return {
      success: true,
      data: parsedData,
      message: "Document parsed successfully",
    };
  } catch (error: any) {
    console.error("Document parsing error:", error);
    return {
      success: false,
      error: error?.message || "Failed to parse document",
    };
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
  "applicant_type": "individual or business",
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
      "charge_type": "mortgage/charge/hypothecation/pledge",
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
      "charge_type": "mortgage/charge if mentioned",
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

export async function validateExtractedData(
  data: ParsedDocumentData
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate loan details
  if (!data.loan_amount) {
    errors.push("Loan amount is required");
  } else if (isNaN(parseFloat(data.loan_amount))) {
    errors.push("Loan amount must be a valid number");
  }

  if (!data.applicant_type) {
    errors.push("Applicant type (individual/business) could not be determined");
  }

  // Validate individual applicant
  if (data.applicant_type === "individual") {
    if (!data.individual?.name) {
      errors.push("Applicant name is required");
    }
    if (!data.individual?.pan) {
      warnings.push("PAN number not found in document");
    }
  }

  // Validate business applicant
  if (data.applicant_type === "business") {
    if (!data.business?.entity_name) {
      errors.push("Business entity name is required");
    }
    if (!data.business?.pan) {
      warnings.push("Business PAN not found in document");
    }
  }

  // Check low confidence scores
  if (data.confidence_scores) {
    Object.entries(data.confidence_scores).forEach(([field, score]) => {
      if (score < 0.7) {
        warnings.push(`Low confidence (${(score * 100).toFixed(0)}%) for field: ${field}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
