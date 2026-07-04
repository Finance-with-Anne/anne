import { supabaseAdmin } from "@/lib/supabase/admin";
import ReportsPage from "@/components/admin/ReportsPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reports | Admin" };

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

export default async function AdminReportsPage() {
  const [
    { data: bookings },
    { data: enrollments },
    { data: clients },
    { data: courses },
    { data: reviews },
    { data: orders },
  ] = await Promise.all([
    supabaseAdmin.from("bookings").select("id, status, total_amount, created_at"),
    supabaseAdmin.from("course_enrollments").select("id, course_id, completed_at, enrolled_at"),
    supabaseAdmin.from("clients").select("id, created_at"),
    supabaseAdmin.from("courses").select("id, title"),
    supabaseAdmin.from("course_reviews").select("course_id, rating"),
    supabaseAdmin.from("orders").select("id, status, total, currency, created_at"),
  ]);

  const paidOrders = (orders ?? []).filter(o => o.status === "paid");
  const ngnOrders = paidOrders.filter(o => o.currency === "NGN");

  // ── Totals ──
  const bookingsRevenue = (bookings ?? []).reduce((s, b) => s + (b.total_amount ?? 0), 0);
  const ordersRevenue = ngnOrders.reduce((s, o) => s + (o.total ?? 0), 0);
  const totalRevenue = bookingsRevenue + ordersRevenue;
  const totalEnrollments = enrollments?.length ?? 0;
  const totalClients = clients?.length ?? 0;
  const totalBookings = bookings?.length ?? 0;

  // ── Revenue paid in other currencies (not converted, shown separately) ──
  const foreignRevenue: Record<string, number> = {};
  for (const o of paidOrders) {
    if (o.currency === "NGN") continue;
    foreignRevenue[o.currency] = (foreignRevenue[o.currency] ?? 0) + (o.total ?? 0);
  }

  // ── Monthly (last 6 months) ──
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }

  const monthly = months.map(m => {
    const bookingRev = (bookings ?? [])
      .filter(b => monthKey(new Date(b.created_at)) === m)
      .reduce((s, b) => s + (b.total_amount ?? 0), 0);
    const orderRev = ngnOrders
      .filter(o => monthKey(new Date(o.created_at)) === m)
      .reduce((s, o) => s + (o.total ?? 0), 0);
    const revenue = bookingRev + orderRev;
    const enroll = (enrollments ?? [])
      .filter(e => monthKey(new Date(e.enrolled_at)) === m).length;
    const bk = (bookings ?? [])
      .filter(b => monthKey(new Date(b.created_at)) === m).length;
    return { month: m, label: monthLabel(m), revenue, enrollments: enroll, bookings: bk };
  });

  // ── Top courses ──
  const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c.title]));
  const enrollCountMap: Record<string, number> = {};
  const completionCountMap: Record<string, number> = {};
  for (const e of enrollments ?? []) {
    enrollCountMap[e.course_id] = (enrollCountMap[e.course_id] ?? 0) + 1;
    if (e.completed_at) completionCountMap[e.course_id] = (completionCountMap[e.course_id] ?? 0) + 1;
  }
  const ratingMap: Record<string, number[]> = {};
  for (const r of reviews ?? []) {
    if (!ratingMap[r.course_id]) ratingMap[r.course_id] = [];
    ratingMap[r.course_id].push(r.rating);
  }

  const topCourses = Object.entries(enrollCountMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([id, count]) => ({
      id,
      title: courseMap[id] ?? "Unknown",
      enrollments: count,
      completions: completionCountMap[id] ?? 0,
      avg_rating: ratingMap[id]?.length
        ? ratingMap[id].reduce((s, r) => s + r, 0) / ratingMap[id].length
        : null,
    }));

  // ── Bookings by status ──
  const statusCount: Record<string, number> = {};
  for (const b of bookings ?? []) {
    statusCount[b.status] = (statusCount[b.status] ?? 0) + 1;
  }
  const bookingsByStatus = Object.entries(statusCount)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <ReportsPage
      totalRevenue={totalRevenue}
      totalEnrollments={totalEnrollments}
      totalClients={totalClients}
      totalBookings={totalBookings}
      monthly={monthly}
      topCourses={topCourses}
      bookingsByStatus={bookingsByStatus}
      foreignRevenue={foreignRevenue}
    />
  );
}
