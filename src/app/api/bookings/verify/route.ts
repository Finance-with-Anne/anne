import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { BookingConfirmationEmail } from "@/lib/emails/booking-confirmation";
import { AdminBookingNotifyEmail } from "@/lib/emails/booking-admin-notify";
import * as React from "react";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? EMAIL_FROM;

export async function POST(req: NextRequest) {
  const { reference, booking_id } = await req.json();

  if (!PAYSTACK_SECRET) return NextResponse.json({ error: "Payment not configured." }, { status: 503 });

  // Verify with Paystack
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  const json = await res.json();

  if (!json.status || json.data?.status !== "success") {
    return NextResponse.json({ error: "Payment not successful." }, { status: 400 });
  }

  // Fetch booking + session + questions
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*, session:booking_sessions(title, google_meet_link, questions:booking_questions(*))")
    .eq("id", booking_id)
    .single();

  if (error || !booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.is_paid) return NextResponse.json({ success: true }); // already processed

  // Mark as paid + confirmed
  await supabaseAdmin
    .from("bookings")
    .update({ is_paid: true, status: "confirmed", payment_ref: reference })
    .eq("id", booking_id);

  const session = booking.session as { title: string; google_meet_link: string | null; questions: { id: string; question: string }[] };
  const formattedDate = new Date(booking.date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Send emails
  await Promise.allSettled([
    resend.emails.send({
      from: EMAIL_FROM,
      to: booking.client_email,
      subject: `Booking Confirmed — ${session.title}`,
      react: React.createElement(BookingConfirmationEmail, {
        clientName: booking.client_name,
        service: session.title,
        date: formattedDate,
        time: booking.time,
        googleMeetLink: session.google_meet_link ?? undefined,
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

  return NextResponse.json({ success: true });
}
