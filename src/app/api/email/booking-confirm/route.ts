import { NextRequest, NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";
import { BookingConfirmationEmail } from "@/lib/emails/booking-confirmation";
import { AdminBookingNotifyEmail } from "@/lib/emails/booking-admin-notify";
import * as React from "react";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? EMAIL_FROM;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { client_name, client_email, service, date, time, notes } = body;

  if (!client_name || !client_email || !service || !date || !time) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const supabase = await createClient();

  // Save booking to DB
  const { data: booking, error: dbError } = await supabase
    .from("bookings")
    .insert({ client_name, client_email, service, date, time, notes, status: "pending" })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: "Could not save booking." }, { status: 500 });
  }

  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Send confirmation to client + notify admin in parallel
  await Promise.allSettled([
    resend.emails.send({
      from: EMAIL_FROM,
      to: client_email,
      subject: `Booking Received: ${service}`,
      react: React.createElement(BookingConfirmationEmail, {
        clientName: client_name,
        service,
        date: formattedDate,
        time,
        notes,
      }),
    }),
    resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `New Booking: ${client_name} (${service})`,
      react: React.createElement(AdminBookingNotifyEmail, {
        clientName: client_name,
        clientEmail: client_email,
        service,
        date: formattedDate,
        time,
        notes,
      }),
    }),
  ]);

  return NextResponse.json({ success: true, bookingId: booking.id });
}
