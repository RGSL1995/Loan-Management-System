import { NextRequest, NextResponse } from "next/server";

interface MCASession {
  sessionId: string;
  expiresAt: number;
  credentials?: { username: string; password: string };
  browser?: any;
  page?: any;
}

// In-memory store for sessions (replace with Redis in production)
const sessions = new Map<string, MCASession>();

/**
 * CHECKPOINT 1: MCA Website URL
 * Production URL: https://www.mca.gov.in/
 * Portal: https://www.mca.gov.in/signin or https://www.mca.gov.in/signin-sso
 * The real login happens at the eSign portal which requires:
 * - Email/Username
 * - Password
 * - CAPTCHA (checkpoint 2)
 * - OTP (sent to registered email/mobile)
 */

/**
 * CHECKPOINT 2: CAPTCHA Handling
 * MCA portal uses CAPTCHA on login page
 * Strategy: Use Claude's Vision API to solve it
 * - Take screenshot of CAPTCHA
 * - Send to Claude API with vision
 * - Get answer
 * - Input CAPTCHA answer
 *
 * Alternative: Use 2captcha or other CAPTCHA solving service
 */

async function solveCaptchaWithClaude(captchaImageBase64: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: captchaImageBase64,
              },
            },
            {
              type: "text",
              text: "This is a CAPTCHA image from MCA India portal. Please read the text in the image and provide only the text/numbers you see. Reply with just the text, nothing else.",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to solve CAPTCHA with Claude");
  }

  const result = await response.json();
  return result.content[0].text.trim();
}

/**
 * CHECKPOINT 3: Error Handling for Invalid Credentials
 * We need to detect:
 * - Invalid email/username → "User not found" error
 * - Invalid password → "Wrong password" error
 * - Account locked → "Too many login attempts" error
 * - Network issues → "Connection failed" error
 */

async function attemptMCALogin(mcaUsername: string, mcaPassword: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  browser?: any;
  page?: any;
}> {
  let browser: any;
  let page: any;

  try {
    console.log("🔍 CHECKPOINT 1: Attempting to connect to MCA website...");
    console.log("Target URL: https://www.mca.gov.in/signin");

    // Try to load Puppeteer
    let puppeteer: any;
    try {
      puppeteer = await import("puppeteer");
    } catch (e) {
      console.log("⚠️  Puppeteer not available - returning demo mode");
      return {
        success: true,
        message: "Demo mode: CAPTCHA solving and credential validation disabled",
      };
    }

    const { default: launch } = puppeteer;

    // Launch browser
    console.log("🌐 Launching browser...");
    browser = await launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 30000,
    });

    page = await browser.newPage();
    page.setDefaultTimeout(15000);

    // Navigate to MCA signin
    console.log("📡 Navigating to MCA portal...");
    await page.goto("https://www.mca.gov.in/signin", {
      waitUntil: "networkidle2",
      timeout: 15000,
    });

    console.log("✅ MCA website loaded successfully");

    // Step 1: Enter username
    console.log("📝 Entering credentials...");
    const usernameField = await page.$('input[type="email"], input[name*="email"], input[name*="username"]');
    if (!usernameField) {
      throw new Error("Username field not found on MCA login page");
    }
    await usernameField.type(mcaUsername);

    // Step 2: Enter password
    const passwordField = await page.$('input[type="password"]');
    if (!passwordField) {
      throw new Error("Password field not found on MCA login page");
    }
    await passwordField.type(mcaPassword);

    // Step 3: Handle CAPTCHA
    console.log("🔍 CHECKPOINT 2: Looking for CAPTCHA...");
    const captchaImage = await page.$('img[alt*="captcha"], img[alt*="CAPTCHA"], canvas');

    if (captchaImage) {
      console.log("🤖 CAPTCHA detected - attempting to solve with Claude API...");
      const captchaScreenshot = await captchaImage.screenshot({ encoding: "base64" });

      try {
        const captchaAnswer = await solveCaptchaWithClaude(captchaScreenshot);
        console.log(`✅ CAPTCHA solved: ${captchaAnswer}`);

        const captchaInput = await page.$('input[name*="captcha"], input[placeholder*="CAPTCHA"]');
        if (captchaInput) {
          await captchaInput.type(captchaAnswer);
        }
      } catch (captchaError) {
        console.log("⚠️  CAPTCHA solving failed:", captchaError);
        throw new Error("Failed to solve CAPTCHA. Please try again.");
      }
    } else {
      console.log("ℹ️  No CAPTCHA found on current page");
    }

    // Step 4: Submit login
    console.log("🔐 Submitting login form...");
    const loginButton = await page.$('button[type="submit"], button:contains("Sign In"), button:contains("Login")');
    if (loginButton) {
      await loginButton.click();
    } else {
      await page.keyboard.press("Enter");
    }

    // Wait for navigation or error message
    console.log("⏳ Waiting for server response...");
    await page.waitForTimeout(2000);

    // Check for error messages
    console.log("🔍 CHECKPOINT 3: Checking for error messages...");
    const errorMessages = {
      "invalid_credentials": await page.$eval('.error, .alert-danger, [class*="error"]', (el: any) => el?.textContent).catch(() => null),
      "user_not_found": await page.$eval('text:contains("not found")', (el: any) => el?.textContent).catch(() => null),
      "wrong_password": await page.$eval('text:contains("password")', (el: any) => el?.textContent).catch(() => null),
      "account_locked": await page.$eval('text:contains("locked")', (el: any) => el?.textContent).catch(() => null),
    };

    for (const [errorType, message] of Object.entries(errorMessages)) {
      if (message) {
        console.log(`❌ Error detected [${errorType}]: ${message}`);
        throw new Error(`Login failed: ${message}`);
      }
    }

    // Check if OTP screen is visible
    const otpField = await page.$('input[type="text"][name*="otp"], input[placeholder*="OTP"]');
    if (otpField) {
      console.log("✅ OTP screen detected - login successful!");
      return {
        success: true,
        message: "Login successful. OTP has been sent to your registered email/mobile.",
        browser,
        page,
      };
    }

    // If we get here, something unexpected happened
    throw new Error("Login completed but OTP screen not found. MCA portal may have changed.");

  } catch (error: any) {
    console.error("❌ Login attempt failed:", error.message);

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

    // Determine error type
    const errorMessage = error.message;
    if (errorMessage.includes("not found") || errorMessage.includes("invalid")) {
      return {
        success: false,
        error: "Invalid credentials: Username or password is incorrect. Please verify your MCA portal login.",
      };
    } else if (errorMessage.includes("locked")) {
      return {
        success: false,
        error: "Account locked: Too many login attempts. Please try again later.",
      };
    } else if (errorMessage.includes("CAPTCHA")) {
      return {
        success: false,
        error: "CAPTCHA solving failed. Please try again.",
      };
    } else if (errorMessage.includes("Connection") || errorMessage.includes("timeout")) {
      return {
        success: false,
        error: "Connection failed: Unable to reach MCA website. Please check your internet connection.",
      };
    } else {
      return {
        success: false,
        error: errorMessage || "Login failed. Please try again.",
      };
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { mcaUsername, mcaPassword } = await request.json();

    if (!mcaUsername || !mcaPassword) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("🚀 MCA LOGIN ATTEMPT - DEBUG MODE");
    console.log("=".repeat(60));
    console.log(`Username: ${mcaUsername}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log("=".repeat(60) + "\n");

    // Attempt actual login
    const loginResult = await attemptMCALogin(mcaUsername, mcaPassword);

    if (!loginResult.success) {
      return NextResponse.json(
        { success: false, error: loginResult.error },
        { status: 401 }
      );
    }

    // Create session
    const sessionId = `mca_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    sessions.set(sessionId, {
      sessionId,
      expiresAt,
      credentials: { username: mcaUsername, password: mcaPassword },
      browser: loginResult.browser,
      page: loginResult.page,
    });

    return NextResponse.json({
      success: true,
      sessionId,
      message: loginResult.message || "OTP has been sent to your registered email/mobile. Please enter it to proceed.",
      isMockMode: !loginResult.browser, // Mock mode if browser not available
      debugInfo: {
        checkpoint1: "MCA website URL: https://www.mca.gov.in/signin",
        checkpoint2: "CAPTCHA handling: Claude Vision API enabled",
        checkpoint3: "Error handling: Invalid credentials will throw specific error",
      },
    });
  } catch (error: any) {
    console.error("❌ MCA Login Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to initiate login. Please check your credentials." },
      { status: 500 }
    );
  }
}
