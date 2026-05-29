import { createClient } from "@/lib/supabase/server";
import DashboardContent from "@/components/admin/DashboardContent";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: blogCount },
    { count: bookingCount },
    { count: clientCount },
    { count: productCount },
    { data: recentClients },
    { data: recentBookings },
    { data: topPosts },
  ] = await Promise.all([
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("id, name, email, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("bookings").select("id, client_name, service, date, time, status").order("date", { ascending: true }).limit(5),
    supabase.from("blog_posts").select("id, title, published, published_at, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <DashboardContent
      stats={{ blogCount: blogCount ?? 0, bookingCount: bookingCount ?? 0, clientCount: clientCount ?? 0, productCount: productCount ?? 0 }}
      recentClients={recentClients ?? []}
      recentBookings={recentBookings ?? []}
      topPosts={topPosts ?? []}
    />
  );
}
