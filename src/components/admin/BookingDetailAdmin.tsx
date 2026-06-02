"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme";
import type { Booking, BookingSession, BookingSlot } from "@/types";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
type Status = typeof STATUSES[number];

const statusStyle: Record<Status, { dark: string; light: string }> = {
  pending:   { dark: "bg-yellow-400/15 text-yellow-400", light: "bg-yellow-50 text-yellow-600" },
  confirmed: { dark: "bg-blue-400/15 text-blue-400",    light: "bg-blue-50 text-blue-600" },
  completed: { dark: "bg-green-400/15 text-green-400",  light: "bg-green-50 text-green-600" },
  cancelled: { dark: "bg-red-400/15 text-red-400",      light: "bg-red-50 text-red-600" },
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

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const label = dark ? "text-white/50" : "text-gray-500";
  const value = dark ? "text-white/80" : "text-gray-800";
  const divider = dark ? "border-white/5" : "border-gray-100";

  const questions = booking.session?.questions ?? [];
  const answers = (booking.answers ?? {}) as Record<string, string>;

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

  async function handleDelete() {
    if (!confirm("Delete this booking permanently?")) return;
    await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" });
    router.push("/admin/booking");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/booking" className={`text-sm ${sub} hover:opacity-70`}>← All Bookings</Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>{booking.client_name}</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{booking.client_email}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${dark ? statusStyle[status].dark : statusStyle[status].light}`}>
          {status}
        </span>
      </div>

      {/* Client Details */}
      <div className={`rounded-xl border ${card} divide-y ${divider}`}>
        <div className="px-5 py-3">
          <p className={`text-xs font-semibold uppercase tracking-wide ${sub} mb-3`}>Client</p>
          <div className="grid grid-cols-2 gap-y-3">
            {[
              { l: "Name", v: booking.client_name },
              { l: "Email", v: booking.client_email },
              { l: "Phone", v: booking.phone ?? "—" },
            ].map(r => (
              <div key={r.l}>
                <p className={`text-xs ${label}`}>{r.l}</p>
                <p className={`text-sm font-medium mt-0.5 ${value}`}>{r.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3">
          <p className={`text-xs font-semibold uppercase tracking-wide ${sub} mb-3`}>Session</p>
          <div className="grid grid-cols-2 gap-y-3">
            {[
              { l: "Session", v: booking.service },
              { l: "Date", v: new Date(booking.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
              { l: "Time", v: booking.time },
              { l: "Duration", v: booking.session?.duration_minutes ? `${booking.session.duration_minutes} min` : "—" },
            ].map(r => (
              <div key={r.l}>
                <p className={`text-xs ${label}`}>{r.l}</p>
                <p className={`text-sm font-medium mt-0.5 ${value}`}>{r.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3">
          <p className={`text-xs font-semibold uppercase tracking-wide ${sub} mb-3`}>Payment</p>
          <div className="grid grid-cols-2 gap-y-3">
            {[
              { l: "Status", v: booking.is_paid ? "Paid" : booking.session?.is_free !== false ? "Free" : "Unpaid" },
              { l: "Amount", v: booking.amount_paid ? `${booking.currency} ${booking.amount_paid.toLocaleString()}` : "—" },
              { l: "Reference", v: booking.payment_ref ?? "—" },
            ].map(r => (
              <div key={r.l}>
                <p className={`text-xs ${label}`}>{r.l}</p>
                <p className={`text-sm font-medium mt-0.5 ${r.l === "Status" && booking.is_paid ? dark ? "text-green-400" : "text-green-600" : value}`}>{r.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Q&A Answers */}
      {questions.length > 0 && (
        <div className={`rounded-xl border ${card} p-5`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${sub} mb-4`}>Client Responses</p>
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id}>
                <p className={`text-xs ${label} mb-1`}>{q.question}</p>
                <p className={`text-sm font-medium ${value}`}>{answers[q.id] ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {booking.notes && (
        <div className={`rounded-xl border ${card} p-5`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${sub} mb-2`}>Notes</p>
          <p className={`text-sm ${value}`}>{booking.notes}</p>
        </div>
      )}

      {/* Status Update */}
      <div className={`rounded-xl border ${card} p-5`}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${sub} mb-3`}>Update Status</p>
        <div className="grid grid-cols-4 gap-2">
          {STATUSES.map(s => (
            <button key={s} disabled={updating || status === s} onClick={() => updateStatus(s)}
              className={`rounded-lg py-2 text-xs font-medium capitalize transition-colors ${status === s ? dark ? "bg-white/15 text-white" : "bg-gray-900 text-white" : dark ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <p className={`text-xs ${sub}`}>Booked on {new Date(booking.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>

      <button onClick={handleDelete} className="text-xs text-red-400 hover:opacity-70 transition-opacity">Delete booking</button>
    </div>
  );
}
