"use client";

import { useState } from "react";
import type { BookingSession, BookingSlot, BookingQuestion } from "@/types";

type Step = "slot" | "form" | "pay" | "done";

export default function BookingFlow({ session, defaultCurrency = "NGN" }: { session: BookingSession; defaultCurrency?: string }) {
  const slots = (session.slots ?? []).filter((s: BookingSlot) => !s.is_booked).sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.start_time.localeCompare(b.start_time);
  });
  const questions = (session.questions ?? []) as BookingQuestion[];

  const [step, setStep] = useState<Step>("slot");
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currency, setCurrency] = useState(defaultCurrency);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);

  const inputCls = "w-full rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/3 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:border-gray-300 dark:focus:border-white/20 transition-colors";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;

    // Validate required questions
    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) {
        setError(`Please answer: ${q.question}`);
        return;
      }
    }

    setSubmitting(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: session.id,
        slot_id: selectedSlot.id,
        client_name: name,
        client_email: email,
        phone: phone || null,
        answers,
      }),
    });

    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Something went wrong."); setSubmitting(false); return; }

    setBookingId(json.bookingId);

    if (json.requiresPayment) {
      setStep("pay");
    } else {
      setStep("done");
    }
    setSubmitting(false);
  }

  async function handlePay() {
    if (!bookingId) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/bookings/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId, currency }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Payment initialization failed."); setSubmitting(false); return; }
    window.location.href = json.authorization_url;
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-white/40">No available slots for this session at the moment.</p>
        <p className="text-sm text-gray-400 dark:text-white/25 mt-1">Check back soon or contact us directly.</p>
      </div>
    );
  }

  // Group slots by date
  const slotsByDate = slots.reduce<Record<string, BookingSlot[]>>((acc, s) => {
    (acc[s.date] = acc[s.date] ?? []).push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-lg">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["slot", "form", !session.is_free ? "pay" : null, "done"] as (Step | null)[]).filter(Boolean).map((s, i, arr) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full transition-colors ${step === s ? "bg-brand" : (arr.indexOf(step) > i ? "bg-brand/40" : "bg-gray-200 dark:bg-white/10")}`} />
            {i < arr.length - 1 && <div className={`h-px w-8 ${arr.indexOf(step) > i ? "bg-brand/40" : "bg-gray-200 dark:bg-white/10"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Pick a slot */}
      {step === "slot" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pick a date & time</h2>
          {Object.entries(slotsByDate).map(([date, dateSlots]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wide mb-2">
                {new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {dateSlots.map(slot => (
                  <button key={slot.id} onClick={() => setSelectedSlot(slot)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${selectedSlot?.id === slot.id ? "border-brand bg-brand text-white" : "border-gray-200 dark:border-white/8 text-gray-700 dark:text-white/60 hover:border-brand dark:hover:border-brand hover:text-brand"}`}>
                    {slot.start_time}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => { if (!selectedSlot) { setError("Please select a time slot."); return; } setError(""); setStep("form"); }}
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity mt-2">
            Continue →
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}

      {/* Step 2: Fill in details */}
      {step === "form" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <button type="button" onClick={() => setStep("slot")} className="text-sm text-gray-400 dark:text-white/30 hover:opacity-70">← Back</button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your details</h2>
          </div>
          {selectedSlot && (
            <div className="rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5 px-4 py-3 text-sm">
              <p className="text-gray-500 dark:text-white/40 text-xs mb-0.5">Selected slot</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(selectedSlot.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {selectedSlot.start_time}
              </p>
            </div>
          )}
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
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234..." className={inputCls} />
          </div>

          {questions.map(q => (
            <div key={q.id}>
              <label className="block text-xs font-medium text-gray-500 dark:text-white/40 mb-1.5">
                {q.question}{q.required && " *"}
              </label>
              {q.type === "textarea" ? (
                <textarea required={q.required} value={answers[q.id] ?? ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} rows={3} className={inputCls} />
              ) : q.type === "select" ? (
                <select required={q.required} value={answers[q.id] ?? ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} className={inputCls}>
                  <option value="">Select an option…</option>
                  {(q.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input required={q.required} value={answers[q.id] ?? ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} className={inputCls} />
              )}
            </div>
          ))}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? "Booking…" : session.is_free ? "Confirm Booking →" : "Continue to Payment →"}
          </button>
        </form>
      )}

      {/* Step 3: Pay */}
      {step === "pay" && !session.is_free && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Complete Payment</h2>
          <p className="text-sm text-gray-500 dark:text-white/40">
            Your slot is reserved. Complete payment to confirm your booking and receive the Google Meet link.
          </p>

          <div className="rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-white/40">Session</span>
              <span className="font-medium text-gray-900 dark:text-white">{session.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-white/40">Date</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedSlot && `${new Date(selectedSlot.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${selectedSlot.start_time}`}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-white/40 mb-2">Pay in</label>
            <div className="flex gap-2">
              {[
                session.price_ngn ? { code: "NGN", label: `₦${session.price_ngn.toLocaleString()}` } : null,
                session.price_usd ? { code: "USD", label: `$${session.price_usd}` } : null,
                session.price_gbp ? { code: "GBP", label: `£${session.price_gbp}` } : null,
              ].filter(Boolean).map(c => (
                <button key={c!.code} type="button" onClick={() => setCurrency(c!.code)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${currency === c!.code ? "border-brand bg-brand text-white" : "border-gray-200 dark:border-white/8 text-gray-700 dark:text-white/60 hover:border-brand"}`}>
                  {c!.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button onClick={handlePay} disabled={submitting} className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? "Redirecting…" : "Pay with Paystack →"}
          </button>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <div className="text-center py-8 space-y-4">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-50 dark:bg-green-400/10 mb-2">
            <svg className="h-7 w-7 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Booking Confirmed!</h2>
          <p className="text-sm text-gray-500 dark:text-white/40 max-w-xs mx-auto">
            Check your email for a confirmation with the Google Meet link for your session.
          </p>
        </div>
      )}
    </div>
  );
}
