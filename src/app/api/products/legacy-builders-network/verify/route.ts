import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";

const FLW_SECRET   = process.env.FLW_SECRET_KEY ?? "";
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const LBN_WHATSAPP = process.env.LBN_WHATSAPP_URL ?? "";

export async function POST(req: NextRequest) {
  if (!FLW_SECRET) return NextResponse.json({ error: "Payment not configured." }, { status: 503 });

  const { order_id, transaction_id } = await req.json();
  if (!order_id || !transaction_id) {
    return NextResponse.json({ error: "Missing order_id or transaction_id." }, { status: 400 });
  }

  const flwRes = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transaction_id)}/verify`,
    { headers: { Authorization: `Bearer ${FLW_SECRET}` } }
  );
  const flwJson = await flwRes.json();

  if (flwJson.status !== "success" || flwJson.data?.status !== "successful") {
    return NextResponse.json({ error: "Payment not successful." }, { status: 400 });
  }

  const { data: order, error: orderErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ success: true, already_paid: true, whatsapp_url: LBN_WHATSAPP });
  }

  await supabaseAdmin
    .from("orders")
    .update({ status: "paid", transaction_id: String(transaction_id) })
    .eq("id", order_id);

  const email = order.email as string;
  const name  = (order.name as string | null) ?? email.split("@")[0];

  // Create or retrieve their account, link order to user, then generate a sign-in link
  let accountUrl: string | undefined;
  let userId: string | undefined;

  try {
    const { data: createData } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: name },
    });
    userId = createData?.user?.id;
  } catch {
    // User may already exist
  }

  // If user already existed, find their ID by scanning the user list
  if (!userId) {
    try {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      userId = listData?.users?.find((u: { email?: string; id: string }) => u.email === email)?.id;
    } catch { /* non-fatal */ }
  }

  // Bind the order to this user so it appears in their Communities page
  if (userId) {
    await supabaseAdmin.from("orders").update({ user_id: userId }).eq("id", order_id);
  }

  try {
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${SITE_URL}/account` },
    });
    accountUrl = linkData?.properties?.action_link;
  } catch {
    // Non-fatal
  }

  sendConfirmationEmail({ email, name, accountUrl }).catch(console.error);

  return NextResponse.json({ success: true, whatsapp_url: LBN_WHATSAPP });
}

async function sendConfirmationEmail({
  email,
  name,
  accountUrl,
}: {
  email: string;
  name: string;
  accountUrl?: string;
}) {
  const whatsappSection = LBN_WHATSAPP
    ? `<p style="margin:24px 0 8px;font-weight:600;color:#111;">Join the community:</p>
       <a href="${LBN_WHATSAPP}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;border-radius:10px;padding:14px 28px;font-weight:700;font-size:15px;">Join the WhatsApp Community →</a>`
    : `<p style="color:#888;font-size:13px;">Your access details will be sent shortly. Contact us at <a href="mailto:contact@financewithanne.com">contact@financewithanne.com</a> if you have any questions.</p>`;

  const accountSection = accountUrl
    ? `<div style="margin-top:28px;background:#f0f4ff;border-radius:12px;padding:20px 24px;">
         <p style="margin:0 0 6px;font-weight:700;color:#111;font-size:14px;">Your Finance with Anne account</p>
         <p style="margin:0 0 16px;font-size:13px;color:#555;">An account has been created for you. Click below to set up your password and access your dashboard.</p>
         <a href="${accountUrl}" style="display:inline-block;background:#0822C0;color:#fff;text-decoration:none;border-radius:8px;padding:12px 24px;font-weight:700;font-size:13px;">Set up my account →</a>
         <p style="margin:10px 0 0;font-size:11px;color:#999;">This link expires in 24 hours.</p>
       </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);">
    <div style="background:#0822C0;padding:32px 32px 28px;">
      <p style="margin:0;color:rgba(255,255,255,.6);font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;">Finance with Anne</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:800;">Welcome to the Network, ${name.split(" ")[0]}! 🎉</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Thank you for joining the <strong>Legacy Builders Network</strong>. Your annual membership has been confirmed.
      </p>
      ${whatsappSection}
      ${accountSection}
      <hr style="border:none;border-top:1px solid #f0f0f0;margin:28px 0;">
      <p style="font-size:13px;color:#888;margin:0;">
        Questions? Reply to this email or contact us at
        <a href="mailto:contact@financewithanne.com" style="color:#0822C0;">contact@financewithanne.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Welcome to Legacy Builders Network 🎉 — Finance with Anne",
    html,
  });
}
