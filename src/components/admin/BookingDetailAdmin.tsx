"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme";
import type { Booking, BookingSession, BookingSlot } from "@/types";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
type Status = typeof STATUSES[number];

const statusStyle: Record<Status, { dark: string; light: string }> = {
  pending:   { dark: "bg-yellow-400/15 text-yellow-300", light: "bg-yellow-50 text-yellow-700" },
  confirmed: { dark: "bg-blue-400/15 text-blue-300",    light: "bg-blue-50 text-blue-700" },
  completed: { dark: "bg-green-400/15 text-green-300",  light: "bg-green-50 text-green-700" },
  cancelled: { dark: "bg-red-400/15 text-red-300",      light: "bg-red-50 text-red-700" },
};

type BookingWithRelations = Booking & {
  session?: (BookingSession & { questions?: { id: string; question: string }[] }) | null;
  slot?: BookingSlot | null;
};

export default function BookingDetailAdmin({ booking }: { booking: BookingWithRelations }) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const [status, setStatus] = useState<Status>(booking.status);
  const [updating, setUpdating] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState(booking.date ?? "");
  const [newTime, setNewTime] = useState(booking.time ?? "");
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const bg       = dark ? "bg-[#0d1017]" : "bg-gray-50";
  const card     = dark ? "bg-[#111318] border-white/6" : "bg-white border-gray-200";
  const heading  = dark ? "text-white" : "text-gray-900";
  const sub      = dark ? "text-white/35" : "text-gray-400";
  const label    = dark ? "text-white/45" : "text-gray-500";
  const value    = dark ? "text-white/85" : "text-gray-800";
  const divider  = dark ? "divide-white/6" : "divide-gray-100";
  const inputCls = dark
    ? "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-white/30"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400";

  const questions = booking.session?.questions ?? [];
  const answers   = (booking.answers ?? {}) as Record<string, string>;

  const isMeetLink = (s: string) => s.startsWith("https://meet.google.com/");
  const meetLink   = booking.notes && isMeetLink(booking.notes) ? booking.notes : null;
  const plainNotes = booking.notes && !isMeetLink(booking.notes) ? booking.notes : null;

  async function updateStatus(s: Status) {
    setUpdating(true);
    await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    setStatus(s);
    setUpdating(false);
    router.refresh();
  }

  async function handleReschedule() {
    if (!newDate || !newTime) return;
    setRescheduling(true);
    await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: newDate, time: newTime, notes: rescheduleNote || undefined, status: "confirmed", _action: "reschedule" }),
    });
    setRescheduling(false);
    setShowReschedule(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this booking permanently? This cannot be undone.")) return;
    await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" });
    router.push("/admin/booking");
    router.refresh();
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="space-y-4">

      {/* Back */}
      <Link href="/admin/booking" className={`inline-flex items-center gap-1.5 text-sm ${sub} hover:opacity-80 transition-opacity`}>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        All Bookings
      </Link>

      {/* Header card */}
      <div className={`rounded-2xl border ${card} p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className={`text-lg font-bold ${heading} truncate`}>{booking.client_name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${dark ? statusStyle[status].dark : statusStyle[status].light}`}>
                {status}
              </span>
            </div>
            <p className={`text-sm mt-0.5 ${sub} truncate`}>{booking.client_email}{booking.phone ? ` · ${booking.phone}` : ""}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {status === "pending" && (
              <button onClick={() => updateStatus("confirmed")} disabled={updating}
                className="rounded-lg bg-[#0822C0] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0620a8] disabled:opacity-40 transition-colors">
                Confirm
              </button>
            )}
            {status !== "completed" && status !== "cancelled" && (
              <button onClick={() => updateStatus("completed")} disabled={updating}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-40 ${dark ? "bg-green-500/15 text-green-300 hover:bg-green-500/25 border border-green-500/20" : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"}`}>
                Complete
              </button>
            )}
            {status !== "cancelled" && (
              <>
                <button onClick={() => setShowReschedule(true)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors border ${dark ? "bg-white/5 text-white/70 hover:bg-white/10 border-white/10" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"}`}>
                  Reschedule
                </button>
                <button onClick={() => { if (confirm("Cancel this booking?")) updateStatus("cancelled"); }} disabled={updating}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors border disabled:opacity-40 ${dark ? "bg-red-500/10 text-red-300 hover:bg-red-500/20 border-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"}`}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info grid — expands to 3 cols when meet link present */}
      <div className={`grid gap-4 ${meetLink ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>

        {/* Session */}
        <div className={`rounded-2xl border ${card} p-5`}>
          <p className={`text-xs font-semibold uppercase tracking-widest ${sub} mb-4`}>Session</p>
          <div className="space-y-3">
            <Row label="Service" value={booking.service} l={label} v={value} />
            <Row label="Date" value={fmtDate(booking.date)} l={label} v={value} />
            <Row label="Time" value={booking.time} l={label} v={value} />
            {booking.session?.duration_minutes && (
              <Row label="Duration" value={`${booking.session.duration_minutes} min`} l={label} v={value} />
            )}
          </div>
        </div>

        {/* Payment */}
        <div className={`rounded-2xl border ${card} p-5`}>
          <p className={`text-xs font-semibold uppercase tracking-widest ${sub} mb-4`}>Payment</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${label}`}>Status</span>
              <span className={`text-xs font-semibold ${booking.is_paid ? dark ? "text-green-400" : "text-green-600" : dark ? "text-white/50" : "text-gray-400"}`}>
                {booking.is_paid ? "Paid" : booking.session?.is_free !== false ? "Free" : "Unpaid"}
              </span>
            </div>
            {booking.amount_paid && (
              <Row label="Amount" value={`${booking.currency} ${booking.amount_paid.toLocaleString()}`} l={label} v={value} />
            )}
            {booking.payment_ref && (
              <div>
                <span className={`text-xs ${label}`}>Reference</span>
                <p className={`text-xs font-mono mt-0.5 break-all ${dark ? "text-white/50" : "text-gray-400"}`}>{booking.payment_ref}</p>
              </div>
            )}
          </div>
        </div>

        {/* Google Meet — third column when present */}
        {meetLink && (
          <div className={`rounded-2xl border ${card} p-5`}>
            <p className={`text-xs font-semibold uppercase tracking-widest ${sub} mb-4`}>Google Meet</p>
            <div className={`flex flex-col gap-3 rounded-xl px-4 py-4 h-[calc(100%-2rem)] justify-between ${dark ? "bg-blue-400/8 border border-blue-400/15" : "bg-blue-50 border border-blue-100"}`}>
              <div className="flex items-center gap-2">
                <svg className={`h-4 w-4 shrink-0 ${dark ? "text-blue-400" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                <span className={`text-xs font-mono truncate ${dark ? "text-blue-300" : "text-blue-700"}`}>{meetLink}</span>
              </div>
              <a href={meetLink} target="_blank" rel="noopener noreferrer"
                className="w-full text-center rounded-lg bg-[#0822C0] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
                Join Meeting →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Q&A */}
      {questions.length > 0 && (
        <div className={`rounded-2xl border ${card} p-5`}>
          <p className={`text-xs font-semibold uppercase tracking-widest ${sub} mb-4`}>Client Responses</p>
          <div className={`divide-y ${divider} space-y-0`}>
            {questions.map(q => (
              <div key={q.id} className="py-3 first:pt-0 last:pb-0">
                <p className={`text-xs ${label} mb-1`}>{q.question}</p>
                <p className={`text-sm font-medium ${value}`}>{answers[q.id] ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {plainNotes && (
        <div className={`rounded-2xl border ${card} p-5`}>
          <p className={`text-xs font-semibold uppercase tracking-widest ${sub} mb-2`}>Notes</p>
          <p className={`text-sm ${value}`}>{plainNotes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <p className={`text-xs ${sub}`}>
          Booked {new Date(booking.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
        <button onClick={handleDelete}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors border ${dark ? "bg-red-500/8 text-red-400 hover:bg-red-500/15 border-red-500/15" : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"}`}>
          Delete booking
        </button>
      </div>

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${dark ? "bg-[#111318] border-white/10" : "bg-white border-gray-200"}`}>
            <h2 className={`text-base font-bold mb-1 ${heading}`}>Reschedule Booking</h2>
            <p className={`text-xs mb-5 ${sub}`}>{booking.client_name}, {booking.service}</p>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${label}`}>New Date</label>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${inputCls}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${label}`}>New Time</label>
                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${inputCls}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${label}`}>Note to client (optional)</label>
                <textarea rows={3} value={rescheduleNote} onChange={e => setRescheduleNote(e.target.value)}
                  placeholder="Reason for rescheduling, additional info…"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none resize-none ${inputCls}`} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button onClick={handleReschedule} disabled={rescheduling || !newDate || !newTime}
                className="flex-1 rounded-lg bg-[#0822C0] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 transition-opacity">
                {rescheduling ? "Saving…" : "Confirm Reschedule"}
              </button>
              <button onClick={() => setShowReschedule(false)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors border ${dark ? "bg-white/5 text-white/60 hover:bg-white/10 border-white/10" : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"}`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label: l, value: v, l: lCls, v: vCls }: { label: string; value: string; l: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-xs ${lCls} shrink-0`}>{l}</span>
      <span className={`text-xs font-semibold text-right ${vCls}`}>{v}</span>
    </div>
  );
}
