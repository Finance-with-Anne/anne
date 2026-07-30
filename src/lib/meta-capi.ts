import { createHash } from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID ?? "4051514711819274";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN ?? "";
const GRAPH_URL = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`;

function sha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendMetaPurchaseEvent({
  eventId,
  email,
  value,
  currency,
  eventSourceUrl,
  clientIp,
  userAgent,
}: {
  eventId: string;
  email: string;
  value: number;
  currency: string;
  eventSourceUrl: string;
  clientIp?: string;
  userAgent?: string;
}) {
  if (!ACCESS_TOKEN) {
    console.warn("META_CAPI_ACCESS_TOKEN not set; skipping Meta Conversions API purchase event.");
    return;
  }

  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: "website",
        user_data: {
          em: [sha256(email)],
          ...(clientIp ? { client_ip_address: clientIp } : {}),
          ...(userAgent ? { client_user_agent: userAgent } : {}),
        },
        custom_data: {
          currency,
          value,
        },
      },
    ],
    access_token: ACCESS_TOKEN,
  };

  try {
    const res = await fetch(GRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("Meta Conversions API error:", await res.text());
    }
  } catch (err) {
    console.error("Meta Conversions API request failed:", err);
  }
}
