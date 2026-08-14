import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendCredentialEmailParams {
  recipientEmail: string;
  userEmail: string;
  fullName: string;
  role: string;
  password: string;
  loginUrl?: string;
}

/**
 * Sends welcome login credentials to the specified recipient email address using Resend.
 */
export async function sendCredentialEmail({
  recipientEmail,
  userEmail,
  fullName,
  role,
  password,
  loginUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : "http://localhost:3000/login",
}: SendCredentialEmailParams) {
  const formattedRole = role.replace(/_/g, " ").toUpperCase();
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .logo { font-weight: 800; font-size: 20px; letter-spacing: -0.02em; color: #000000; margin-bottom: 24px; }
        h1 { font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px; color: #0f172a; }
        p { font-size: 14px; line-height: 1.5; color: #475569; margin-bottom: 16px; }
        .credentials-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; }
        .field { margin-bottom: 10px; }
        .field:last-child { margin-bottom: 0; }
        .label { font-weight: 600; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px; }
        .value { font-weight: 700; color: #0f172a; font-family: monospace; font-size: 14px; word-break: break-all; }
        .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: sans-serif; }
        .btn { display: inline-block; background: #000000; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13px; margin-top: 16px; }
        .footer { font-size: 11px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">FINBYX</div>
        <h1>Welcome to Finbyx LAS Platform</h1>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>An account has been created for you on the Finbyx Loan Against Securities (LAS) platform. Below are your systematic login credentials:</p>
        
        <div class="credentials-box">
          <div class="field">
            <span class="label">Login Email</span>
            <span class="value">${userEmail}</span>
          </div>
          <div class="field">
            <span class="label">System Password</span>
            <span class="value">${password}</span>
          </div>
          <div class="field">
            <span class="label">Assigned Role</span>
            <span class="badge">${formattedRole}</span>
          </div>
        </div>

        <p>Please log in using the button below and change your password upon your first sign-in.</p>
        
        <a href="${loginUrl}" class="btn">Sign In to Dashboard</a>

        <div class="footer">
          This is an automated system email sent from Finbyx LAS Platform.
        </div>
      </div>
    </body>
    </html>
  `;

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: `Finbyx Platform <${fromEmail}>`,
        to: [recipientEmail],
        subject: `Your Finbyx Login Credentials — ${fullName}`,
        html: htmlContent,
      });

      if (error) {
        console.error("[RESEND EMAIL ERROR]:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      console.error("[RESEND DISPATCH FAILED]:", err);
      return { success: false, error: err.message };
    }
  } else {
    console.log("=================================================");
    console.log("[MOCK EMAIL DISPATCH - RESEND API KEY MISSING]");
    console.log(`TO: ${recipientEmail}`);
    console.log(`USER: ${userEmail}`);
    console.log(`PASSWORD: ${password}`);
    console.log(`ROLE: ${formattedRole}`);
    console.log("=================================================");
    return { success: true, mock: true };
  }
}
