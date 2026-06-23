import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [bookingsRes, enrollmentsRes, subscribersRes] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select("id, client_name, service, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabaseAdmin
      .from("course_enrollments")
      .select("id, enrolled_at, profile:profiles(full_name), course:courses(title)")
      .order("enrolled_at", { ascending: false })
      .limit(10),
    supabaseAdmin
      .from("subscribers")
      .select("id, email, name, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const items = [
    ...(bookingsRes.data ?? []).map(b => ({
      id: `booking_${b.id}`,
      type: "booking" as const,
      title: `New booking from ${b.client_name}`,
      description: b.service ?? "Session booking",
      time: b.created_at,
    })),
    ...(enrollmentsRes.data ?? []).map(e => ({
      id: `enrollment_${e.id}`,
      type: "enrollment" as const,
      title: `New enrollment`,
      description: (e.course as any)?.title ?? "Unknown course",
      time: e.enrolled_at,
    })),
    ...(subscribersRes.data ?? []).map(s => ({
      id: `subscriber_${s.id}`,
      type: "subscriber" as const,
      title: `New subscriber`,
      description: s.name ? `${s.name} — ${s.email}` : s.email,
      time: s.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 20);

  return NextResponse.json(items);
}
