import { NextRequest, NextResponse } from "next/server";

interface MCASession {
  sessionId: string;
  expiresAt: number;
  credentials?: { username: string; password: string };
}

// In-memory store for sessions (replace with Redis in production)
const sessions = new Map<string, MCASession>();

export async function POST(request: NextRequest) {
  try {
    const { mcaUsername, mcaPassword } = await request.json();

    if (!mcaUsername || !mcaPassword) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Create session
    const sessionId = `mca_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    sessions.set(sessionId, {
      sessionId,
      expiresAt,
      credentials: { username: mcaUsername, password: mcaPassword },
    });

    // TODO: Production mode - uncomment below and remove mock response
    // try {
    //   const puppeteer = await import("puppeteer");
    //   // Launch browser and login to MCA portal
    //   // const browser = await puppeteer.default.launch({ headless: true });
    //   // ... handle login and OTP screen detection
    // } catch (e) {
    //   console.log("Puppeteer automation failed, fallback to mock");
    // }

    console.log("MCA Session created");
    return NextResponse.json({
      success: true,
      sessionId,
      message: "OTP has been sent to your registered email/mobile. Please enter it to proceed.",
      isMockMode: true,
    });
  } catch (error: any) {
    console.error("MCA Login Error:", error);
    console.erro())
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to initiate login. Please check your credentials." },
      { status: 500 }
    );
  }
}
