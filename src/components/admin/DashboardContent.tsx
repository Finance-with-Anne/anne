"use client";

import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme";

const statusColors: Record<string, string> = {
  pending:   "bg-yellow-400/15 text-yellow-400",
  confirmed: "bg-blue-400/15 text-blue-400",
  completed: "bg-green-400/15 text-green-400",
  cancelled: "bg-red-400/15 text-red-400",
  active:    "bg-green-400/15 text-green-400",
  inactive:  "bg-white/10 text-white/40",
};

const lightStatusColors: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-600",
  confirmed: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
  active:    "bg-green-50 text-green-600",
  inactive:  "bg-gray-100 text-gray-400",
};

type Props = {
  stats: { blogCount: number; bookingCount: number; clientCount: number; productCount: number };
  recentClients: any[];
  recentBookings: any[];
  topPosts: any[];
};

export default function DashboardContent({ stats, recentClients, recentBookings, topPosts }: Props) {
  const { dark } = useAdminTheme();

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const tableHead = dark ? "text-white/30 border-white/5" : "text-gray-400 border-gray-100";
  const tableRow = dark ? "border-white/5 hover:bg-white/3" : "border-gray-100 hover:bg-gray-50";
  const tableText = dark ? "text-white/70" : "text-gray-700";
  const tableSub = dark ? "text-white/30" : "text-gray-400";
  const divider = dark ? "border-white/5" : "border-gray-100";

  const statCards = [
    {
      label: "Blog Posts", value: stats.blogCount, href: "/admin/blog",
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
      color: "text-blue-400", bg: dark ? "bg-blue-400/10" : "bg-blue-50",
    },
    {
      label: "Pending Bookings", value: stats.bookingCount, href: "/admin/booking",
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
      color: "text-yellow-400", bg: dark ? "bg-yellow-400/10" : "bg-yellow-50",
    },
    {
      label: "Total Clients", value: stats.clientCount, href: "/admin/clients",
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
      color: "text-green-400", bg: dark ? "bg-green-400/10" : "bg-green-50",
    },
    {
      label: "Products", value: stats.productCount, href: "/admin/products",
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
      color: "text-purple-400", bg: dark ? "bg-purple-400/10" : "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className={`text-xl font-bold ${heading}`}>Dashboard</h1>
        <p className={`text-sm mt-0.5 ${sub}`}>Here&apos;s everything happening with your platform.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href} className={`rounded-xl border p-5 flex items-start gap-4 hover:border-opacity-60 transition-all ${card}`}>
            <div className={`p-2.5 rounded-xl shrink-0 ${s.bg}`}>
              <svg className={`h-5 w-5 ${s.color}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                {s.icon}
              </svg>
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide ${sub}`}>{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${heading}`}>{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Middle row — Recent Students + Upcoming Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Students */}
        <div className={`rounded-xl border ${card}`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
            <p className={`text-sm font-semibold ${heading}`}>Recent Students</p>
            <Link href="/admin/clients" className={`text-xs ${sub} hover:underline`}>View all</Link>
          </div>
          {recentClients.length === 0 ? (
            <div className={`py-12 text-center text-sm ${sub}`}>No clients yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wide ${tableHead}`}>
                  <th className="px-5 py-3 text-left font-medium">Name</th>
                  <th className="px-5 py-3 text-left font-medium">Email</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentClients.map((c) => (
                  <tr key={c.id} className={`border-b last:border-0 transition-colors ${tableRow}`}>
                    <td className={`px-5 py-3 font-medium ${tableText}`}>{c.name}</td>
                    <td className={`px-5 py-3 ${tableSub}`}>{c.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${dark ? statusColors[c.status] : lightStatusColors[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className={`rounded-xl border ${card}`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
            <p className={`text-sm font-semibold ${heading}`}>Upcoming Bookings</p>
            <Link href="/admin/booking" className={`text-xs ${sub} hover:underline`}>View all</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className={`py-12 text-center text-sm ${sub}`}>No bookings yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wide ${tableHead}`}>
                  <th className="px-5 py-3 text-left font-medium">Client</th>
                  <th className="px-5 py-3 text-left font-medium">Service</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className={`border-b last:border-0 transition-colors ${tableRow}`}>
                    <td className={`px-5 py-3 font-medium ${tableText}`}>
                      {b.client_name}
                      <span className={`block text-xs ${tableSub}`}>{new Date(b.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {b.time}</span>
                    </td>
                    <td className={`px-5 py-3 ${tableSub}`}>{b.service}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${dark ? statusColors[b.status] : lightStatusColors[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bottom row — Top Blog Posts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top Blog Posts */}
        <div className={`lg:col-span-2 rounded-xl border ${card}`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
            <p className={`text-sm font-semibold ${heading}`}>Blog Posts</p>
            <Link href="/admin/blog" className={`text-xs ${sub} hover:underline`}>View all</Link>
          </div>
          {topPosts.length === 0 ? (
            <div className={`py-12 text-center text-sm ${sub}`}>No posts yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wide ${tableHead}`}>
                  <th className="px-5 py-3 text-left font-medium">Title</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {topPosts.map((p) => (
                  <tr key={p.id} className={`border-b last:border-0 transition-colors ${tableRow}`}>
                    <td className={`px-5 py-3 font-medium ${tableText} max-w-[240px] truncate`}>{p.title}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${p.published ? dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"}`}>
                        {p.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className={`px-5 py-3 ${tableSub}`}>{new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`rounded-xl border ${card}`}>
          <div className={`px-5 py-4 border-b ${divider}`}>
            <p className={`text-sm font-semibold ${heading}`}>Quick Actions</p>
          </div>
          <div className="p-3 space-y-1">
            {[
              { label: "New Blog Post", href: "/admin/blog/new", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /> },
              { label: "View Bookings", href: "/admin/booking", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
              { label: "Add Product", href: "/admin/products/new", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> },
              { label: "New Course", href: "/admin/courses/new", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /> },
              { label: "Send Email", href: "/admin/email", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
              { label: "Manage Clients", href: "/admin/clients", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors group ${dark ? "text-white/50 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-brand hover:bg-brand/5"}`}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  {a.icon}
                </svg>
                <span className="font-medium">{a.label}</span>
                <svg className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-40 transition-opacity" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
