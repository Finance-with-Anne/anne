import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { BookingConfirmationEmail } from "@/lib/emails/booking-confirmation";
import * as React from "react";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await req.json();
  const { session_id, slot_id, client_name, client_email, phone, answers, status, send_email } = body;

  if (!session_id || !slot_id || !client_name || !client_email) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const [{ data: session }, { data: slot }] = await Promise.all([
    supabaseAdmin.from("booking_sessions").select("*, questions:booking_questions(*)").eq("id", session_id).single(),
    supabaseAdmin.from("booking_slots").select("*").eq("id", slot_id).single(),
  ]);

  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (!slot) return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  if (slot.is_booked) return NextResponse.json({ error: "This slot is already taken." }, { status: 409 });

  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from("bookings")
    .insert({
      client_name,
      client_email,
      phone: phone ?? null,
      service: session.title,
      date: slot.date,
      time: slot.start_time,
      session_id,
      slot_id,
      answers: answers ?? null,
      status: status ?? "confirmed",
      is_paid: false,
    })
    .select()
    .single();

  if (bookingErr) return NextResponse.json({ error: bookingErr.message }, { status: 500 });

  await supabaseAdmin.from("booking_slots").update({ is_booked: true }).eq("id", slot_id);

  if (send_email) {
    const formattedDate = new Date(slot.date).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    await resend.emails.send({
      from: EMAIL_FROM,
      to: client_email,
      subject: `Booking Confirmed: ${session.title}`,
      react: React.createElement(BookingConfirmationEmail, {
        clientName: client_name,
        service: session.title,
        date: formattedDate,
        time: slot.start_time,
        googleMeetLink: session.google_meet_link ?? undefined,
        answers: answers ?? undefined,
        questions: (session.questions ?? []) as { id: string; question: string }[],
        isPaid: false,
      }),
    });
  }

  return NextResponse.json({ bookingId: booking.id }, { status: 201 });
}
