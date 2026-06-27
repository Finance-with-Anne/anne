"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme";
import type { Booking, BookingSession } from "@/types";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
type Status = typeof STATUSES[number];

const statusStyle: Record<Status, { dark: string; light: string }> = {
  pending:   { dark: "bg-yellow-400/15 text-yellow-400", light: "bg-yellow-50 text-yellow-600" },
  confirmed: { dark: "bg-blue-400/15 text-blue-400",    light: "bg-blue-50 text-blue-600" },
  completed: { dark: "bg-green-400/15 text-green-400",  light: "bg-green-50 text-green-600" },
  cancelled: { dark: "bg-red-400/15 text-red-400",      light: "bg-red-50 text-red-600" },
};

export default function BookingAdminPage({ bookings, sessions }: { bookings: Booking[]; sessions: BookingSession[] }) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"bookings" | "packages">(
    searchParams.get("tab") === "packages" ? "packages" : "bookings"
  );
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const tHead = dark ? "text-white/30 border-white/5 bg-white/2" : "text-gray-400 border-gray-100 bg-gray-50";
  const tRow = dark ? "border-white/5 hover:bg-white/3" : "border-gray-100 hover:bg-gray-50";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/30" : "text-gray-400";
  const inputBg = dark ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400";
  const tabActive = dark ? "bg-white/10 text-white" : "bg-gray-900 text-white";
  const tabInactive = dark ? "text-white/40 hover:text-white/70" : "text-gray-500 hover:text-gray-800";
  const filterTab = (a: boolean) => a
    ? dark ? "bg-white/10 text-white" : "bg-brand text-white"
    : dark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100";

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonth = bookings.filter(b => b.created_at >= thisMonthStart).length;

  const upcoming = bookings.filter(b =>
    (b.status === "confirmed" || b.status === "pending") &&
    new Date(b.date) >= new Date(now.toISOString().split("T")[0])
  ).length;

  const revenueNGN = bookings.filter(b => b.is_paid && b.currency === "NGN" && b.amount_paid).reduce((s, b) => s + (b.amount_paid ?? 0), 0);
  const revenueUSD = bookings.filter(b => b.is_paid && b.currency === "USD" && b.amount_paid).reduce((s, b) => s + (b.amount_paid ?? 0), 0);
  const revenueGBP = bookings.filter(b => b.is_paid && b.currency === "GBP" && b.amount_paid).reduce((s, b) => s + (b.amount_paid ?? 0), 0);
  const paidCount  = bookings.filter(b => b.is_paid).length;

  const filtered = bookings.filter(b => {
    const matchF = filter === "all" || b.status === filter;
    const matchS = !search || b.client_name.toLowerCase().includes(search.toLowerCase()) || b.service.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  async function deleteSession(id: string) {
    if (!confirm("Delete this session? All its questions and slots will also be deleted.")) return;
    setDeletingId(id);
    await fetch(`/api/booking-sessions/${id}`, { method: "DELETE" });
    router.refresh();
    setDeletingId(null);
  }

  async function executeCancelBooking(id: string) {
    setConfirmCancelId(null);
    setCancellingId(id);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    setCancellingId(null);
    router.refresh();
  }

  async function toggleSessionActive(id: string, current: boolean) {
    await fetch(`/api/booking-sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Booking</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{bookings.length} total · {counts.pending} pending</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "packages" && (
            <Link href="/admin/booking/sessions/new" className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              New Package
            </Link>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`rounded-xl border px-4 py-4 ${card}`}>
          <p className={`text-xs ${sub}`}>Total Bookings</p>
          <p className={`text-2xl font-bold mt-1 ${heading}`}>{bookings.length}</p>
          <p className={`text-xs mt-1 ${sub}`}>{thisMonth} this month</p>
        </div>
        <div className={`rounded-xl border px-4 py-4 ${card}`}>
          <p className={`text-xs ${sub}`}>Upcoming</p>
          <p className={`text-2xl font-bold mt-1 ${heading}`}>{upcoming}</p>
          <p className={`text-xs mt-1 ${sub}`}>{counts.pending} pending</p>
        </div>
        <div className={`rounded-xl border px-4 py-4 ${card}`}>
          <p className={`text-xs ${sub}`}>Paid Sessions</p>
          <p className={`text-2xl font-bold mt-1 ${heading}`}>{paidCount}</p>
          <p className={`text-xs mt-1 ${sub}`}>{counts.completed} completed</p>
        </div>
        <div className={`rounded-xl border px-4 py-4 ${card}`}>
          <p className={`text-xs ${sub}`}>Revenue</p>
          {revenueNGN > 0 && <p className={`text-xl font-bold mt-1 ${heading}`}>₦{revenueNGN.toLocaleString()}</p>}
          {revenueUSD > 0 && <p className={`text-base font-semibold ${heading}`}>${revenueUSD.toLocaleString()}</p>}
          {revenueGBP > 0 && <p className={`text-base font-semibold ${heading}`}>£{revenueGBP.toLocaleString()}</p>}
          {revenueNGN === 0 && revenueUSD === 0 && revenueGBP === 0 && <p className={`text-2xl font-bold mt-1 ${heading}`}>—</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {(["bookings", "packages"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? tabActive : tabInactive}`}>
            {t === "bookings" ? `All Bookings (${bookings.length})` : `Packages (${sessions.length})`}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {tab === "bookings" && (
        <div className={`rounded-xl border ${card}`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? "border-white/5" : "border-gray-100"}`}>
            <div className="flex items-center gap-1 flex-wrap">
              {(["all", ...STATUSES] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filterTab(filter === f)}`}>
                  {f} <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === f ? "bg-white/20" : dark ? "bg-white/5" : "bg-gray-200"}`}>{counts[f as keyof typeof counts]}</span>
                </button>
              ))}
            </div>
            <div className="relative w-48">
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${sub}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className={`w-full rounded-lg border pl-9 pr-3 py-1.5 text-xs focus:outline-none ${inputBg}`} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={`py-16 text-center text-sm ${sub}`}>No bookings found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wide ${tHead}`}>
                  <th className="px-5 py-3 text-left font-medium">Client</th>
                  <th className="px-5 py-3 text-left font-medium">Session</th>
                  <th className="px-5 py-3 text-left font-medium">Date & Time</th>
                  <th className="px-5 py-3 text-left font-medium">Payment</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(booking => (
                  <tr key={booking.id} className={`border-b last:border-0 transition-colors ${tRow}`}>
                    <td className="px-5 py-4">
                      <p className={`font-medium ${tText}`}>{booking.client_name}</p>
                      <p className={`text-xs ${tSub}`}>{booking.client_email}</p>
                    </td>
                    <td className={`px-5 py-4 ${tSub} text-xs`}>{booking.service}</td>
                    <td className={`px-5 py-4 ${tSub} text-xs`}>
                      {new Date(booking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {booking.time}
                    </td>
                    <td className="px-5 py-4">
                      {booking.is_paid ? (
                        <span className={`text-xs font-medium ${dark ? "text-green-400" : "text-green-600"}`}>Paid</span>
                      ) : (
                        <span className={`text-xs ${tSub}`}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${dark ? statusStyle[booking.status].dark : statusStyle[booking.status].light}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {booking.status !== "cancelled" && (
                          <button onClick={() => setConfirmCancelId(booking.id)} disabled={cancellingId === booking.id}
                            className="text-xs text-red-400 hover:opacity-70 disabled:opacity-40 transition-opacity">
                            {cancellingId === booking.id ? "…" : "Cancel"}
                          </button>
                        )}
                        <Link href={`/admin/booking/${booking.id}`} className={`text-xs underline ${tSub} hover:opacity-70`}>View</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {tab === "packages" && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className={`rounded-xl border ${card} py-16 text-center text-sm ${sub}`}>
              No packages yet. <Link href="/admin/booking/sessions/new" className="underline ml-1">Create one →</Link>
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className={`rounded-xl border ${card} p-5 flex items-start justify-between gap-4`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-semibold ${heading}`}>{session.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${session.is_active ? dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-white/10 text-white/30" : "bg-gray-100 text-gray-400"}`}>
                      {session.is_active ? "Active" : "Inactive"}
                    </span>
                    {!session.is_free && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${dark ? "bg-blue-400/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}>Paid</span>
                    )}
                  </div>
                  {session.description && <p className={`text-xs ${sub} line-clamp-1 mb-2`}>{session.description}</p>}
                  <div className={`flex items-center gap-4 text-xs ${sub}`}>
                    <span>{session.duration_minutes} min</span>
                    {!session.is_free && (
                      <span>
                        {[session.price_ngn ? `₦${session.price_ngn.toLocaleString()}` : null, session.price_usd ? `$${session.price_usd}` : null, session.price_gbp ? `£${session.price_gbp}` : null].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    <span>{(session.questions ?? []).length} question{(session.questions ?? []).length !== 1 ? "s" : ""}</span>
                    <span>{(session.slots ?? []).filter(s => !s.is_booked).length} available slots</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleSessionActive(session.id, session.is_active)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${dark ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {session.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <Link href={`/admin/booking/sessions/${session.id}`} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${dark ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    Edit
                  </Link>
                  <button onClick={() => deleteSession(session.id)} disabled={deletingId === session.id} className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Cancel confirmation modal */}
      {confirmCancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirmCancelId(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className={`relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${dark ? "bg-[#111318] border-white/10" : "bg-white border-gray-200"}`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`mb-1 h-10 w-10 rounded-full flex items-center justify-center ${dark ? "bg-red-400/10" : "bg-red-50"}`}>
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className={`mt-3 text-base font-bold ${dark ? "text-white" : "text-gray-900"}`}>Cancel this booking?</h3>
            <p className={`mt-1.5 text-sm ${dark ? "text-white/45" : "text-gray-500"}`}>
              This will mark the booking as cancelled. This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmCancelId(null)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Keep booking
              </button>
              <button
                onClick={() => executeCancelBooking(confirmCancelId)}
                className="flex-1 rounded-xl bg-red-500 text-white py-2.5 text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
