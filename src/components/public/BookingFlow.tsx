"use client";

import { useState, useMemo } from "react";
import type { BookingSession, BookingSlot, BookingQuestion } from "@/types";

type Step = "calendar" | "form" | "pay" | "done";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_HEADERS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

function formatPrice(session: BookingSession, currency: string): string | null {
  if (currency === "GBP" && session.price_gbp) return `£${session.price_gbp.toLocaleString()}`;
  if (currency === "USD" && session.price_usd) return `$${session.price_usd.toLocaleString()}`;
  if (session.price_ngn) return `₦${session.price_ngn.toLocaleString()}`;
  if (session.price_usd) return `$${session.price_usd.toLocaleString()}`;
  if (session.price_gbp) return `£${session.price_gbp.toLocaleString()}`;
  return null;
}

export default function BookingFlow({
  session,
  defaultCurrency = "NGN",
  initialName = "",
  initialEmail = "",
  backHref,
}: {
  session: BookingSession;
  defaultCurrency?: string;
  initialName?: string;
  initialEmail?: string;
  backHref?: string;
}) {
  const availableSlots = (session.slots ?? []).filter((s: BookingSlot) => !s.is_booked);
  const questions = (session.questions ?? []) as BookingQuestion[];

  const today = new Date(); today.setHours(0,0,0,0);
  const [step, setStep] = useState<Step>("calendar");
  const [calMonth, setCalMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currency, setCurrency] = useState(defaultCurrency);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);

  const availableDates = useMemo(() => new Set(availableSlots.map(s => s.date)), [availableSlots]);
  const slotsForDate = useMemo(() =>
    availableSlots.filter(s => s.date === selectedDate).sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [availableSlots, selectedDate]
  );
  const calDays = useMemo(() => {
    const year = calMonth.getFullYear(), month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calMonth]);

  const price = formatPrice(session, currency);
  const whatYouGetLines = session.what_you_get?.split("\n").filter(Boolean) ?? [];

  const inputCls = "w-full rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/3 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:border-gray-300 dark:focus:border-white/20 transition-colors";

  function prevMonth() { setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)); setSelectedDate(null); setSelectedSlot(null); }
  function nextMonth() { setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)); setSelectedDate(null); setSelectedSlot(null); }
  function selectDate(day: number) {
    const dateStr = `${calMonth.getFullYear()}-${String(calMonth.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    if (!availableDates.has(dateStr)) return;
    const cellDate = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
    if (cellDate < today) return;
    setSelectedDate(dateStr);
    setSelectedSlot(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) { setError(`Please answer: ${q.question}`); return; }
    }
    setSubmitting(true); setError("");
    const res = await fetch("/api/bookings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: session.id, slot_id: selectedSlot.id, client_name: name, client_email: email, phone: phone || null, answers }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Something went wrong."); setSubmitting(false); return; }
    setBookingId(json.bookingId);
    setStep(json.requiresPayment ? "pay" : "done");
    setSubmitting(false);
  }

  async function handlePay() {
    if (!bookingId) return;
    setSubmitting(true); setError("");
    const res = await fetch("/api/bookings/pay", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId, currency }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Payment initialization failed."); setSubmitting(false); return; }
    window.location.href = json.payment_url;
  }

  // ── Left info panel ──────────────────────────────────────────────────────────
  const InfoPanel = () => (
    <div className="lg:w-64 shrink-0">
      {session.cover_image && (
        <img src={session.cover_image} alt={session.title} className="w-full aspect-square object-cover rounded-2xl mb-5" />
      )}
      <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug mb-2">{session.title}</h1>

      {session.description && (
        <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed mb-4">{session.description}</p>
      )}

      <div className="space-y-2.5 mb-5">
        <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-white/50">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>
          {session.duration_minutes} min
        </div>
        <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-white/50">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google Meet
        </div>
        {!session.is_free && price && (
          <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-900 dark:text-white">
            <svg className="h-4 w-4 shrink-0 text-gray-400 dark:text-white/30" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path strokeLinecap="round" d="M2 10h20"/></svg>
            {price}
          </div>
        )}
      </div>

      {whatYouGetLines.length > 0 && (
        <div className="space-y-1.5">
          {whatYouGetLines.map((line, i) => (
            <p key={i} className="text-sm text-gray-500 dark:text-white/50">{line}</p>
          ))}
        </div>
      )}

      {selectedSlot && (step === "form" || step === "pay") && (
        <div className="mt-5 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5 px-4 py-3">
          <p className="text-xs text-gray-400 dark:text-white/30 mb-0.5">Selected</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(selectedSlot.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <p className="text-sm text-gray-500 dark:text-white/40">{selectedSlot.start_time}</p>
        </div>
      )}
    </div>
  );

  // ── Done ─────────────────────────────────────────────────────────────────────
  if (step === "done") return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
      <InfoPanel />
      <div className="flex-1 flex items-center justify-center min-h-[420px]">
        <div className="text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-400/10 mb-2">
            <svg className="h-7 w-7 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">You&apos;re booked!</h2>
          <p className="text-sm text-gray-500 dark:text-white/40 max-w-xs mx-auto">Check your email for a confirmation with your Google Meet link.</p>
        </div>
      </div>
    </div>
  );

  // ── Pay ───────────────────────────────────────────────────────────────────────
  if (step === "pay") return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
      <InfoPanel />
      <div className="flex-1 space-y-5 max-w-sm min-h-[420px]">
        <button type="button" onClick={() => setStep("form")} className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-white/30 hover:opacity-70 mb-1">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Complete Payment</h2>
        <p className="text-sm text-gray-500 dark:text-white/40">Your slot is reserved. Pay to confirm and receive your Meet link.</p>
        {price && (
          <div className="rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/3 px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-white/30 mb-0.5">Amount due</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{price}</p>
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button onClick={handlePay} disabled={submitting} className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
          {submitting ? "Redirecting…" : "Pay with Flutterwave →"}
        </button>
      </div>
    </div>
  );

  // ── Form ──────────────────────────────────────────────────────────────────────
  if (step === "form") return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
      <InfoPanel />
      <form onSubmit={handleSubmit} className="flex-1 space-y-4 max-w-sm min-h-[420px]">
        <button type="button" onClick={() => setStep("calendar")} className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-white/30 hover:opacity-70 mb-1">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your details</h2>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-white/40 mb-1.5">Full Name *</label>
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-white/40 mb-1.5">Email *</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-white/40 mb-1.5">Phone (optional)</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234…" className={inputCls} />
        </div>
        {questions.map(q => (
          <div key={q.id}>
            <label className="block text-xs font-medium text-gray-500 dark:text-white/40 mb-1.5">{q.question}{q.required && " *"}</label>
            {q.type === "textarea" ? (
              <textarea required={q.required} value={answers[q.id] ?? ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} rows={3} className={inputCls} />
            ) : q.type === "select" ? (
              <select required={q.required} value={answers[q.id] ?? ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} className={inputCls}>
                <option value="">Select…</option>
                {(q.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input required={q.required} value={answers[q.id] ?? ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} className={inputCls} />
            )}
          </div>
        ))}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
          {submitting ? "Booking…" : session.is_free ? "Confirm Booking →" : "Continue to Payment →"}
        </button>
      </form>
    </div>
  );

  // ── Calendar ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
      <InfoPanel />

      <div className="flex-1 min-w-0 flex gap-6 min-h-[420px]">
        {/* Calendar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {MONTH_NAMES[calMonth.getMonth()]} <span className="text-gray-400 dark:text-white/30">{calMonth.getFullYear()}</span>
            </h2>
            <div className="flex gap-1">
              <button type="button" onClick={prevMonth} className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button type="button" onClick={nextMonth} className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-[9px] font-semibold text-gray-400 dark:text-white/25 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calDays.map((day, i) => {
              if (!day) return <div key={i} className="h-9 w-full" />;
              const dateStr = `${calMonth.getFullYear()}-${String(calMonth.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const isAvail = availableDates.has(dateStr);
              const cellDate = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
              const isPast = cellDate < today;
              const isToday = cellDate.getTime() === today.getTime();
              const isSelected = selectedDate === dateStr;
              return (
                <button key={i} type="button" disabled={!isAvail || isPast} onClick={() => selectDate(day)}
                  className={`relative h-9 w-full flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all
                    ${isSelected ? "bg-brand text-white" :
                      isAvail && !isPast ? "bg-gray-100 dark:bg-white/8 text-gray-900 dark:text-white hover:bg-brand/10 dark:hover:bg-brand/20 hover:text-brand cursor-pointer" :
                      "text-gray-300 dark:text-white/15 cursor-default"}
                    ${isToday && !isSelected ? "ring-2 ring-brand ring-offset-1 dark:ring-offset-[#0a0d14]" : ""}
                  `}>
                  {day}
                  {isAvail && !isPast && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-0.5 rounded-full bg-brand" />
                  )}
                </button>
              );
            })}
          </div>

          {availableSlots.length === 0 && (
            <p className="mt-4 text-sm text-gray-400 dark:text-white/30">No slots available at the moment.</p>
          )}
        </div>

        {/* Time slots — fixed-width column, always present to avoid layout shift */}
        <div className="w-32 shrink-0">
          {selectedDate && (
            <>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wide mb-2">
                {new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
              </p>
              {slotsForDate.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-white/30">No slots.</p>
              ) : (
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[380px] pr-0.5">
                  {slotsForDate.map(slot => (
                    <button key={slot.id} type="button" onClick={() => { setSelectedSlot(slot); setStep("form"); }}
                      className="w-full rounded-lg border border-gray-200 dark:border-white/8 px-2 py-2 text-xs font-medium text-gray-700 dark:text-white/60 hover:border-brand hover:text-brand dark:hover:border-brand dark:hover:text-white transition-colors text-center">
                      {slot.start_time}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
