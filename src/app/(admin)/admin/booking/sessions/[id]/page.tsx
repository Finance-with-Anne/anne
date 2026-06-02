import { supabaseAdmin } from "@/lib/supabase/admin";
import BookingSessionForm from "@/components/admin/BookingSessionForm";
import type { BookingSession } from "@/types";
import { notFound } from "next/navigation";

export default async function EditBookingSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("booking_sessions")
    .select("*, questions:booking_questions(*), slots:booking_slots(*)")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return <BookingSessionForm session={data as BookingSession} />;
}
