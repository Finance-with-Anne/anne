"use client";

import { useAdminTheme } from "@/lib/admin-theme";

type MonthlyData = { month: string; label: string; revenue: number; enrollments: number; bookings: number };
type CourseRow = { id: string; title: string; enrollments: number; completions: number; avg_rating: number | null };
type BookingStatusRow = { status: string; count: number };

type Props = {
  totalRevenue: number;
  totalEnrollments: number;
  totalClients: number;
  totalBookings: number;
  monthly: MonthlyData[];
  topCourses: CourseRow[];
  bookingsByStatus: BookingStatusRow[];
};

function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

function BarChart({ data, valueKey, color, label }: { data: MonthlyData[]; valueKey: "revenue" | "enrollments" | "bookings"; color: string; label: string }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</p>
      <div className="flex items-end gap-1.5 h-32">
        {data.map(d => {
          const h = Math.max((d[valueKey] / max) * 100, 2);
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative flex-1 flex items-end w-full">
                <div
                  className={`w-full rounded-t-md ${color} transition-all duration-500 group-hover:opacity-80`}
                  style={{ height: `${h}%` }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block text-[10px] font-bold whitespace-nowrap bg-gray-900 text-white rounded px-1.5 py-0.5 z-10">
                  {valueKey === "revenue" ? fmt(d[valueKey]) : d[valueKey]}
                </div>
              </div>
              <span className="text-[9px] text-gray-400">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReportsPage({ totalRevenue, totalEnrollments, totalClients, totalBookings, monthly, topCourses, bookingsByStatus }: Props) {
  const { dark } = useAdminTheme();

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const tText = dark ? "text-white/80" : "text-gray-700";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const tRow = dark ? "border-white/5 hover:bg-white/[0.03]" : "border-gray-100 hover:bg-gray-50";

  const statCards = [
    {
      label: "Total Revenue", value: fmt(totalRevenue),
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      color: "text-green-400", bg: dark ? "bg-green-400/10" : "bg-green-50",
    },
    {
      label: "Total Enrollments", value: totalEnrollments.toLocaleString(),
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
      color: "text-blue-400", bg: dark ? "bg-blue-400/10" : "bg-blue-50",
    },
    {
      label: "Total Bookings", value: totalBookings.toLocaleString(),
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
      color: "text-purple-400", bg: dark ? "bg-purple-400/10" : "bg-purple-50",
    },
    {
      label: "Total Clients", value: totalClients.toLocaleString(),
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
      color: "text-orange-400", bg: dark ? "bg-orange-400/10" : "bg-orange-50",
    },
  ];

  const statusColors: Record<string, string> = {
    pending: dark ? "bg-amber-400/15 text-amber-400" : "bg-amber-50 text-amber-600",
    confirmed: dark ? "bg-blue-400/15 text-blue-400" : "bg-blue-50 text-blue-600",
    completed: dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600",
    cancelled: dark ? "bg-red-400/15 text-red-400" : "bg-red-50 text-red-600",
  };

  const totalForStatus = bookingsByStatus.reduce((s, b) => s + b.count, 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-xl font-bold ${heading}`}>Reports</h1>
        <p className={`text-sm mt-0.5 ${sub}`}>Revenue, enrollment, and booking analytics across your platform.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 ${card}`}>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
              <svg className={`h-4.5 w-4.5 ${s.color}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                {s.icon}
              </svg>
            </div>
            <p className={`text-2xl font-extrabold ${heading}`}>{s.value}</p>
            <p className={`text-xs mt-0.5 ${sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-6 ${card}`}>
          <BarChart data={monthly} valueKey="revenue" color={dark ? "bg-green-400" : "bg-green-500"} label="Monthly Revenue (₦)" />
        </div>
        <div className={`rounded-2xl border p-6 ${card}`}>
          <BarChart data={monthly} valueKey="enrollments" color={dark ? "bg-blue-400" : "bg-blue-500"} label="Monthly Enrollments" />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top courses */}
        <div className={`lg:col-span-2 rounded-2xl border ${card}`}>
          <div className={`px-5 py-4 border-b ${divider}`}>
            <p className={`text-sm font-semibold ${heading}`}>Top Courses by Enrollment</p>
          </div>
          {topCourses.length === 0 ? (
            <div className={`py-12 text-center text-sm ${sub}`}>No course data yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs uppercase tracking-wide border-b ${dark ? "text-white/25 border-white/5" : "text-gray-400 border-gray-100"}`}>
                  <th className="px-5 py-3 text-left font-medium">Course</th>
                  <th className="px-5 py-3 text-right font-medium">Enrolled</th>
                  <th className="px-5 py-3 text-right font-medium">Completed</th>
                  <th className="px-5 py-3 text-right font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topCourses.map((c, i) => (
                  <tr key={c.id} className={`border-b last:border-0 ${tRow}`}>
                    <td className={`px-5 py-3.5 ${tText}`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-bold w-5 text-center ${sub}`}>#{i + 1}</span>
                        <span className="font-medium truncate max-w-[240px]">{c.title}</span>
                      </div>
                    </td>
                    <td className={`px-5 py-3.5 text-right font-semibold ${heading}`}>{c.enrollments}</td>
                    <td className={`px-5 py-3.5 text-right ${sub}`}>{c.completions}</td>
                    <td className="px-5 py-3.5 text-right">
                      {c.avg_rating ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {Number(c.avg_rating).toFixed(1)}
                        </span>
                      ) : <span className={sub}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Booking status breakdown */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <p className={`text-sm font-semibold mb-4 ${heading}`}>Bookings by Status</p>
          <div className="space-y-3">
            {bookingsByStatus.map(b => (
              <div key={b.status} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${statusColors[b.status] ?? (dark ? "bg-white/5 text-white/40" : "bg-gray-100 text-gray-400")} px-2 py-0.5 rounded-full`}>
                    {b.status}
                  </span>
                  <span className={`text-xs font-semibold ${heading}`}>{b.count}</span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.status === "completed" ? "bg-green-500" :
                      b.status === "confirmed" ? "bg-blue-500" :
                      b.status === "pending" ? "bg-amber-500" : "bg-red-400"
                    }`}
                    style={{ width: `${(b.count / totalForStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {bookingsByStatus.length === 0 && (
              <p className={`text-sm text-center py-8 ${sub}`}>No bookings yet.</p>
            )}
          </div>

          {/* Bookings bar chart */}
          {monthly.some(m => m.bookings > 0) && (
            <div className="mt-6 pt-5 border-t" style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6" }}>
              <BarChart data={monthly} valueKey="bookings" color={dark ? "bg-purple-400" : "bg-purple-500"} label="Bookings / Month" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
