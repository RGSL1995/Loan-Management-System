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
 * Production URL: https://www.mca.gov.in/content/mca/global/en/foportal/fologin.html
 * This is the official FO (Field Officer) Portal login
 * The login requires:
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
    console.log("Target URL: https://www.mca.gov.in/content/mca/global/en/foportal/fologin.html");

    // Try to load Puppeteer
    let puppeteer: any;
    try {
      puppeteer = (await import("puppeteer")).default;
    } catch (e) {
      console.log("⚠️  Puppeteer not available - returning demo mode");
      console.log("Error details:", e);
      return {
        success: true,
        message: "Demo mode: CAPTCHA solving and credential validation disabled",
      };
    }

    // Launch browser with stealth mode to bypass anti-bot detection
    console.log("🌐 Launching browser with stealth mode...");
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
      ],
      timeout: 30000,
    });

    page = await browser.newPage();
    page.setDefaultTimeout(15000);

    // Bypass headless browser detection
    console.log("🕵️  Applying stealth techniques...");
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to MCA FO Portal login
    console.log("📡 Navigating to MCA portal...");
    try {
      await page.goto("https://www.mca.gov.in/content/mca/global/en/foportal/fologin.html", {
        waitUntil: "networkidle0",
        timeout: 20000,
      });
    } catch (navigationError) {
      console.log("⚠️  Navigation timeout, continuing anyway:", navigationError.message);
    }

    console.log("✅ MCA website loaded");

    // Wait for page to fully load JavaScript and render
    console.log("⏳ Waiting for login form to render...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Try to wait for login form specifically
    try {
      console.log("🔎 Waiting for login form to appear...");
      await page.waitForSelector('input[placeholder*="User ID"], input[placeholder*="Email"], input[type="text"]', {
        timeout: 5000
      });
      console.log("✅ Login form detected");
    } catch (e) {
      console.log("⚠️  Login form selector not found, continuing with generic search");
    }

    // Debug: Log page title and URL
    const pageTitle = await page.title();
    const pageURL = page.url();
    console.log(`Page Title: ${pageTitle}`);
    console.log(`Page URL: ${pageURL}`);

    // Debug: Take screenshot and log page content
    console.log("📸 Taking screenshot for debugging...");
    try {
      await page.screenshot({ path: '/tmp/mca_login_page.png', type: 'png' });
      console.log("Screenshot saved to /tmp/mca_login_page.png");
    } catch (screenshotError) {
      console.log("⚠️  Could not save screenshot:", screenshotError);
    }

    // Debug: Check for iframes (login might be in iframe)
    console.log("🔎 Checking for iframes...");
    const iframes = await page.$$('iframe');
    console.log(`Found ${iframes.length} iframes on page`);
    for (let i = 0; i < iframes.length; i++) {
      const src = await page.evaluate((el: any) => el.src, iframes[i]);
      const id = await page.evaluate((el: any) => el.id, iframes[i]);
      const name = await page.evaluate((el: any) => el.name, iframes[i]);
      console.log(`Iframe ${i}: src=${src}, id=${id}, name=${name}`);
    }

    // Debug: Check for login-related links
    console.log("🔍 Looking for login links...");
    const allLinks = await page.$$('a');
    console.log(`Found ${allLinks.length} links on page`);
    for (let i = 0; i < allLinks.length; i++) {
      const href = await page.evaluate((el: any) => el.href, allLinks[i]);
      const text = await page.evaluate((el: any) => el.textContent, allLinks[i]);
      if (text.toLowerCase().includes('login') || text.toLowerCase().includes('sign') || href.toLowerCase().includes('login')) {
        console.log(`Login Link ${i}: text="${text}", href="${href}"`);
      }
    }

    // Debug: Log all input fields on the page
    const allInputs = await page.$$('input');
    console.log(`Found ${allInputs.length} input fields on page`);
    for (let i = 0; i < allInputs.length; i++) {
      const type = await page.evaluate((el: any) => el.type, allInputs[i]);
      const name = await page.evaluate((el: any) => el.name, allInputs[i]);
      const id = await page.evaluate((el: any) => el.id, allInputs[i]);
      const placeholder = await page.evaluate((el: any) => el.placeholder, allInputs[i]);
      if (type === 'text' || type === 'email' || type === 'password') {
        console.log(`🔑 Input ${i}: type=${type}, name=${name}, id=${id}, placeholder=${placeholder}`);
      }
    }

    // Step 1: Enter username - Try multiple selectors
    console.log("📝 Entering credentials...");
    console.log(`Attempting to find username field...`);

    let usernameField = await page.$('input[placeholder*="User ID"]');
    if (!usernameField) usernameField = await page.$('input[placeholder*="Email"]');
    if (!usernameField) usernameField = await page.$('input[type="email"]');
    if (!usernameField) usernameField = await page.$('input[type="text"]:first-of-type');
    if (!usernameField) usernameField = await page.$('input[name*="email"]');
    if (!usernameField) usernameField = await page.$('input[name*="username"]');
    if (!usernameField) usernameField = await page.$('input[name*="user"]');
    if (!usernameField) usernameField = await page.$('input[id*="email"]');
    if (!usernameField) usernameField = await page.$('input[id*="username"]');
    if (!usernameField) {
      const pageContent = await page.content();
      console.log("Page content snippet:", pageContent.substring(0, 1000));
      throw new Error("Username field not found. Tried: [type='email'], [name*='email'], [name*='username'], [name*='user'], [id*='email'], [id*='username']");
    }
    console.log("✅ Username field found");
    await usernameField.type(mcaUsername);
    console.log(`✅ Typed username: ${mcaUsername}`);

    // Step 2: Enter password - Wait longer for it to load
    console.log("⏳ Waiting for password field to load...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("Looking for password field...");

    let passwordField = await page.$('input[type="password"]');
    if (!passwordField) passwordField = await page.$('input[name*="password"]');
    if (!passwordField) passwordField = await page.$('input[name*="pass"]');
    if (!passwordField) passwordField = await page.$('input[id*="password"]');
    if (!passwordField) {
      // Debug: Log all inputs again to see if password field appeared
      const allInputsNow = await page.$$('input');
      console.log(`After waiting: Found ${allInputsNow.length} input fields`);
      for (let i = 0; i < allInputsNow.length; i++) {
        const type = await page.evaluate((el: any) => el.type, allInputsNow[i]);
        const name = await page.evaluate((el: any) => el.name, allInputsNow[i]);
        const id = await page.evaluate((el: any) => el.id, allInputsNow[i]);
        if (type === 'password' || name.toLowerCase().includes('pass') || id.toLowerCase().includes('pass')) {
          console.log(`🔐 Found password field: type=${type}, name=${name}, id=${id}`);
        }
      }
      throw new Error("Password field not found after 3 second wait. Tried: [type='password'], [name*='password'], [name*='pass'], [id*='password']");
    }
    console.log("✅ Password field found");
    await passwordField.type(mcaPassword);
    console.log(`✅ Typed password`);

    // Debug: Take screenshot after entering credentials
    console.log("📸 Taking screenshot after entering credentials...");
    try {
      await page.screenshot({ path: '/tmp/mca_after_creds.png', type: 'png' });
      console.log("Screenshot saved to /tmp/mca_after_creds.png");
    } catch (screenshotError) {
      console.log("⚠️  Could not save screenshot:", screenshotError);
    }

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

    // Step 4: Find and debug login button
    console.log("🔍 Looking for login button...");
    const allButtons = await page.$$('button');
    console.log(`Found ${allButtons.length} buttons on page`);
    for (let i = 0; i < allButtons.length; i++) {
      const text = await page.evaluate((el: any) => el.textContent, allButtons[i]);
      const type = await page.evaluate((el: any) => el.type, allButtons[i]);
      const id = await page.evaluate((el: any) => el.id, allButtons[i]);
      console.log(`Button ${i}: text="${text}", type=${type}, id=${id}`);
    }

    // Step 5: Submit login
    console.log("🔐 Submitting login form...");
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      console.log("✅ Found submit button - clicking it");
      await loginButton.click();
    } else {
      console.log("⚠️  Submit button not found - trying keyboard Enter");
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
    console.log("🚀 DEMO MODE - MCA LOGIN SIMULATION");
    console.log("=".repeat(60));
    console.log(`Username: ${mcaUsername}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log("Mode: DEMO (No real MCA login)");
    console.log("=".repeat(60) + "\n");

    // DEMO MODE: Create session without real login
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    sessions.set(sessionId, {
      sessionId,
      expiresAt,
      credentials: { username: mcaUsername, password: mcaPassword },
    });

    console.log("✅ Demo session created - OTP verification simulated");

    return NextResponse.json({
      success: true,
      sessionId,
      message: "🔧 Demo Mode: Enter any 6-digit number (e.g., 123456) to proceed.",
      isMockMode: true,
      source: "zaubacorp",
      info: {
        mode: "DEMO",
        description: "Fetching real company data from Zaubacorp only",
        note: "No real MCA login required for testing",
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
