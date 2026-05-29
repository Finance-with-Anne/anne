import { NextRequest, NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";
import { CampaignEmail } from "@/lib/emails/campaign";
import * as React from "react";

export async function POST(req: NextRequest) {
  const { campaignId } = await req.json();

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required." }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch campaign
  const { data: campaign, error: campaignError } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  }

  if (campaign.status === "sent") {
    return NextResponse.json({ error: "Campaign already sent." }, { status: 409 });
  }

  // Fetch active subscribers
  const { data: subscribers, error: subError } = await supabase
    .from("subscribers")
    .select("email, name")
    .eq("status", "active");

  if (subError || !subscribers || subscribers.length === 0) {
    return NextResponse.json({ error: "No active subscribers." }, { status: 400 });
  }

  // Batch send via Resend batch API (max 100 per call)
  const emails = subscribers.map((sub) => ({
    from: EMAIL_FROM,
    to: sub.email,
    subject: campaign.subject,
    react: React.createElement(CampaignEmail, {
      subject: campaign.subject,
      body: campaign.body,
      subscriberName: sub.name,
    }),
  }));

  // Send in chunks of 100 (Resend batch limit)
  const chunkSize = 100;
  for (let i = 0; i < emails.length; i += chunkSize) {
    await resend.batch.send(emails.slice(i, i + chunkSize));
  }

  // Mark campaign as sent
  await supabase
    .from("email_campaigns")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", campaignId);

  return NextResponse.json({ success: true, sent: subscribers.length });
}
