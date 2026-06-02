"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import type { BookingSession, BookingSlot, BookingQuestion } from "@/types";

export default function NewBookingForm({ sessions }: { sessions: BookingSession[] }) {
  const { dark } = useAdminTheme();
  const router = useRouter();

  const [sessionId, setSessionId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sendEmail, setSendEmail] = useState(true);
  const [status, setStatus] = useState<"confirmed" | "pending">("confirmed");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedSession = sessions.find(s => s.id === sessionId) ?? null;
  const availableSlots = (selectedSession?.slots ?? []).filter((s: BookingSlot) => !s.is_booked).sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.start_time.localeCompare(b.start_time);
  });
  const questions = (selectedSession?.questions ?? []) as BookingQuestion[];

  useEffect(() => { setSlotId(""); setAnswers({}); }, [sessionId]);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const label = dark ? "text-white/60" : "text-gray-600";
  const sectionTitle = `text-xs font-semibold uppercase tracking-wide mb-3 ${sub}`;
  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${dark ? "bg-white/5 border-white/8 text-white placeholder-white/20 focus:border-white/20" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300"}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId || !slotId || !name.trim() || !email.trim()) {
      setError("Session, slot, name, and email are required.");
      return;
    }

    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) {
        setError(`Please answer: ${q.question}`);
        return;
      }
    }

    setSaving(true);
    setError("");

    const res = await fetch("/api/bookings/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, slot_id: slotId, client_name: name.trim(), client_email: email.trim(), phone: phone.trim() || null, answers, status, send_email: sendEmail }),
    });

    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Something went wrong."); setSaving(false); return; }

    router.push(`/admin/booking/${json.bookingId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className={`text-sm ${sub} hover:opacity-70`}>← Back</button>
        <h1 className={`text-xl font-bold ${heading}`}>New Booking</h1>
      </div>

      {error && <p className="text-sm text-red-400 rounded-lg bg-red-400/10 px-3 py-2">{error}</p>}

      {/* Session & Slot */}
      <div className={`rounded-xl border ${card} p-5 space-y-4`}>
        <p className={sectionTitle}>Session</p>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Session *</label>
          <select value={sessionId} onChange={e => setSessionId(e.target.value)} className={inputCls}>
            <option value="">Select a session…</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>{s.title}{!s.is_free ? " (Paid)" : ""}</option>
            ))}
          </select>
        </div>

        {sessionId && (
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${label}`}>Date & Time *</label>
            {availableSlots.length === 0 ? (
              <p className={`text-xs ${sub}`}>No available slots for this session.</p>
            ) : (
              <select value={slotId} onChange={e => setSlotId(e.target.value)} className={inputCls}>
                <option value="">Select a slot…</option>
                {availableSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {new Date(slot.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {slot.start_time}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Client Details */}
      <div className={`rounded-xl border ${card} p-5 space-y-4`}>
        <p className={sectionTitle}>Client Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${label}`}>Full Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Client name" className={inputCls} />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${label}`}>Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="client@email.com" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234…" className={inputCls} />
        </div>
      </div>

      {/* Questions */}
      {questions.length > 0 && (
        <div className={`rounded-xl border ${card} p-5 space-y-4`}>
          <p className={sectionTitle}>Session Questions</p>
          {questions.map(q => (
            <div key={q.id}>
              <label className={`block text-xs font-medium mb-1.5 ${label}`}>{q.question}{q.required && " *"}</label>
              {q.type === "textarea" ? (
                <textarea value={answers[q.id] ?? ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} rows={3} className={inputCls} />
              ) : q.type === "select" ? (
                <select value={answers[q.id] ?? ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} className={inputCls}>
                  <option value="">Select…</option>
                  {(q.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input value={answers[q.id] ?? ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} className={inputCls} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Options */}
      <div className={`rounded-xl border ${card} p-5 space-y-3`}>
        <p className={sectionTitle}>Options</p>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Initial Status</label>
          <div className="flex gap-2">
            {(["confirmed", "pending"] as const).map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`rounded-lg px-4 py-2 text-xs font-medium capitalize transition-colors ${status === s ? dark ? "bg-white/15 text-white" : "bg-gray-900 text-white" : dark ? "bg-white/5 text-white/50 hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <button type="button" onClick={() => setSendEmail(e => !e)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${sendEmail ? "bg-brand" : dark ? "bg-white/10" : "bg-gray-200"}`}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${sendEmail ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm ${label}`}>Send confirmation email to client</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? "Creating…" : "Create Booking"}
        </button>
        <button type="button" onClick={() => router.back()} className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${dark ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
          Cancel
        </button>
      </div>
    </form>
  );
}
