import { NextRequest, NextResponse, after } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { verifyFlutterwaveTransaction, transactionSucceeded, chargeMatchesExpected } from "@/lib/flutterwave";
import { rateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";

const FLW_SECRET = process.env.FLW_SECRET_KEY ?? "";
const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function generatePassword(len = 12) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type Download = { name: string; qty: number; download_url: string | null; source_type: string | null; source_id: string | null };

export type FulfillResult =
  | { ok: true; already_paid: true; downloads: Download[] }
  | { ok: true; already_paid: false; downloads: Download[]; is_new_user: boolean }
  | { ok: false; status: number; error: string };

/** Shared by the client-driven /verify redirect and the Flutterwave webhook — see webhook route for why both exist. */
export async function fulfillShopOrder(orderId: string, transactionId: string | number): Promise<FulfillResult> {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) return { ok: false, status: 404, error: "Order not found." };

  const downloads = await getDownloads(order.items);

  if (order.status === "paid") {
    return { ok: true, already_paid: true, downloads };
  }

  const flwJson = await verifyFlutterwaveTransaction(transactionId);

  if (!transactionSucceeded(flwJson)) {
    return { ok: false, status: 400, error: "Payment not successful." };
  }

  if (!chargeMatchesExpected(flwJson, { amount: order.total, currency: order.currency, txRef: order.tx_ref })) {
    return { ok: false, status: 400, error: "This transaction does not match the order being paid for." };
  }

  const email = order.email as string;
  const name  = (order.name as string | null) ?? email.split("@")[0];

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const existing = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string | null = order.user_id ?? existing?.id ?? null;
  let password: string | null = null;
  let isNewUser = false;

  if (!existing) {
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

  await supabaseAdmin
    .from("orders")
    .update({ status: "paid", transaction_id: String(transactionId), user_id: userId })
    .eq("id", orderId);

  if (userId) {
    const courseItems = await getCourseItems(order.items);
    for (const courseId of courseItems) {
      await supabaseAdmin
        .from("course_enrollments")
        .upsert({ user_id: userId, course_id: courseId }, { onConflict: "user_id,course_id" });
    }
  }

  after(() => sendOrderEmail({ order, downloads, password, isNewUser, name }).catch(console.error));

  return { ok: true, already_paid: false, downloads, is_new_user: isNewUser };
}

export async function POST(req: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(`verify:shop:${getClientIp(req)}`, 20, 10 * 60 * 1000);
  if (!allowed) return rateLimitResponse(retryAfterSeconds!);

  const { order_id, transaction_id } = await req.json();

  if (!FLW_SECRET) return NextResponse.json({ error: "Payment not configured." }, { status: 503 });

  const result = await fulfillShopOrder(order_id, transaction_id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  if (result.already_paid) {
    return NextResponse.json({ success: true, downloads: result.downloads });
  }
  return NextResponse.json({ success: true, downloads: result.downloads, is_new_user: result.is_new_user });
}

async function getDownloads(items: { id: string; name: string; qty: number }[]) {
  const ids = items.map(i => i.id);
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, name, download_url, source_type, source_id")
    .in("id", ids);

  return items.map(item => ({
    name: item.name,
    qty: item.qty,
    download_url: products?.find(p => p.id === item.id)?.download_url ?? null,
    source_type: products?.find(p => p.id === item.id)?.source_type ?? null,
    source_id: products?.find(p => p.id === item.id)?.source_id ?? null,
  }));
}

async function getCourseItems(items: { id: string }[]) {
  const ids = items.map(i => i.id);
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("source_type, source_id")
    .in("id", ids);
  return (products ?? [])
    .filter(p => p.source_type === "course" && p.source_id)
    .map(p => p.source_id as string);
}

async function sendOrderEmail({
  order, downloads, password, isNewUser, name,
}: {
  order: { email: string; items: { name: string; qty: number }[]; total: number; currency: string };
  downloads: { name: string; download_url: string | null; source_type?: string | null }[];
  password: string | null;
  isNewUser: boolean;
  name: string;
}) {
  const sym = order.currency === "GBP" ? "£" : order.currency === "USD" ? "$" : "₦";

  const downloadSection = downloads.filter(d => d.download_url).length > 0
    ? `<p style="margin:24px 0 8px;font-weight:600;color:#111;">Your downloads:</p>
       <ul style="margin:0;padding:0 0 0 18px;">
         ${downloads.filter(d => d.download_url).map(d =>
           `<li style="margin-bottom:6px;"><a href="${d.download_url}" style="color:#0822C0;">${d.name}</a></li>`
         ).join("")}
       </ul>`
    : "";

  const courseSection = downloads.some(d => d.source_type === "course")
    ? `<p style="margin:20px 0 8px;font-weight:600;color:#111;">Your course access:</p>
       <a href="${SITE_URL}/account/courses" style="display:inline-block;background:#0822C0;color:#fff;text-decoration:none;border-radius:10px;padding:12px 24px;font-weight:700;font-size:14px;">Go to My Courses →</a>`
    : "";

  const accountSection = isNewUser && password
    ? `<div style="margin:28px 0;background:#f4f6ff;border:1px solid #d0d9ff;border-radius:12px;padding:20px;">
         <p style="margin:0 0 6px;font-weight:700;color:#0822C0;font-size:14px;">Your Finance with Anne Account</p>
         <p style="margin:0 0 12px;font-size:13px;color:#555;">We've created an account for you so you can access your purchases at any time.</p>
         <p style="margin:0 0 4px;font-size:13px;color:#111;"><strong>Login:</strong> <a href="${SITE_URL}/auth" style="color:#0822C0;">${SITE_URL}/auth</a></p>
         <p style="margin:0 0 4px;font-size:13px;color:#111;"><strong>Email:</strong> ${order.email}</p>
         <p style="margin:0;font-size:13px;color:#111;"><strong>Password:</strong> <code style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:2px 8px;font-family:monospace;">${password}</code></p>
         <p style="margin:12px 0 0;font-size:12px;color:#888;">Please change your password after your first login.</p>
       </div>`
    : !isNewUser
    ? `<p style="font-size:13px;color:#888;margin-top:20px;">Access your files anytime at <a href="${SITE_URL}/account/files" style="color:#0822C0;">My Account → Files</a>.</p>`
    : "";

  const itemRows = order.items.map(i => `<li style="margin-bottom:4px;">${i.name} ×${i.qty}</li>`).join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);">
    <div style="background:#0822C0;padding:32px 32px 28px;">
      <p style="margin:0;color:rgba(255,255,255,.6);font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;">Finance with Anne</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:800;">Order confirmed 🎉</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${name.split(" ")[0]}, thank you for your purchase!
      </p>
      <ul style="margin:0 0 16px;padding:0 0 0 18px;color:#444;font-size:14px;">
        ${itemRows}
      </ul>
      <p style="font-size:14px;color:#444;"><strong>Total:</strong> ${sym}${(order.total as number).toLocaleString()}</p>
      ${downloadSection}
      ${courseSection}
      ${accountSection}
      <hr style="border:none;border-top:1px solid #f0f0f0;margin:28px 0;">
      <p style="font-size:13px;color:#888;margin:0;">
        Questions? Contact us at <a href="mailto:contact@financewithanne.com" style="color:#0822C0;">contact@financewithanne.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: order.email,
    subject: "Your order is confirmed | Finance with Anne",
    html,
  });
}
