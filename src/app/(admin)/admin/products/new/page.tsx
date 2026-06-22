import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ProductSourcePicker from "@/components/admin/ProductSourcePicker";
import type { Course, BookingSession } from "@/types";

export default async function NewProductPage() {
  const supabase = await createClient();
  const [{ data: courses }, { data: sessions }] = await Promise.all([
    supabase.from("courses").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("booking_sessions").select("*").eq("is_active", true).order("created_at", { ascending: false }),
  ]);

  return (
    <ProductSourcePicker
      courses={(courses ?? []) as Course[]}
      sessions={(sessions ?? []) as BookingSession[]}
    />
  );
}
