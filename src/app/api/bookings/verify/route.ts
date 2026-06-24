import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { BookingConfirmationEmail } from "@/lib/emails/booking-confirmation";
import { AdminBookingNotifyEmail } from "@/lib/emails/booking-admin-notify";
import { createMeetEvent } from "@/lib/google-calendar";
import * as React from "react";

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

  // Send emails
  const [clientEmail, adminEmail] = await Promise.allSettled([
    resend.emails.send({
      from: EMAIL_FROM,
      to: booking.client_email,
      subject: `Booking Confirmed — ${session.title}`,
      react: React.createElement(BookingConfirmationEmail, {
        clientName: booking.client_name,
        service: session.title,
        date: formattedDate,
        time: booking.time,
        googleMeetLink: meetLink,
        answers: booking.answers ?? undefined,
        questions: session.questions ?? [],
        isPaid: true,
      }),
    }),
    resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `Booking Paid: ${booking.client_name} — ${session.title}`,
      react: React.createElement(AdminBookingNotifyEmail, {
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        phone: booking.phone ?? undefined,
        service: session.title,
        date: formattedDate,
        time: booking.time,
        answers: booking.answers ?? undefined,
        questions: session.questions ?? [],
        isPaid: true,
        amountPaid: booking.amount_paid ?? undefined,
        currency: booking.currency ?? undefined,
      }),
    }),
  ]);

  if (clientEmail.status === "rejected") console.error("Client email failed:", clientEmail.reason);
  else if (clientEmail.value.error) console.error("Client email error:", clientEmail.value.error);
  if (adminEmail.status === "rejected") console.error("Admin email failed:", adminEmail.reason);
  else if (adminEmail.value.error) console.error("Admin email error:", adminEmail.value.error);

  return NextResponse.json({
    success: true,
    emailSent: clientEmail.status === "fulfilled" && !clientEmail.value.error,
    emailFrom: EMAIL_FROM,
    emailTo: booking.client_email,
  });
}
