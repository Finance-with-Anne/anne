import { supabaseAdmin } from "@/lib/supabase/admin";
import NewBookingForm from "@/components/admin/NewBookingForm";
import type { BookingSession } from "@/types";

export default async function NewBookingPage() {
  const { data: sessions } = await supabaseAdmin
    .from("booking_sessions")
    .select("*, questions:booking_questions(*), slots:booking_slots(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return <NewBookingForm sessions={(sessions ?? []) as BookingSession[]} />;
}
