import { supabaseAdmin } from "@/lib/supabase/admin";
import BookingDetailAdmin from "@/components/admin/BookingDetailAdmin";
import { notFound } from "next/navigation";

export default async function BookingDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*, session:booking_sessions(*, questions:booking_questions(*)), slot:booking_slots(*)")
    .eq("id", bookingId)
    .single();

  if (error || !data) notFound();

  return <BookingDetailAdmin booking={data as Parameters<typeof BookingDetailAdmin>[0]["booking"]} />;
}
