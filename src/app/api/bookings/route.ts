import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { BookingConfirmationEmail } from "@/lib/emails/booking-confirmation";
import { AdminBookingNotifyEmail } from "@/lib/emails/booking-admin-notify";
import { createMeetEvent } from "@/lib/google-calendar";
import * as React from "react";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? EMAIL_FROM;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  let query = supabaseAdmin
    .from("bookings")
    .select("*, session:booking_sessions(title, slug), slot:booking_slots(date, start_time)")
    .order("created_at", { ascending: false });

  if (sessionId) query = query.eq("session_id", sessionId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { session_id, slot_id, client_name, client_email, phone, answers } = body;

  if (!client_name || !client_email || !session_id || !slot_id) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Fetch session to check if paid
  const { data: session, error: sessionErr } = await supabaseAdmin
    .from("booking_sessions")
    .select("*, questions:booking_questions(*)")
    .eq("id", session_id)
    .single();
  if (sessionErr || !session) return NextResponse.json({ error: "Session not found." }, { status: 404 });

  // Fetch slot
  const { data: slot, error: slotErr } = await supabaseAdmin
    .from("booking_slots")
    .select("*")
    .eq("id", slot_id)
    .single();
  if (slotErr || !slot) return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  if (slot.is_booked) return NextResponse.json({ error: "This slot is already taken." }, { status: 409 });

  // Create booking
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
      status: "pending",
      is_paid: false,
    })
    .select()
    .single();
  if (bookingErr) return NextResponse.json({ error: bookingErr.message }, { status: 500 });

  // Mark slot as booked
  await supabaseAdmin.from("booking_slots").update({ is_booked: true }).eq("id", slot_id);

  // If paid, return booking id so frontend can redirect to payment
  if (!session.is_free) {
    return NextResponse.json({ bookingId: booking.id, requiresPayment: true });
  }

  // Free booking — auto-create Meet + send emails
  const formattedDate = new Date(slot.date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Try to auto-create Google Meet; fall back to manually stored link
  const autoMeetLink = await createMeetEvent({
    title: session.title,
    date: slot.date,
    startTime: slot.start_time,
    durationMinutes: session.duration_minutes ?? 60,
    attendeeEmail: client_email,
    attendeeName: client_name,
  }).catch(() => null);
  const meetLink = autoMeetLink ?? session.google_meet_link ?? undefined;

  if (autoMeetLink) {
    await supabaseAdmin.from("bookings").update({ notes: autoMeetLink }).eq("id", booking.id);
  }

  await Promise.allSettled([
    resend.emails.send({
      from: EMAIL_FROM,
      to: client_email,
      subject: `Booking Confirmed — ${session.title}`,
      react: React.createElement(BookingConfirmationEmail, {
        clientName: client_name,
        service: session.title,
        date: formattedDate,
        time: slot.start_time,
        googleMeetLink: meetLink,
        answers: answers ?? undefined,
        questions: session.questions ?? [],
        isPaid: false,
      }),
    }),
    resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `New Booking: ${client_name} — ${session.title}`,
      react: React.createElement(AdminBookingNotifyEmail, {
        clientName: client_name,
        clientEmail: client_email,
        phone: phone ?? undefined,
        service: session.title,
        date: formattedDate,
        time: slot.start_time,
        answers: answers ?? undefined,
        questions: session.questions ?? [],
      }),
    }),
  ]);

  await supabaseAdmin.from("bookings").update({ status: "confirmed" }).eq("id", booking.id);

  return NextResponse.json({ bookingId: booking.id, requiresPayment: false });
}
