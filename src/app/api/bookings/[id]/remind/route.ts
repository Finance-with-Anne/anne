import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";

/** Admin-triggered nudge for a client who started a paid booking but never paid. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("client_name, client_email, service, is_paid, session:booking_sessions(slug, title)")
    .eq("id", id)
    .single();

  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.is_paid) return NextResponse.json({ error: "This booking is already paid." }, { status: 400 });

  const session = booking.session as unknown as { slug: string; title: string } | null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://financewithanne.com";
  const bookUrl = `${siteUrl}/booking/${session?.slug ?? ""}`;
  const service = session?.title ?? booking.service;
  const firstName = (booking.client_name as string).trim().split(" ")[0] || "there";

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: booking.client_email,
    replyTo: process.env.ADMIN_EMAIL ?? undefined,
    subject: `Your ${service} booking isn't complete yet`,
    html: `<html><body style="font-family:Arial,sans-serif;color:#111;background:#fff;margin:0;padding:0">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px">
        <tr><td>
          <h1 style="font-size:24px;font-weight:700">Finance with Anne</h1>
          <hr style="border-color:#e5e7eb;margin:16px 0"/>
          <p style="color:#4b5563;font-size:15px;line-height:1.6">Hi ${firstName},</p>
          <p style="color:#4b5563;font-size:15px;line-height:1.6">I noticed you started booking a <strong>${service}</strong> with me but the payment didn't go through, so your session isn't confirmed yet.</p>
          <p style="color:#4b5563;font-size:15px;line-height:1.6">If you'd still like to talk through your finances, you can pick a time and complete your booking here:</p>
          <p style="margin:28px 0"><a href="${bookUrl}" style="background:#0822C0;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">Complete my booking</a></p>
          <p style="color:#4b5563;font-size:15px;line-height:1.6">If you had trouble paying or have any questions, just reply to this email and I'll help.</p>
          <p style="color:#4b5563;margin-top:20px">Warm regards,<br/><strong>Anne</strong></p>
          <hr style="border-color:#e5e7eb;margin:32px 0 16px"/>
          <p style="font-size:11px;color:#9ca3af;text-align:center">Finance with Anne: Building Wealth, One Step at a Time</p>
        </td></tr>
      </table>
    </body></html>`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
