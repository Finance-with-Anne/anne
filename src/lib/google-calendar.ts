import { google } from "googleapis";
import { supabaseAdmin } from "@/lib/supabase/admin";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google-calendar/callback`
  );
}

export function getAuthUrl() {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
  });
}

export async function getStoredTokens() {
  const { data } = await supabaseAdmin
    .from("google_tokens")
    .select("*")
    .eq("id", "calendar")
    .maybeSingle();
  return data as { access_token: string; refresh_token: string; expiry_date: number } | null;
}

export async function saveTokens(tokens: { access_token?: string | null; refresh_token?: string | null; expiry_date?: number | null }) {
  await supabaseAdmin.from("google_tokens").upsert({
    id: "calendar",
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
    updated_at: new Date().toISOString(),
  });
}

export async function getAuthedClient() {
  const tokens = await getStoredTokens();
  if (!tokens?.refresh_token) return null;

  const client = getOAuthClient();
  client.setCredentials(tokens);

  // Auto-refresh and persist new tokens
  client.on("tokens", async (newTokens) => {
    await saveTokens({ ...tokens, ...newTokens });
  });

  return client;
}

export async function createMeetEvent({
  title,
  date,
  startTime,
  durationMinutes,
  attendeeEmail,
  attendeeName,
}: {
  title: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  attendeeEmail: string;
  attendeeName: string;
}): Promise<string | null> {
  const client = await getAuthedClient();
  if (!client) return null;

  const calendar = google.calendar({ version: "v3", auth: client });

  const [hours, minutes] = startTime.split(":").map(Number);
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const toISO = (d: Date) => d.toISOString();

  const event = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: `${title} — ${attendeeName}`,
      start: { dateTime: toISO(start), timeZone: "Africa/Lagos" },
      end:   { dateTime: toISO(end),   timeZone: "Africa/Lagos" },
      attendees: [{ email: attendeeEmail, displayName: attendeeName }],
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}-${attendeeEmail}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  return event.data?.conferenceData?.entryPoints?.[0]?.uri ?? null;
}
