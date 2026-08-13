import { NextRequest, NextResponse } from "next/server";

interface MCASession {
  sessionId: string;
  expiresAt: number;
  credentials?: { username: string; password: string };
}

// In-memory store for sessions
const sessions = new Map<string, MCASession>();

/**
 * Fetch company details from Zaubacorp.com
 * Zaubacorp is a public company information database
 * URL: https://www.zaubacorp.com
 */
async function fetchFromZaubacorp(companyName: string): Promise<any> {
  console.log(`🔍 Searching for company on Zaubacorp: ${companyName}`);

  try {
    let puppeteer: any;
    try {
      puppeteer = (await import("puppeteer")).default;
    } catch (e) {
      console.log("⚠️  Puppeteer not available, using mock data");
      return null;
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 30000,
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(15000);

    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Navigate to Zaubacorp
    console.log("📡 Navigating to Zaubacorp...");
    await page.goto("https://www.zaubacorp.com", {
      waitUntil: "networkidle2",
      timeout: 15000,
    });

    // Search for company
    console.log(`🔎 Searching for: ${companyName}`);
    const searchBox = await page.$('input[placeholder*="search"], input[placeholder*="company"], input[type="text"]');
    if (!searchBox) {
      console.log("⚠️  Search box not found");
      await browser.close();
      return null;
    }

    await searchBox.type(companyName);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.keyboard.press("Enter");

    // Wait for results
    console.log("⏳ Waiting for search results...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Try to extract company details from search results
    const companyLink = await page.$('a[href*="/company/"]');
    if (companyLink) {
      console.log("✅ Company found, clicking...");
      await companyLink.click();
      await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract company details
      const details = await page.evaluate(() => {
        const data: any = {};

        // Generic extraction - look for common patterns
        const getText = (selector: string) => {
          const el = document.querySelector(selector);
          return el ? el.textContent?.trim() : "";
        };

        const findByLabel = (labelText: string) => {
          const elements = Array.from(document.querySelectorAll('*'));
          for (const el of elements) {
            if (el.textContent?.includes(labelText)) {
              const next = el.nextElementSibling || el.parentElement?.nextElementSibling;
              return next ? next.textContent?.trim() : "";
            }
          }
          return "";
        };

        // Try to extract data
        data.entity_name = getText('h1') || getText('h2') || "";
        data.cin_llpin = findByLabel("CIN") || findByLabel("LLPIN") || "";
        data.pan = findByLabel("PAN") || "";
        data.dol = findByLabel("Date") || findByLabel("Incorporation") || "";
        data.corporate_address = findByLabel("Address") || "";
        data.contact_no = findByLabel("Phone") || findByLabel("Mobile") || "";
        data.contact_email = findByLabel("Email") || "";
        data.gstin_uin = findByLabel("GSTIN") || findByLabel("GST") || "";

        return data;
      });

      await browser.close();
      return details;
    }

    await browser.close();
    return null;
  } catch (error: any) {
    console.log("⚠️  Zaubacorp fetch failed:", error.message);
    return null;
  }
}


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

    console.log(`\n🚀 COMPANY DATA FETCH - ${companyName}`);
    console.log("=".repeat(60));

    // Fetch from Zaubacorp only - NO MOCK FALLBACK
    const zaubacorpData = await fetchFromZaubacorp(companyName);

    // Clean up session
    sessions.delete(sessionId);

    if (zaubacorpData && zaubacorpData.entity_name) {
      console.log("✅ Company details fetched from Zaubacorp");
      return NextResponse.json({
        success: true,
        data: zaubacorpData,
        message: "Company details fetched from Zaubacorp",
        source: "zaubacorp",
      });
    } else {
      console.log("❌ Company not found on Zaubacorp");
      return NextResponse.json(
        {
          success: false,
          error: `Company "${companyName}" not found on Zaubacorp. Please enter the exact company name.`
        },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch company details" },
      { status: 500 }
    );
  }
}
