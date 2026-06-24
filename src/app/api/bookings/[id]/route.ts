import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await req.json();

  // Fetch current booking before update to detect what changed
  const { data: existing } = await supabaseAdmin
    .from("bookings")
    .select("client_name, client_email, service, date, time, status, notes")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("bookings")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (existing) {
    const isCancelling = body.status === "cancelled" && existing.status !== "cancelled";
    const isRescheduling = (body.date && body.date !== existing.date) || (body.time && body.time !== existing.time);

    if (isCancelling) {
      sendCancellationEmail(existing).catch(console.error);
    } else if (isRescheduling) {
      const newDate = body.date ?? existing.date;
      const newTime = body.time ?? existing.time;
      const note = body.notes ?? null;
      sendRescheduleEmail(existing, newDate, newTime, note).catch(console.error);
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

async function sendCancellationEmail(booking: { client_name: string; client_email: string; service: string; date: string; time: string }) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: booking.client_email,
    subject: `Booking Cancelled — ${booking.service}`,
    html: `<html><body style="font-family:Arial,sans-serif;color:#111;background:#fff;margin:0;padding:0">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px">
        <tr><td>
          <h1 style="font-size:24px;font-weight:700">Finance with Anne</h1>
          <hr style="border-color:#e5e7eb;margin:16px 0"/>
          <h2 style="font-size:18px">Your Booking Has Been Cancelled</h2>
          <p style="color:#4b5563">Hi ${booking.client_name}, your booking has been cancelled.</p>
          <table width="100%" style="background:#f9fafb;border-radius:8px;padding:20px;margin-top:16px">
            <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Session</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${booking.service}</td></tr>
            <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Date</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${fmt(booking.date)}</td></tr>
            <tr><td style="color:#6b7280;font-size:13px">Time</td><td style="font-weight:600;text-align:right;font-size:13px">${booking.time}</td></tr>
          </table>
          <p style="color:#4b5563;margin-top:20px">If you have any questions or would like to rebook, please reply to this email.</p>
          <p style="color:#4b5563;margin-top:20px">Warm regards,<br/><strong>Anne</strong></p>
          <hr style="border-color:#e5e7eb;margin:32px 0 16px"/>
          <p style="font-size:11px;color:#9ca3af;text-align:center">Finance with Anne — Building Wealth, One Step at a Time</p>
        </td></tr>
      </table>
    </body></html>`,
  });
}

async function sendRescheduleEmail(
  booking: { client_name: string; client_email: string; service: string; date: string; time: string },
  newDate: string,
  newTime: string,
  note: string | null,
) {
  const noteSection = note
    ? `<p style="color:#4b5563;margin-top:16px"><strong>Note from Anne:</strong> ${note}</p>`
    : "";

  await resend.emails.send({
    from: EMAIL_FROM,
    to: booking.client_email,
    subject: `Booking Rescheduled — ${booking.service}`,
    html: `<html><body style="font-family:Arial,sans-serif;color:#111;background:#fff;margin:0;padding:0">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px">
        <tr><td>
          <h1 style="font-size:24px;font-weight:700">Finance with Anne</h1>
          <hr style="border-color:#e5e7eb;margin:16px 0"/>
          <h2 style="font-size:18px">Your Booking Has Been Rescheduled</h2>
          <p style="color:#4b5563">Hi ${booking.client_name}, your session has been moved to a new time.</p>
          <table width="100%" style="background:#f9fafb;border-radius:8px;padding:20px;margin-top:16px">
            <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px">Session</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px">${booking.service}</td></tr>
            <tr><td style="color:#6b7280;font-size:13px;padding-bottom:4px;text-decoration:line-through;opacity:0.5">Previous Date</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:4px;text-decoration:line-through;opacity:0.5">${fmt(booking.date)} · ${booking.time}</td></tr>
            <tr><td style="color:#6b7280;font-size:13px;padding-bottom:8px;padding-top:8px">New Date</td><td style="font-weight:600;text-align:right;font-size:13px;padding-bottom:8px;padding-top:8px;color:#0822C0">${fmt(newDate)}</td></tr>
            <tr><td style="color:#6b7280;font-size:13px">New Time</td><td style="font-weight:600;text-align:right;font-size:13px;color:#0822C0">${newTime}</td></tr>
          </table>
          ${noteSection}
          <p style="color:#4b5563;margin-top:20px">If you have any questions, please reply to this email.</p>
          <p style="color:#4b5563;margin-top:20px">Warm regards,<br/><strong>Anne</strong></p>
          <hr style="border-color:#e5e7eb;margin:32px 0 16px"/>
          <p style="font-size:11px;color:#9ca3af;text-align:center">Finance with Anne — Building Wealth, One Step at a Time</p>
        </td></tr>
      </table>
    </body></html>`,
  });
}
