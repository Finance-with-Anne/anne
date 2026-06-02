import { supabaseAdmin } from "@/lib/supabase/admin";
import GoogleCalendarConnect from "@/components/admin/GoogleCalendarConnect";

export default async function BookingSettingsPage() {
  const { data: tokens } = await supabaseAdmin
    .from("google_tokens")
    .select("refresh_token, updated_at")
    .eq("id", "calendar")
    .maybeSingle();

  const isConnected = !!tokens?.refresh_token;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Booking Settings</h1>
        <p className="text-sm text-white/40 mt-0.5">Configure integrations for your booking system.</p>
      </div>
      <GoogleCalendarConnect isConnected={isConnected} connectedAt={tokens?.updated_at ?? null} />
    </div>
  );
}
