import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { surepassDigiLockerWebhookSchema } from "@/lib/schemas/kyc-responses";

// Route Segment Config
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // 1. Verify Webhook Signature (Security)
    // TODO: Surepass usually sends a signature header. Implement validation once provided.
    // const signature = req.headers.get("x-surepass-signature");

    // 2. Parse Body
    const body = await req.json();

    // 3. Validate Shape
    const parsed = surepassDigiLockerWebhookSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Invalid Surepass Webhook Payload", parsed.error);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { event, reference_id, status, payload } = parsed.data;

    // 4. Log to Supabase using Admin Client (Bypasses RLS since webhooks are unauthenticated)
    const supabase = await createAdminClient();
    
    // We log it into kyc_verification_logs with a special provider marking it as an async callback
    await supabase.from('kyc_verification_logs').insert({
      provider: "SUREPASS_WEBHOOK",
      status: status === "SUCCESS" ? "SUCCESS" : "FAILED",
      request_payload: { event, reference_id },
      response_payload: payload || {},
      reference_id: reference_id
    });

    // 5. Handle Specific Events
    if (event === "digilocker.completed" && status === "SUCCESS") {
      // TODO: Update the specific Loan Application or Client record to mark DigiLocker as VERIFIED.
      // E.g., await supabase.from('clients').update({ digilocker_verified: true }).eq('dl_session_id', reference_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Surepass Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
