import { NextRequest, NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";
import { WelcomeEmail } from "@/lib/emails/welcome";
import * as React from "react";

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const supabase = await createClient();

  // Upsert subscriber
  const { error: dbError } = await supabase
    .from("subscribers")
    .upsert({ email, name, status: "active" }, { onConflict: "email" });

  if (dbError) {
    return NextResponse.json({ error: "Could not save subscriber." }, { status: 500 });
  }

  // Send welcome email
  const { error: emailError } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Welcome to ANNE 🎉",
    react: React.createElement(WelcomeEmail, { name }),
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    // Subscriber saved — don't fail the whole request over the email
  }

  return NextResponse.json({ success: true });
}
