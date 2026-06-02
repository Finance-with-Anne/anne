import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import BookingAdminPage from "@/components/admin/BookingAdminPage";
import type { Booking, BookingSession } from "@/types";

export default async function AdminBookingPage() {
  const supabase = await createClient();
  const [{ data: bookings }, { data: sessions }] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("booking_sessions").select("*, questions:booking_questions(*), slots:booking_slots(*)").order("created_at", { ascending: false }),
  ]);

  return (
    <BookingAdminPage
      bookings={(bookings ?? []) as Booking[]}
      sessions={(sessions ?? []) as BookingSession[]}
    />
  );
}
