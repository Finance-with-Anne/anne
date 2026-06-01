import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resend, EMAIL_FROM } from "@/lib/resend";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { to, subject, body } = await req.json();
  if (!to || !subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "to, subject and body are required." }, { status: 400 });
  }

  void id;

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: subject.trim(),
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <p style="white-space:pre-wrap;font-size:15px;line-height:1.6;color:#111">${body.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="font-size:12px;color:#888">Sent from Finance with Anne admin dashboard</p>
    </div>`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
