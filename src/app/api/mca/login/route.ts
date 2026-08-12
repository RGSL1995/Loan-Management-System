import { NextRequest, NextResponse } from "next/server";
let puppeteer: any;
try {
  puppeteer = require("puppeteer");
} catch (e) {
  console.log("Puppeteer not installed yet, using mock mode");
}

interface MCASession {
  sessionId: string;
  page: any;
  browser: any;
  expiresAt: number;
}

// In-memory store for sessions (replace with Redis in production)
const sessions = new Map<string, MCASession>();

export async function POST(request: NextRequest) {
  let browser = null;
  let page = null;

  try {
    const { mcaUsername, mcaPassword } = await request.json();

    if (!mcaUsername || !mcaPassword) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check if Puppeteer is available
    if (!puppeteer) {
      console.log("Puppeteer not available, using mock session");
      const sessionId = `mca_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return NextResponse.json({
        success: true,
        sessionId,
        message: "Mock mode: OTP verification will be simulated. Please enter any 6-digit number.",
        isMockMode: true,
      });
    }

    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    page = await browser.newPage();
    page.setDefaultTimeout(30000);

    // Navigate to MCA signin page
    console.log("Navigating to MCA portal...");
    await page.goto("https://www.mca.gov.in/", {
      waitUntil: "networkidle2",
    });

    // Look for signin button and click it
    try {
      const signinLink = await page.$('a[href*="signin"], button:contains("Sign In")');
      if (signinLink) {
        await signinLink.click();
        await page.waitForNavigation({ waitUntil: "networkidle2" });
      }
    } catch (e) {
      console.log("Could not find signin link, trying direct URL");
    }

    // Navigate to signin page directly
    await page.goto("https://www.mca.gov.in/signin", {
      waitUntil: "networkidle2",
    });

    // Enter username
    console.log("Entering credentials...");
    const usernameSelector = 'input[type="email"], input[name*="email"], input[name*="username"]';
    await page.waitForSelector(usernameSelector, { timeout: 10000 });
    await page.type(usernameSelector, mcaUsername);

    // Enter password
    const passwordSelector = 'input[type="password"]';
    await page.waitForSelector(passwordSelector, { timeout: 10000 });
    await page.type(passwordSelector, mcaPassword);

    // Submit login form
    console.log("Submitting login form...");
    const submitButton = await page.$('button[type="submit"], button:contains("Sign In"), button:contains("Login")');
    if (submitButton) {
      await submitButton.click();
    } else {
      await page.keyboard.press("Enter");
    }

    // Wait for OTP screen or redirect
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 }).catch(() => {
      console.log("Navigation timeout - OTP might be loading");
    });

    // Check if we're on OTP screen
    const otpScreenVisible = await page.$('input[type="text"][name*="otp"], input[placeholder*="OTP"]');

    if (otpScreenVisible) {
      console.log("OTP screen detected");
      // Store the session for OTP verification later
      const sessionId = `mca_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      sessions.set(sessionId, {
        sessionId,
        page,
        browser,
        expiresAt,
      });

      return NextResponse.json({
        success: true,
        sessionId,
        message: "OTP has been sent to your registered email/mobile. Please enter it to proceed.",
      });
    } else {
      // If no OTP screen, check for error messages
      const errorElement = await page.$(".error, .alert-danger, [class*='error']");
      if (errorElement) {
        const errorText = await errorElement.evaluate((el: any) => el.textContent);
        throw new Error(`MCA Login Error: ${errorText}`);
      }

      // Close browser if login succeeded without OTP (unusual)
      if (browser) {
        await browser.close();
      }

      throw new Error("Unexpected login flow - OTP screen not found");
    }
  } catch (error: any) {
    // Clean up on error
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

    console.error("MCA Login Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to initiate login. Please check your credentials." },
      { status: 500 }
    );
  }
}
