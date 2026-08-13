import { NextRequest, NextResponse } from "next/server";

/**
 * Fetch company details from Zaubacorp.com
 * Simple API - no OTP, no MCA login required
 * Just search and return whatever data is available
 */

async function fetchFromZaubacorp(companyName: string): Promise<any> {
  console.log(`\n🚀 ZAUBACORP SEARCH`);
  console.log("=".repeat(60));
  console.log(`Company Name: ${companyName}`);
  console.log("=".repeat(60));

  try {
    let puppeteer: any;
    try {
      puppeteer = (await import("puppeteer")).default;
    } catch (e) {
      console.log("⚠️  Puppeteer not available");
      return {};
    }

    console.log("✅ Browser launched with stealth mode");

    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
      ],
      timeout: 30000,
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(15000);

    // Add stealth techniques to bypass anti-bot detection
    console.log("🕵️  Applying stealth techniques...");
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });

    // Set realistic headers
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    });
    console.log("✅ Stealth mode configured");

    // Navigate directly to search URL instead of using homepage search
    const searchUrl = `https://www.zaubacorp.com/search?q=${encodeURIComponent(companyName)}`;
    console.log(`📡 Navigating to search URL: ${searchUrl}`);
    try {
      await page.goto(searchUrl, {
        waitUntil: "networkidle2",
        timeout: 15000,
      });
      console.log("✅ Search page loaded");
    } catch (e) {
      console.log("❌ Failed to load search page:", e.message);
      await browser.close();
      return {};
    }

    // Wait a bit for results to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Look for company profile link on search results
    console.log("🔍 Looking for company profile link in search results...");
    const companyLink = await page.$('a[href*="/company/"], a[href*="/companies/"]');

    if (!companyLink) {
      console.log("❌ No company link found in search results");
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log("📄 Page text (first 1000 chars):", pageText.substring(0, 1000));
      await browser.close();
      return {};
    }

    console.log("✅ Found company profile link, navigating to it...");
    const companyHref = await companyLink.evaluate((node: any) => node.href);
    console.log(`📍 Company URL: ${companyHref}`);

    try {
      await page.goto(companyHref, {
        waitUntil: "networkidle2",
        timeout: 15000,
      });
      console.log("✅ Navigated to company profile");
    } catch (e) {
      console.log("⚠️  Navigation error, trying anyway:", e.message);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract data using a more robust approach
    console.log("📊 Extracting data from company profile...");
    const details = await page.evaluate(() => {
      const data: any = {
        __debug: {
          pageTextLength: 0,
          firstChars: "",
          headingsFound: 0
        }
      };
      const pageText = document.body.textContent || "";

      data.__debug.pageTextLength = pageText.length;
      data.__debug.firstChars = pageText.substring(0, 1000);

      // Extract company name from heading first
      const headings = Array.from(document.querySelectorAll('h1, h2, strong'));
      data.__debug.headingsFound = headings.length;
      for (const heading of headings) {
        const text = heading.textContent?.trim() || "";
        if (text.length > 10 && text.match(/[A-Z]/)) {
          data.entity_name = text;
          break;
        }
      }

      // Extract CIN - allow for flexible spacing/newlines
      let cinMatch = pageText.match(/CIN[:\s]+([A-Z][A-Z0-9]{10}[A-Z0-9]{3})/i);
      if (!cinMatch) {
        cinMatch = pageText.match(/CIN\s+([A-Z][A-Z0-9]{10}[A-Z0-9]{3})/i);
      }
      if (!cinMatch) {
        cinMatch = pageText.match(/CIN[:\s]*\n\s*([A-Z][A-Z0-9]{10}[A-Z0-9]{3})/i);
      }
      if (cinMatch) data.cin_llpin = cinMatch[1].trim();

      // Extract Date of Incorporation - more flexible pattern
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

      // Extract address - look for "Registered address" followed by address text
      let addressText = "";
      const addressIdx = pageText.indexOf("Registered address");
      if (addressIdx > -1) {
        let afterAddress = pageText.substring(addressIdx + 18);
        // Get text until we hit another section (all caps or key identifier)
        let endIdx = afterAddress.search(/\n[A-Z][A-Z\s]{5,}/);
        if (endIdx === -1) endIdx = 200;
        addressText = afterAddress.substring(0, endIdx).trim();
      }

      if (addressText) {
        data.corporate_address = addressText;

        // Extract PIN (6 digits, usually at end)
        const pinMatch = addressText.match(/(\d{6})/);
        if (pinMatch) {
          data.corporate_pin = pinMatch[1];
          // Remove PIN from address
          data.corporate_address = addressText.replace(/\s*\d{6}/, '').trim();
        }

        // Extract state
        const stateMatch = addressText.match(/(Uttar Pradesh|Delhi|Maharashtra|Karnataka|Tamil Nadu|Gujarat|West Bengal|Punjab|Rajasthan|Madhya Pradesh|Andhra Pradesh|Telangana|Bihar|Haryana|Jharkhand|Odisha|Chhattisgarh|Assam|Kerala|Goa|Uttarakhand|Himachal Pradesh|Tripura|Meghalaya|Manipur|Mizoram|Nagaland|Sikkim|Arunachal Pradesh)/i);
        if (stateMatch) {
          data.corporate_state = stateMatch[1];
        }
      }

      // Extract Email - more flexible
      let emailMatch = pageText.match(/Email[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+)/i);
      if (!emailMatch) {
        emailMatch = pageText.match(/Email[:\s]*\n\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+)/i);
      }
      if (emailMatch) data.contact_email = emailMatch[1].trim();

      // Extract status
      if (pageText.includes('Active')) {
        data.is_registered = 'yes';
      }

      // Extract Company Type
      let typeMatch = pageText.match(/Class of Company[:\s]+(Private|Public)/i);
      if (!typeMatch) {
        typeMatch = pageText.match(/Class of Company[:\s]*\n\s*(Private|Public)/i);
      }
      if (typeMatch) {
        const type = typeMatch[1].toLowerCase();
        data.company_type = type === 'private' ? 'pvt_ltd' : 'public';
      }

      return data;
    });

    await browser.close();
    console.log("✅ Browser closed");

    // Log debug info
    if (details.__debug) {
      console.log("\n📊 DEBUG INFO:");
      console.log("Page text length:", details.__debug.pageTextLength);
      console.log("Headings found:", details.__debug.headingsFound);
      console.log("\n📄 PAGE CONTENT (first 1500 chars):");
      console.log(details.__debug.firstChars);
      console.log("\n");
    }

    // Remove debug info before returning
    const { __debug, ...cleanDetails } = details;

    console.log("📈 Extraction summary - Found", Object.keys(cleanDetails).length, "fields");
    if (Object.keys(cleanDetails).length > 1) {
      console.log("✅ Multiple fields extracted successfully");
      return cleanDetails;
    } else {
      console.log("⚠️  Only basic data found");
      return cleanDetails;
    }

  } catch (error: any) {
    console.log("⚠️  Zaubacorp fetch error:", error.message);
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { success: false, error: "Company name is required" },
        { status: 400 }
      );
    }

    // Fetch from Zaubacorp
    const data = await fetchFromZaubacorp(companyName);

    // Always return success - even if empty, fill with what was found
    return NextResponse.json({
      success: true,
      data: {
        entity_name: companyName, // At minimum, include what user entered
        ...data // Merge in whatever was found
      },
      message: Object.keys(data).length > 0
        ? "Company details found on Zaubacorp"
        : "Company name stored (additional details not found on Zaubacorp)",
    });

  } catch (error: any) {
    console.error("Search Error:", error);

    // Still return success with company name
    return NextResponse.json({
      success: true,
      data: { entity_name: (await request.json()).companyName },
      message: "Company data will be filled manually",
    });
  }
}
