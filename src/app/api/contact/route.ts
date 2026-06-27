import { NextRequest, NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "contact@financewithanne.com";

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);">
    <div style="background:#0822C0;padding:28px 32px;">
      <p style="margin:0;color:rgba(255,255,255,.6);font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;">Finance with Anne</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:800;">New Contact Message</h1>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
        <tr><td style="padding:8px 12px;background:#f4f6ff;border-radius:6px 6px 0 0;color:#555;font-weight:600;width:25%;">Name</td><td style="padding:8px 12px;background:#f4f6ff;border-radius:6px 6px 0 0;color:#111;font-weight:700;">${name}</td></tr>
        <tr><td style="padding:8px 12px;background:#eef1ff;color:#555;font-weight:600;">Email</td><td style="padding:8px 12px;background:#eef1ff;color:#0822C0;font-weight:700;"><a href="mailto:${email}" style="color:#0822C0;">${email}</a></td></tr>
        <tr><td style="padding:8px 12px;background:#f4f6ff;border-radius:0 0 6px 6px;color:#555;font-weight:600;">Subject</td><td style="padding:8px 12px;background:#f4f6ff;border-radius:0 0 6px 6px;color:#111;">${subject || "No subject"}</td></tr>
      </table>
      <p style="font-size:13px;font-weight:600;color:#111;margin:0 0 8px;">Message:</p>
      <div style="background:#f9fafb;border-radius:10px;padding:16px;font-size:14px;color:#444;line-height:1.7;white-space:pre-line;">${message}</div>
      <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0;">
      <p style="font-size:12px;color:#999;margin:0;">Reply directly to this email to respond to ${name}.</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `Contact: ${subject || `Message from ${name}`}`,
    html,
  });

  return NextResponse.json({ success: true });
}
