import { createClient } from "@/lib/supabase/server";
import BookingManager from "@/components/admin/BookingManager";

export default async function AdminBookingPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase.from("bookings").select("*").order("date", { ascending: true });
  return <BookingManager bookings={bookings ?? []} />;
}
