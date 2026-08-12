import { NextRequest, NextResponse } from "next/server";

interface MCASession {
  sessionId: string;
  expiresAt: number;
  credentials?: { username: string; password: string };
}

// In-memory store for sessions
const sessions = new Map<string, MCASession>();

// Mock company data generator
const generateMockCompanyData = (companyName: string) => ({
  entity_name: companyName,
  cin_llpin: "U" + Math.random().toString(36).substring(2, 7).toUpperCase() + "2023PLC" + Math.random().toString().substring(2, 6),
  pan: "AA" + Math.random().toString().substring(2, 6).toUpperCase() + "0000",
  dol: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  company_type: "pvt_ltd",
  registration_status: "Active",
  corporate_address: "123 Business Street, Noida, Uttar Pradesh",
  corporate_state: "Uttar Pradesh",
  corporate_pin: "201301",
  registered_address: "123 Business Street, Noida, Uttar Pradesh",
  registered_state: "Uttar Pradesh",
  registered_pin: "201301",
  contact_no: "011-" + Math.floor(Math.random() * 90000000 + 10000000),
  contact_email: companyName.toLowerCase().replace(/\s+/g, '') + "@company.com",
  gstin_uin: "07AABCT" + Math.random().toString().substring(2, 6).toUpperCase() + "Z5",
  directors: [
    { name: "Director One", din: "00123456", designation: "Director" },
    { name: "Director Two", din: "00234567", designation: "Director" },
  ],
});

export async function POST(request: NextRequest) {
  try {
    const { companyName, sessionId, otp } = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { success: false, error: "Company name is required" },
        { status: 400 }
      );
    }

    if (!sessionId || !otp) {
      return NextResponse.json(
        { success: false, error: "Session ID and OTP are required" },
        { status: 400 }
      );
    }

    // Retrieve the session
    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session expired or invalid. Please login again." },
        { status: 400 }
      );
    }

    if (Date.now() > session.expiresAt) {
      sessions.delete(sessionId);
      return NextResponse.json(
        { success: false, error: "Session expired. Please login again." },
        { status: 400 }
      );
    }

    console.log("OTP verified (demo mode) - fetching mock company data");

    // TODO: Production mode - Replace with actual Puppeteer automation
    // const puppeteer = await import("puppeteer");
    // const browser = await puppeteer.default.launch({ headless: true });
    // const page = await browser.newPage();
    // ... complete login with stored credentials
    // ... submit OTP
    // ... search for company
    // ... extract real data
    // ... close browser

    // Clean up session
    sessions.delete(sessionId);

    return NextResponse.json({
      success: true,
      data: generateMockCompanyData(companyName),
      message: "Company details fetched successfully (demo mode)",
    });
  } catch (error: any) {
    console.error("MCA Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch company details from MCA" },
      { status: 500 }
    );
  }
}
