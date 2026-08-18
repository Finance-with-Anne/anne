import { NextRequest, NextResponse, after } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { verifyFlutterwaveTransaction, transactionSucceeded, chargeMatchesExpected } from "@/lib/flutterwave";
import { rateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";
import { sendMetaPurchaseEvent } from "@/lib/meta-capi";

const FLW_SECRET    = process.env.FLW_SECRET_KEY ?? "";
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const PRODUCT_ID    = "80a9913d-3177-47ca-8ac1-57665fffa1be"; // products table UUID
const ADMIN_EMAIL   = process.env.ADMIN_EMAIL ?? "contact@financewithanne.com";

function generatePassword(len = 12) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export type FulfillResult =
  | { ok: true; already_paid: true }
  | { ok: true; already_paid: false; is_new_user: boolean }
  | { ok: false; status: number; error: string };

/**
 * Marks an Investment Blueprint order paid and delivers it. Shared by the
 * client-driven /verify redirect AND the Flutterwave webhook, since bank
 * transfer payments can clear *after* the customer's browser has already
 * left the /verify page (redirect fires before the transfer settles) —
 * the webhook is what catches those.
 */
export async function fulfillInvestmentBlueprintOrder(
  orderId: string,
  transactionId: string | number,
  meta?: { clientIp?: string; userAgent?: string }
): Promise<FulfillResult> {
  const { data: order, error: orderErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    return { ok: false, status: 404, error: "Order not found." };
  }

  if (order.status === "paid") {
    return { ok: true, already_paid: true };
  }

  const flwJson = await verifyFlutterwaveTransaction(transactionId);

  if (!transactionSucceeded(flwJson)) {
    return { ok: false, status: 400, error: "Payment not successful." };
  }

  if (!chargeMatchesExpected(flwJson, { amount: order.total, currency: order.currency, txRef: order.tx_ref })) {
    return { ok: false, status: 400, error: "This transaction does not match the order being paid for." };
  }

  await supabaseAdmin
    .from("orders")
    .update({ status: "paid", transaction_id: String(transactionId) })
    .eq("id", orderId);

  const email = order.email as string;
  const name  = (order.name as string | null) ?? email.split("@")[0];

  after(() =>
    sendMetaPurchaseEvent({
      eventId: `order-${orderId}`,
      email,
      value: order.total as number,
      currency: order.currency as string,
      eventSourceUrl: `${SITE_URL}/investment-blueprint/checkout`,
      clientIp: meta?.clientIp,
      userAgent: meta?.userAgent,
    }).catch(console.error)
  );

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  let password: string | null = null;
  let isNewUser = false;
  let userId: string | null = existingUser?.id ?? null;

  if (!existingUser) {
    password = generatePassword();
    isNewUser = true;
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role: "student" },
    });
    if (createErr) {
      console.error("createUser error:", createErr);
    } else {
      userId = created.user?.id ?? null;
    }
  }

  if (userId) {
    await supabaseAdmin.from("orders").update({ user_id: userId }).eq("id", orderId);
  }

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("download_url")
    .eq("id", PRODUCT_ID)
    .maybeSingle();

  const downloadUrl = product?.download_url ?? null;

  after(async () => {
    await sendDeliveryEmail({ email, name, password, isNewUser, downloadUrl }).catch(console.error);
    if (!downloadUrl) {
      await sendMissingDownloadAlert({ email, name, orderId }).catch(console.error);
    }
  });

  return { ok: true, already_paid: false, is_new_user: isNewUser };
}

export async function POST(req: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(`verify:investment-blueprint:${getClientIp(req)}`, 20, 10 * 60 * 1000);
  if (!allowed) return rateLimitResponse(retryAfterSeconds!);

  if (!FLW_SECRET) return NextResponse.json({ error: "Payment not configured." }, { status: 503 });

  const { order_id, transaction_id } = await req.json();
  if (!order_id || !transaction_id) {
    return NextResponse.json({ error: "Missing order_id or transaction_id." }, { status: 400 });
  }

  const result = await fulfillInvestmentBlueprintOrder(order_id, transaction_id, {
    clientIp: getClientIp(req),
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  if (result.already_paid) {
    return NextResponse.json({ success: true, already_paid: true });
  }
  return NextResponse.json({ success: true, is_new_user: result.is_new_user });
}

async function sendMissingDownloadAlert({ email, name, orderId }: { email: string; name: string; orderId: string }) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: ADMIN_EMAIL,
    subject: `Action needed: Investment Blueprint paid, no download set (${name})`,
    html: `<p style="font-family:sans-serif;font-size:14px;color:#111;">
      <strong>${name}</strong> (<a href="mailto:${email}">${email}</a>) just paid for The ₦10,000 Investment Blueprint,
      but the product's download link isn't set yet, so they only received a generic "check your account" email.
    </p>
    <p style="font-family:sans-serif;font-size:14px;color:#111;">
      Order ID: <code>${orderId}</code><br>
      Please send them the Starter Kit directly, and set the download link on the product in
      <a href="${SITE_URL}/admin/products">Admin → Products</a> so future buyers get it automatically.
    </p>`,
  });
}

async function sendDeliveryEmail({
  email, name, password, isNewUser, downloadUrl,
}: {
  email: string;
  name: string;
  password: string | null;
  isNewUser: boolean;
  downloadUrl: string | null;
}) {
  const downloadSection = downloadUrl
    ? `<p style="margin:24px 0 8px;font-weight:600;color:#111;">Your Investment Starter Kit:</p>
       <a href="${downloadUrl}" style="display:inline-block;background:#02133B;color:#fff;text-decoration:none;border-radius:10px;padding:14px 28px;font-weight:700;font-size:15px;">Open the Starter Kit →</a>
       <p style="margin:8px 0 0;font-size:13px;color:#888;">Includes the Blueprint, Starter Checklist, Platforms Directory, Allocation Template, and Goal Planner.</p>`
    : `<p style="color:#888;font-size:13px;">You can access your download anytime from <a href="${SITE_URL}/account/files">My Account → Files &amp; Templates</a>. Contact us at <a href="mailto:contact@financewithanne.com">contact@financewithanne.com</a> if you have any trouble.</p>`;

  const accountSection = isNewUser && password
    ? `<div style="margin:28px 0;background:#f4f6ff;border:1px solid #d0d9ff;border-radius:12px;padding:20px;">
         <p style="margin:0 0 6px;font-weight:700;color:#02133B;font-size:14px;">Your Finance with Anne Account</p>
         <p style="margin:0 0 12px;font-size:13px;color:#555;">We've created an account for you so you can access resources in the future.</p>
         <p style="margin:0 0 4px;font-size:13px;color:#111;"><strong>Login:</strong> <a href="${SITE_URL}/auth" style="color:#02133B;">${SITE_URL}/auth</a></p>
         <p style="margin:0 0 4px;font-size:13px;color:#111;"><strong>Email:</strong> ${email}</p>
         <p style="margin:0;font-size:13px;color:#111;"><strong>Password:</strong> <code style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:2px 8px;font-family:monospace;">${password}</code></p>
         <p style="margin:12px 0 0;font-size:12px;color:#888;">Please change your password after your first login.</p>
       </div>`
    : isNewUser === false
    ? `<p style="font-size:13px;color:#888;margin-top:20px;">You already have a Finance with Anne account. <a href="${SITE_URL}/auth" style="color:#02133B;">Log in here</a> to access your resources.</p>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);">
    <div style="background:#02133B;padding:32px 32px 28px;">
      <p style="margin:0;color:rgba(255,255,255,.6);font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;">Finance with Anne</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:800;">You&apos;re all set, ${name.split(" ")[0]}! 🎉</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Thank you for purchasing <strong>The ₦10,000 Investment Blueprint</strong>. Your payment has been confirmed.
      </p>
      ${downloadSection}
      ${accountSection}
      <hr style="border:none;border-top:1px solid #f0f0f0;margin:28px 0;">
      <p style="font-size:13px;color:#888;margin:0;">
        Questions? Reply to this email or contact us at
        <a href="mailto:contact@financewithanne.com" style="color:#02133B;">contact@financewithanne.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Your Investment Starter Kit is ready 🎉 | Finance with Anne",
    html,
  });
}
