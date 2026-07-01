import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createMeetEvent } from "@/lib/google-calendar";

const FLW_SECRET   = process.env.FLW_SECRET_KEY ?? "";
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? EMAIL_FROM)
  .split(",").map(e => e.trim()).filter(Boolean);

function generatePassword(len = 10) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: NextRequest) {
  const { transaction_id, booking_id } = await req.json();

  if (!FLW_SECRET) return NextResponse.json({ error: "Payment not configured." }, { status: 503 });

  // Verify with Flutterwave
  const res = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transaction_id)}/verify`, {
    headers: { Authorization: `Bearer ${FLW_SECRET}` },
  });
  const json = await res.json();

  if (json.status !== "success" || json.data?.status !== "successful") {
    return NextResponse.json({ error: "Payment not successful." }, { status: 400 });
  }

  // Fetch booking + session
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*, session:booking_sessions(title, google_meet_link, duration_minutes, questions:booking_questions(*))")
    .eq("id", booking_id)
    .single();

  if (error || !booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.is_paid) return NextResponse.json({ success: true });

  // Mark as paid + confirmed
  await supabaseAdmin
    .from("bookings")
    .update({ is_paid: true, status: "confirmed", payment_ref: json.data.tx_ref ?? String(transaction_id) })
    .eq("id", booking_id);

  const session = booking.session as {
    title: string;
    google_meet_link: string | null;
    duration_minutes?: number;
    questions: { id: string; question: string }[];
  };
  const formattedDate = new Date(booking.date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Create or find user account
  const email = booking.client_email as string;
  const name  = booking.client_name as string;

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  let isNewUser = false;
  let tempPassword: string | null = null;
  let userId: string | null = existingUser?.id ?? null;

  if (!existingUser) {
    isNewUser = true;
    tempPassword = generatePassword();
    const { data: created } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name },
    });
    userId = created?.user?.id ?? null;
  }

  // Link booking to user
  if (userId) {
    await supabaseAdmin.from("bookings").update({ user_id: userId }).eq("id", booking_id);
  }

  // Auto-create Google Meet; fall back to manually stored link
  const autoMeetLink = await createMeetEvent({
    title: session.title,
    date: booking.date,
    startTime: booking.time,
    durationMinutes: session.duration_minutes ?? 60,
    attendeeEmail: email,
    attendeeName: name,
  }).catch(() => null);
  const meetLink = autoMeetLink ?? session.google_meet_link ?? undefined;

  if (autoMeetLink) {
    await supabaseAdmin.from("bookings").update({ notes: autoMeetLink }).eq("id", booking_id);
  }

  // Send client + admin emails
  sendClientEmail({ email, name, session: session.title, formattedDate, time: booking.time, meetLink, isNewUser, tempPassword }).catch(console.error);
  sendAdminEmail({ name, email, session: session.title, formattedDate, time: booking.time, meetLink }).catch(console.error);

  return NextResponse.json({ success: true, emailTo: email });
}

async function sendClientEmail({
  email, name, session, formattedDate, time, meetLink, isNewUser, tempPassword,
}: {
  email: string;
  name: string;
  session: string;
  formattedDate: string;
  time: string;
  meetLink?: string;
  isNewUser: boolean;
  tempPassword: string | null;
}) {
  const meetSection = meetLink
    ? `<div style="margin:24px 0;background:#eff6ff;border-radius:10px;padding:20px;text-align:center;">
        <p style="color:#1e40af;font-weight:600;margin:0 0 12px;font-size:14px;">Join your session via Google Meet</p>
        <a href="${meetLink}" style="display:inline-block;background:#0822C0;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">Join Google Meet →</a>
        <p style="font-size:11px;color:#6b7280;margin:8px 0 0;">${meetLink}</p>
       </div>`
    : "";

  const accountSection = isNewUser && tempPassword
    ? `<div style="margin:24px 0;background:#f4f6ff;border:1px solid #d0d9ff;border-radius:12px;padding:20px;">
         <p style="margin:0 0 6px;font-weight:700;color:#0822C0;font-size:14px;">Your Finance with Anne Account</p>
         <p style="margin:0 0 12px;font-size:13px;color:#555;">We've created an account for you. Use it to view your bookings and access resources.</p>
         <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:14px;">
           <tr>
             <td style="padding:8px 12px;background:#e8edff;border-radius:6px 6px 0 0;color:#555;font-weight:600;width:30%;">Email</td>
             <td style="padding:8px 12px;background:#e8edff;border-radius:6px 6px 0 0;color:#111;font-weight:700;">${email}</td>
           </tr>
           <tr>
             <td style="padding:8px 12px;background:#dce4ff;border-radius:0 0 6px 6px;color:#555;font-weight:600;">Password</td>
             <td style="padding:8px 12px;background:#dce4ff;border-radius:0 0 6px 6px;color:#0822C0;font-weight:800;letter-spacing:.05em;font-size:15px;">${tempPassword}</td>
           </tr>
         </table>
         <a href="${SITE_URL}/auth" style="display:inline-block;background:#0822C0;color:#fff;text-decoration:none;border-radius:8px;padding:10px 22px;font-weight:700;font-size:13px;">Sign in to my account →</a>
         <p style="margin:10px 0 0;font-size:11px;color:#999;">You can change your password after signing in under Account Settings.</p>
       </div>`
    : `<p style="font-size:13px;color:#888;margin-top:20px;">
         You already have a Finance with Anne account.
         <a href="${SITE_URL}/auth" style="color:#0822C0;">Sign in here</a> to view your bookings.
       </p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);">
    <div style="background:#0822C0;padding:32px 32px 28px;">
      <p style="margin:0;color:rgba(255,255,255,.6);font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;">Finance with Anne</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:800;">Booking Confirmed 🎉</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 20px;">Hi ${name.split(" ")[0]}, your session has been confirmed and payment received.</p>
      <table width="100%" style="background:#f9fafb;border-radius:10px;padding:18px 20px;border-collapse:collapse;">
        <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px;">Session</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px;">${session}</td></tr>
        <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px;">Date</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px;">${formattedDate}</td></tr>
        <tr><td style="color:#6b7280;font-size:13px;">Time</td><td style="font-weight:600;text-align:right;font-size:13px;">${time}</td></tr>
      </table>
      ${meetSection}
      ${accountSection}
      <hr style="border:none;border-top:1px solid #f0f0f0;margin:28px 0;">
      <p style="color:#4b5563;font-size:14px;margin:0;">Warm regards,<br/><strong>Anne</strong></p>
      <p style="font-size:12px;color:#9ca3af;margin-top:12px;">Finance with Anne: Building Wealth, One Step at a Time</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: `Booking Confirmed: ${session}`,
    html,
  });
}

async function sendAdminEmail({
  name, email, session, formattedDate, time, meetLink,
}: {
  name: string;
  email: string;
  session: string;
  formattedDate: string;
  time: string;
  meetLink?: string;
}) {
  const html = `<html><body style="font-family:Arial,sans-serif;color:#111;background:#fff;margin:0;padding:0">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px">
      <tr><td>
        <h2 style="font-size:18px">New Paid Booking</h2>
        <table width="100%" style="background:#f9fafb;border-radius:8px;padding:20px;margin-top:16px">
          <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Client</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${name}</td></tr>
          <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Email</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Session</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${session}</td></tr>
          <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Date</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${formattedDate}</td></tr>
          <tr><td style="color:#6b7280;font-size:13px${meetLink ? ";padding-bottom:8px" : ""}">Time</td><td style="font-weight:600;text-align:right;font-size:13px${meetLink ? ";padding-bottom:8px" : ""}">${time}</td></tr>
          ${meetLink ? `<tr><td style="color:#6b7280;font-size:13px">Google Meet</td><td style="font-weight:600;text-align:right;font-size:13px"><a href="${meetLink}" style="color:#0822C0">${meetLink}</a></td></tr>` : ""}
        </table>
      </td></tr>
    </table>
  </body></html>`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: ADMIN_EMAILS,
    subject: `Booking Paid: ${name} (${session})`,
    html,
  });
}
