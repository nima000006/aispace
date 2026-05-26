import { Resend } from "resend";

const FROM = process.env.RESEND_FROM ?? "AISpace <onboarding@resend.dev>";
const APP_URL = process.env.AUTH_URL ?? "http://localhost:3000";

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/en/auth/reset-password?token=${token}`;

  // Dev fallback — print link to console if no API key configured
  if (!process.env.RESEND_API_KEY) {
    console.log("\n🔑 Password reset link (no RESEND_API_KEY set):");
    console.log(resetUrl, "\n");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your AISpace password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:22px;color:#0a0a0b">Reset your password</h2>
        <p style="margin:0 0 24px;color:#71717a;font-size:15px">
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
          Reset password
        </a>
        <p style="margin:24px 0 0;color:#a1a1aa;font-size:13px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
