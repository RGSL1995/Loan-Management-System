import { NextRequest, NextResponse } from "next/server";

interface MCASession {
  sessionId: string;
  page: any;
  browser: any;
  expiresAt: number;
}

// In-memory store for sessions (must match login route's sessions)
const sessions = new Map<string, MCASession>();

// Mock company data (for demo/testing)
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

    // Check if this is a mock session
    if (sessionId.includes("mock")) {
      console.log("Mock mode: Returning sample company data");
      return NextResponse.json({
        success: true,
        data: generateMockCompanyData(companyName),
        message: "Company details fetched (mock mode - Puppeteer will use real data once installed)",
      });
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
      if (session.browser) await session.browser.close();
      return NextResponse.json(
        { success: false, error: "Session expired. Please login again." },
        { status: 400 }
      );
    }

    const { page, browser } = session;

    try {
      // Enter OTP
      console.log("Entering OTP...");
      const otpInput = await page.$('input[type="text"][name*="otp"], input[placeholder*="OTP"]');
      if (otpInput) {
        await otpInput.type(otp);
      } else {
        throw new Error("OTP input field not found");
      }

      // Submit OTP
      console.log("Submitting OTP...");
      const submitButton = await page.$('button[type="submit"], button:contains("Verify"), button:contains("Submit")');
      if (submitButton) {
        await submitButton.click();
      } else {
        await page.keyboard.press("Enter");
      }

      // Wait for navigation after OTP verification
      await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {
        console.log("OTP verification in progress...");
      });

      // Navigate to company search
      console.log("Navigating to company search...");
      await page.goto("https://www.mca.gov.in/companySearch", {
        waitUntil: "networkidle2",
        timeout: 15000,
      }).catch(() => {
        console.log("Direct navigation failed, trying alternate URL");
      });

      // Search for company by name
      console.log(`Searching for company: ${companyName}`);
      const searchInput = await page.$('input[name*="search"], input[placeholder*="company"]');
      if (!searchInput) {
        throw new Error("Company search input not found on MCA portal");
      }

      await searchInput.type(companyName);
      await page.waitForTimeout(500);

      // Look for search results
      const searchButton = await page.$('button:contains("Search"), button[type="submit"]');
      if (searchButton) {
        await searchButton.click();
        await page.waitForTimeout(2000);
      }

      // Get first result and click it
      const firstResult = await page.$('a[href*="companyProfile"], tr[role="row"] a, .search-result a');
      if (firstResult) {
        await firstResult.click();
        await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 });
      }

      // Extract company details
      console.log("Extracting company details...");
      const companyData = await page.evaluate(() => {
        const data: any = {};

        // Try multiple selectors for each field
        const selectors = {
          entity_name: ['span:contains("Name")', 'td:contains("Name") + td', '[data-field="company_name"]'],
          cin_llpin: ['span:contains("CIN")', 'td:contains("CIN") + td', '[data-field="cin"]'],
          pan: ['span:contains("PAN")', 'td:contains("PAN") + td', '[data-field="pan"]'],
          dol: ['span:contains("Incorporation")', 'td:contains("Date") + td', '[data-field="incorporation_date"]'],
          corporate_address: ['span:contains("Address")', 'td:contains("Address") + td', '[data-field="address"]'],
          contact_no: ['span:contains("Phone")', 'td:contains("Phone") + td', '[data-field="phone"]'],
          contact_email: ['span:contains("Email")', 'td:contains("Email") + td', '[data-field="email"]'],
          gstin_uin: ['span:contains("GSTIN")', 'td:contains("GSTIN") + td', '[data-field="gstin"]'],
        };

        for (const [field, selectorList] of Object.entries(selectors)) {
          for (const selector of selectorList as string[]) {
            const element = document.querySelector(selector);
            if (element) {
              data[field] = element.textContent?.trim() || "";
              break;
            }
          }
        }

        return data;
      });

      // Clean up session
      sessions.delete(sessionId);
      if (page) await page.close();
      if (browser) await browser.close();

      return NextResponse.json({
        success: true,
        data: companyData || {
          entity_name: companyName,
          message: "Company details partially retrieved - some fields may need manual entry",
        },
        message: "Company details fetched successfully from MCA",
      });
    } catch (innerError: any) {
      // Clean up on error
      sessions.delete(sessionId);
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.log("Error closing page:", e);
        }
      }
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          console.log("Error closing browser:", e);
        }
      }

      throw innerError;
    }
  } catch (error: any) {
    console.error("MCA Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch company details from MCA" },
      { status: 500 }
    );
  }
}
