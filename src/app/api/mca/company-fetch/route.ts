import { NextRequest, NextResponse } from "next/server";

/**
 * MCA Company Data Fetch with Manual CAPTCHA/OTP
 *
 * Flow:
 * 1. User provides MCA credentials
 * 2. Open visible browser, navigate to MCA
 * 3. Auto-fill credentials
 * 4. User manually solves CAPTCHA
 * 5. User manually enters OTP
 * 6. After login detected, fetch company details
 * 7. Return extracted data
 */

async function fetchCompanyFromMCAPortal(
  companyName: string,
  mcaUsername: string,
  mcaPassword: string
): Promise<any> {
  console.log(`\n🚀 MCA COMPANY FETCH (Manual CAPTCHA/OTP)`);
  console.log("=".repeat(60));
  console.log(`Company Name: ${companyName}`);
  console.log(`Username: ${mcaUsername}`);
  console.log("=".repeat(60));

  let browser: any;
  let page: any;

  try {
    let puppeteer: any;
    try {
      puppeteer = (await import("puppeteer")).default;
    } catch (e) {
      console.log("⚠️  Puppeteer not available");
      return {};
    }

    // Launch visible browser (not headless) so user can interact
    console.log("🌐 Launching visible browser for manual CAPTCHA/OTP entry...");
    browser = await puppeteer.launch({
      headless: false, // VISIBLE browser
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
      timeout: 30000,
    });

    page = await browser.newPage();
    page.setDefaultTimeout(30000);

    // Set stealth mode
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 900 });

    // Navigate to MCA portal
    console.log("📡 Navigating to MCA portal...");
    try {
      await page.goto("https://www.mca.gov.in/content/mca/global/en/foportal/fologin.html", {
        waitUntil: "networkidle2",
        timeout: 20000,
      });
      console.log("✅ MCA portal loaded");
    } catch (e) {
      console.log("⚠️  Navigation error, continuing:", e.message);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Auto-fill credentials
    console.log("📝 Auto-filling credentials...");
    const usernameField = await page.$('input[type="email"], input[type="text"][name*="email"], input[name*="user"]').catch(() => null);
    if (usernameField) {
      await usernameField.type(mcaUsername);
      console.log("✅ Username entered");
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const passwordField = await page.$('input[type="password"]').catch(() => null);
    if (passwordField) {
      await passwordField.type(mcaPassword);
      console.log("✅ Password entered");
    }

    console.log("\n⏸️  WAITING FOR USER INPUT:");
    console.log("1️⃣  Solve the CAPTCHA that appears on the MCA portal");
    console.log("2️⃣  Enter the OTP sent to your registered email/mobile");
    console.log("3️⃣  The system will automatically fetch company data after successful login");
    console.log("⏸️  This browser window will stay open for 5 minutes. Please complete the login.\n");

    // Wait for user to complete login by checking for successful login indicators
    // Timeout after 5 minutes
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes
    const pollInterval = 2000; // Check every 2 seconds
    const startTime = Date.now();

    let loginSuccessful = false;
    while (Date.now() - startTime < maxWaitTime && !loginSuccessful) {
      try {
        // Check if user has navigated to dashboard/company search page
        const currentUrl = page.url();
        const pageText = await page.evaluate(() => document.body.innerText);

        // Indicators of successful login
        if (
          currentUrl.includes("dashboard") ||
          currentUrl.includes("company") ||
          pageText.includes("Search Company") ||
          pageText.includes("Company Information")
        ) {
          console.log("✅ Login successful detected!");
          loginSuccessful = true;
          break;
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    if (!loginSuccessful) {
      throw new Error("Login timeout - User did not complete login within 5 minutes");
    }

    // After login, search for company
    console.log(`🔎 Searching for company: ${companyName}`);

    // Look for search box and enter company name
    const searchBox = await page.$('input[placeholder*="search"], input[placeholder*="company"], input[type="text"]').catch(() => null);
    if (searchBox) {
      await searchBox.type(companyName);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.keyboard.press("Enter");
      console.log("✅ Company search initiated");
    }

    // Wait for search results
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract company details from the page
    console.log("📊 Extracting company details...");
    const details = await page.evaluate(() => {
      const data: any = {};
      const pageText = document.body.textContent || "";

      // Extract company name
      const headings = Array.from(document.querySelectorAll('h1, h2, strong'));
      for (const heading of headings) {
        const text = heading.textContent?.trim() || "";
        if (text.length > 10 && text.match(/[A-Z]/)) {
          data.entity_name = text;
          break;
        }
      }

      // Extract CIN
      let cinMatch = pageText.match(/CIN[:\s]+([A-Z][A-Z0-9]{10}[A-Z0-9]{3})/i);
      if (!cinMatch) {
        cinMatch = pageText.match(/CIN[:\s]*\n\s*([A-Z][A-Z0-9]{10}[A-Z0-9]{3})/i);
      }
      if (cinMatch) data.cin_llpin = cinMatch[1].trim();

      // Extract Date of Incorporation
      let dotMatch = pageText.match(/Date of Incorporation[:\s]*(\d{4})-(\d{2})-(\d{2})/i);
      if (!dotMatch) {
        dotMatch = pageText.match(/Date of Incorporation[:\s]*\n\s*(\d{4})-(\d{2})-(\d{2})/i);
      }
      if (dotMatch) {
        data.dol = `${dotMatch[3]}-${dotMatch[2]}-${dotMatch[1]}`;
      }

      // Extract PAN
      let panMatch = pageText.match(/PAN[:\s]+([A-Z]{5}[A-Z0-9]{4}[A-Z])/i);
      if (!panMatch) {
        panMatch = pageText.match(/PAN[:\s]*\n\s*([A-Z]{5}[A-Z0-9]{4}[A-Z])/i);
      }
      if (panMatch) data.pan = panMatch[1].trim();

      // Extract GSTIN
      let gstinMatch = pageText.match(/GSTIN[:\s]+([A-Z0-9]{15})/i);
      if (!gstinMatch) {
        gstinMatch = pageText.match(/GSTIN[:\s]*\n\s*([A-Z0-9]{15})/i);
      }
      if (gstinMatch) data.gstin_uin = gstinMatch[1].trim();

      // Extract address
      const addressIdx = pageText.indexOf("Registered address");
      if (addressIdx > -1) {
        const afterAddress = pageText.substring(addressIdx + 18);
        const endIdx = afterAddress.search(/\n[A-Z][A-Z\s]{5,}/) || 200;
        const addressText = afterAddress.substring(0, endIdx).trim();
        data.corporate_address = addressText;

        // Extract PIN
        const pinMatch = addressText.match(/(\d{6})/);
        if (pinMatch) {
          data.corporate_pin = pinMatch[1];
          data.corporate_address = addressText.replace(/\s*\d{6}/, '').trim();
        }

        // Extract state
        const stateMatch = addressText.match(
          /(Uttar Pradesh|Delhi|Maharashtra|Karnataka|Tamil Nadu|Gujarat|West Bengal|Punjab|Rajasthan|Madhya Pradesh|Andhra Pradesh|Telangana|Bihar|Haryana|Jharkhand|Odisha|Chhattisgarh|Assam|Kerala|Goa|Uttarakhand|Himachal Pradesh|Tripura|Meghalaya|Manipur|Mizoram|Nagaland|Sikkim|Arunachal Pradesh)/i
        );
        if (stateMatch) data.corporate_state = stateMatch[1];
      }

      // Extract email
      let emailMatch = pageText.match(/Email[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+)/i);
      if (!emailMatch) {
        emailMatch = pageText.match(/Email[:\s]*\n\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+)/i);
      }
      if (emailMatch) data.contact_email = emailMatch[1].trim();

      // Extract status
      if (pageText.includes("Active")) {
        data.is_registered = "yes";
      }

      // Extract company type
      let typeMatch = pageText.match(/Class of Company[:\s]+(Private|Public)/i);
      if (!typeMatch) {
        typeMatch = pageText.match(/Class of Company[:\s]*\n\s*(Private|Public)/i);
      }
      if (typeMatch) {
        const type = typeMatch[1].toLowerCase();
        data.company_type = type === "private" ? "pvt_ltd" : "public";
      }

      return data;
    });

    console.log("✅ Data extraction completed");
    return details;

  } catch (error: any) {
    console.log("❌ Error:", error.message);
    throw error;
  } finally {
    // Close browser
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // ignore
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // ignore
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyName, mcaUsername, mcaPassword } = await request.json();

    if (!companyName || !mcaUsername || !mcaPassword) {
      return NextResponse.json(
        { success: false, error: "Company name, username, and password are required" },
        { status: 400 }
      );
    }

    const data = await fetchCompanyFromMCAPortal(companyName, mcaUsername, mcaPassword);

    return NextResponse.json({
      success: true,
      data: {
        entity_name: companyName,
        ...data,
      },
      message: "Company details fetched from MCA portal",
      source: "mca",
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch company details",
      },
      { status: 500 }
    );
  }
}
