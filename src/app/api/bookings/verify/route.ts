import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createMeetEvent } from "@/lib/google-calendar";

const FLW_SECRET = process.env.FLW_SECRET_KEY ?? "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? EMAIL_FROM;

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

  // Fetch booking + session + questions
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*, session:booking_sessions(title, google_meet_link, duration_minutes, questions:booking_questions(*))")
    .eq("id", booking_id)
    .single();

  if (error || !booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.is_paid) return NextResponse.json({ success: true }); // already processed

  // Mark as paid + confirmed
  await supabaseAdmin
    .from("bookings")
    .update({ is_paid: true, status: "confirmed", payment_ref: json.data.tx_ref ?? String(transaction_id) })
    .eq("id", booking_id);

  const session = booking.session as { title: string; google_meet_link: string | null; duration_minutes?: number; questions: { id: string; question: string }[] };
  const formattedDate = new Date(booking.date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Auto-create Google Meet; fall back to manually stored link
  const autoMeetLink = await createMeetEvent({
    title: session.title,
    date: booking.date,
    startTime: booking.time,
    durationMinutes: session.duration_minutes ?? 60,
    attendeeEmail: booking.client_email,
    attendeeName: booking.client_name,
  }).catch(() => null);
  const meetLink = autoMeetLink ?? session.google_meet_link ?? undefined;

  if (autoMeetLink) {
    await supabaseAdmin.from("bookings").update({ notes: autoMeetLink }).eq("id", booking_id);
  }

  const meetSection = meetLink
    ? `<div style="margin-top:24px;background:#eff6ff;border-radius:8px;padding:20px;text-align:center">
        <p style="color:#1e40af;font-weight:600;margin:0 0 12px">Join your session via Google Meet</p>
        <a href="${meetLink}" style="display:inline-block;background:#0822C0;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600">Join Google Meet →</a>
        <p style="font-size:11px;color:#6b7280;margin-top:8px">${meetLink}</p>
       </div>`
    : "";

  const clientHtml = `<html><body style="font-family:Arial,sans-serif;color:#111;background:#fff;margin:0;padding:0">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px">
      <tr><td>
        <h1 style="font-size:24px;font-weight:700">Finance with Anne</h1>
        <hr style="border-color:#e5e7eb;margin:16px 0"/>
        <h2 style="font-size:18px">Booking Confirmed — Payment Received</h2>
        <p style="color:#4b5563">Hi ${booking.client_name}, your session has been confirmed.</p>
        <table width="100%" style="background:#f9fafb;border-radius:8px;padding:20px;margin-top:16px">
          <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Session</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${session.title}</td></tr>
          <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Date</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${formattedDate}</td></tr>
          <tr><td style="color:#6b7280;font-size:13px">Time</td><td style="font-weight:600;text-align:right;font-size:13px">${booking.time}</td></tr>
        </table>
        ${meetSection}
        <p style="color:#4b5563;margin-top:20px">If you have any questions, reply to this email.</p>
        <p style="color:#4b5563;margin-top:20px">Warm regards,<br/><strong>Anne</strong></p>
        <hr style="border-color:#e5e7eb;margin:32px 0 16px"/>
        <p style="font-size:11px;color:#9ca3af;text-align:center">Finance with Anne — Building Wealth, One Step at a Time</p>
      </td></tr>
    </table>
  </body></html>`;

  const adminHtml = `<html><body style="font-family:Arial,sans-serif;color:#111;background:#fff;margin:0;padding:0">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px">
      <tr><td>
        <h2 style="font-size:18px">New Paid Booking</h2>
        <table width="100%" style="background:#f9fafb;border-radius:8px;padding:20px;margin-top:16px">
          <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Client</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${booking.client_name}</td></tr>
          <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Email</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${booking.client_email}</td></tr>
          <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Session</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${session.title}</td></tr>
          <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Date</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${formattedDate}</td></tr>
          <tr><td style="color:#6b7280;font-size:13px">Time</td><td style="font-weight:600;text-align:right;font-size:13px">${booking.time}</td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;

  const [clientEmail, adminEmail] = await Promise.allSettled([
    resend.emails.send({ from: EMAIL_FROM, to: booking.client_email, subject: `Booking Confirmed — ${session.title}`, html: clientHtml }),
    resend.emails.send({ from: EMAIL_FROM, to: ADMIN_EMAIL, subject: `Booking Paid: ${booking.client_name} — ${session.title}`, html: adminHtml }),
  ]);

  if (clientEmail.status === "rejected") console.error("Client email failed:", clientEmail.reason);
  else if (clientEmail.value.error) console.error("Client email error:", JSON.stringify(clientEmail.value.error));
  if (adminEmail.status === "rejected") console.error("Admin email failed:", adminEmail.reason);
  else if (adminEmail.value.error) console.error("Admin email error:", JSON.stringify(adminEmail.value.error));

  return NextResponse.json({
    success: true,
    emailSent: clientEmail.status === "fulfilled" && !clientEmail.value.error,
    emailTo: booking.client_email,
  });
}
