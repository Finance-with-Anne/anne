"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import type { BookingSession, BookingQuestion, BookingSlot } from "@/types";

type QuestionDraft = { id?: string; question: string; type: "text" | "textarea" | "select"; options: string; required: boolean };
type DayAvail = { enabled: boolean; start: string; end: string };
type Availability = { [day: number]: DayAvail }; // 0=Sun … 6=Sat

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DEFAULT_AVAIL: Availability = {
  0: { enabled: false, start: "09:00", end: "17:00" },
  1: { enabled: true,  start: "09:00", end: "17:00" },
  2: { enabled: true,  start: "09:00", end: "17:00" },
  3: { enabled: true,  start: "09:00", end: "17:00" },
  4: { enabled: true,  start: "09:00", end: "17:00" },
  5: { enabled: true,  start: "09:00", end: "17:00" },
  6: { enabled: false, start: "09:00", end: "17:00" },
};

function parseAvailability(raw: unknown): Availability {
  if (!raw || typeof raw !== "object") return DEFAULT_AVAIL;
  const r = raw as Record<string, DayAvail>;
  return Object.fromEntries(
    [0,1,2,3,4,5,6].map(d => [d, r[d] ?? DEFAULT_AVAIL[d]])
  );
}

function generateSlots(avail: Availability, durationMin: number, weeksAhead: number): { date: string; start_time: string }[] {
  const slots: { date: string; start_time: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let w = 0; w < weeksAhead; w++) {
    for (let d = 0; d < 7; d++) {
      const day = avail[d];
      if (!day.enabled) continue;

      const date = new Date(today);
      date.setDate(today.getDate() + w * 7 + ((d - today.getDay() + 7) % 7) + (w === 0 && d <= today.getDay() ? 7 : 0));
      if (date <= today) continue;

      const dateStr = date.toISOString().split("T")[0];
      const [sh, sm] = day.start.split(":").map(Number);
      const [eh, em] = day.end.split(":").map(Number);
      let cur = sh * 60 + sm;
      const end = eh * 60 + em;

      while (cur + durationMin <= end) {
        const hh = String(Math.floor(cur / 60)).padStart(2, "0");
        const mm = String(cur % 60).padStart(2, "0");
        slots.push({ date: dateStr, start_time: `${hh}:${mm}` });
        cur += durationMin;
      }
    }
  }
  return slots;
}

export default function BookingSessionForm({ session }: { session?: BookingSession }) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const isEdit = !!session;

  const [title, setTitle] = useState(session?.title ?? "");
  const [description, setDescription] = useState(session?.description ?? "");
  const [duration, setDuration] = useState(session?.duration_minutes ?? 60);
  const [isFree, setIsFree] = useState(session?.is_free ?? true);
  const [priceNgn, setPriceNgn] = useState(session?.price_ngn?.toString() ?? "");
  const [priceUsd, setPriceUsd] = useState(session?.price_usd?.toString() ?? "");
  const [priceGbp, setPriceGbp] = useState(session?.price_gbp?.toString() ?? "");
  const [meetLink, setMeetLink] = useState(session?.google_meet_link ?? "");
  const [coverImage, setCoverImage] = useState(session?.cover_image ?? "");
  const [whatYouGet, setWhatYouGet] = useState(session?.what_you_get ?? "");
  const [isActive, setIsActive] = useState(session?.is_active ?? true);
  const [availability, setAvailability] = useState<Availability>(
    parseAvailability((session as BookingSession & { availability?: unknown })?.availability)
  );
  const [weeksAhead, setWeeksAhead] = useState(4);

  // Existing booked slots (edit mode — read-only display)
  const bookedSlots = (session?.slots ?? []).filter((s: BookingSlot) => s.is_booked);

  const [questions, setQuestions] = useState<QuestionDraft[]>(
    (session?.questions ?? []).map((q: BookingQuestion) => ({
      id: q.id, question: q.question, type: q.type,
      options: (q.options ?? []).join(", "), required: q.required,
    }))
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const card  = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub   = dark ? "text-white/40" : "text-gray-400";
  const label = dark ? "text-white/60" : "text-gray-600";
  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${dark ? "bg-white/5 border-white/8 text-white placeholder-white/20 focus:border-white/20" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300"}`;
  const sectionTitle = `text-xs font-semibold uppercase tracking-wide mb-3 ${sub}`;

  function setDay(d: number, patch: Partial<DayAvail>) {
    setAvailability(a => ({ ...a, [d]: { ...a[d], ...patch } }));
  }

  function addQuestion() {
    setQuestions(q => [...q, { question: "", type: "text", options: "", required: false }]);
  }
  function updateQuestion(i: number, patch: Partial<QuestionDraft>) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  }
  function removeQuestion(i: number) {
    setQuestions(qs => qs.filter((_, idx) => idx !== i));
  }

  // Preview how many slots will be generated
  const previewCount = generateSlots(availability, Number(duration) || 60, weeksAhead).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");

    const newSlots = generateSlots(availability, Number(duration) || 60, weeksAhead);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      duration_minutes: Number(duration),
      is_free: isFree,
      price_ngn: !isFree && priceNgn ? Number(priceNgn) : null,
      price_usd: !isFree && priceUsd ? Number(priceUsd) : null,
      price_gbp: !isFree && priceGbp ? Number(priceGbp) : null,
      google_meet_link: meetLink.trim() || null,
      cover_image: coverImage.trim() || null,
      what_you_get: whatYouGet.trim() || null,
      is_active: isActive,
      availability,
      questions: questions.map((q, i) => ({
        ...(q.id ? { id: q.id } : {}),
        question: q.question, type: q.type,
        options: q.type === "select" ? q.options.split(",").map(o => o.trim()).filter(Boolean) : null,
        required: q.required, sort_order: i,
      })),
      slots: newSlots,
    };

    const url = isEdit ? `/api/booking-sessions/${session!.id}` : "/api/booking-sessions";
    const method = isEdit ? "PATCH" : "POST";

    // For edit: first delete all unbooked slots, then re-add from availability
    if (isEdit) {
      await fetch(`/api/booking-slots/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session!.id }),
      });
    }

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();

    if (!res.ok) { setError(json.error ?? "Something went wrong."); setSaving(false); return; }

    if (isEdit && newSlots.length) {
      await fetch("/api/booking-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlots.map(s => ({ ...s, session_id: session!.id }))),
      });
    }

    router.push("/admin/booking");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={() => router.back()} className={`text-sm ${sub} hover:opacity-70`}>← Back</button>
        <h1 className={`text-xl font-bold ${heading}`}>{isEdit ? "Edit Package" : "New Booking Package"}</h1>
      </div>

      {error && <p className="text-sm text-red-400 rounded-lg bg-red-400/10 px-3 py-2">{error}</p>}

      {/* Basic Info */}
      <div className={`rounded-xl border ${card} p-5 space-y-4`}>
        <p className={sectionTitle}>Basic Info</p>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 1-on-1 Financial Coaching" className={inputCls} />
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What will this session cover?" rows={3} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${label}`}>Duration (minutes)</label>
            <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={15} step={15} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Cover Image URL</label>
          <input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://…" className={inputCls} />
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>What You&apos;ll Get <span className={`text-[10px] ${sub}`}>(short bullet copy shown on booking page)</span></label>
          <textarea value={whatYouGet} onChange={e => setWhatYouGet(e.target.value)} placeholder="• Personalised financial plan&#10;• 1-hour deep-dive session&#10;• Follow-up resources" rows={4} className={inputCls} />
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Google Meet Link <span className={`text-[10px] ${sub}`}>(fallback if Calendar not connected)</span></label>
          <input value={meetLink} onChange={e => setMeetLink(e.target.value)} placeholder="https://meet.google.com/..." className={inputCls} />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsActive(a => !a)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isActive ? "bg-brand" : dark ? "bg-white/10" : "bg-gray-200"}`}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm ${label}`}>Active (visible on public booking page)</span>
        </div>
      </div>

      {/* Pricing */}
      <div className={`rounded-xl border ${card} p-5 space-y-4`}>
        <p className={sectionTitle}>Pricing</p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsFree(f => !f)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isFree ? "bg-brand" : dark ? "bg-white/10" : "bg-gray-200"}`}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isFree ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm ${label}`}>Free session</span>
        </div>
        {!isFree && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${label}`}>NGN ₦</label>
              <input type="number" value={priceNgn} onChange={e => setPriceNgn(e.target.value)} placeholder="50000" className={inputCls} />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${label}`}>USD $</label>
              <input type="number" value={priceUsd} onChange={e => setPriceUsd(e.target.value)} placeholder="50" className={inputCls} />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${label}`}>GBP £</label>
              <input type="number" value={priceGbp} onChange={e => setPriceGbp(e.target.value)} placeholder="40" className={inputCls} />
            </div>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className={`rounded-xl border ${card} p-5 space-y-3`}>
        <div className="flex items-center justify-between">
          <p className={sectionTitle}>Questions</p>
          <button type="button" onClick={addQuestion} className={`text-xs font-medium ${dark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors`}>+ Add Question</button>
        </div>
        {questions.length === 0 && <p className={`text-xs ${sub}`}>No questions yet — clients will only fill in name, email, and phone.</p>}
        {questions.map((q, i) => (
          <div key={i} className={`rounded-lg p-3 space-y-2 ${dark ? "bg-white/3" : "bg-gray-50"}`}>
            <div className="flex items-start gap-2">
              <input value={q.question} onChange={e => updateQuestion(i, { question: e.target.value })} placeholder="Question text…" className={`${inputCls} flex-1`} />
              <button type="button" onClick={() => removeQuestion(i)} className="text-red-400 hover:opacity-70 mt-2 shrink-0">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <select value={q.type} onChange={e => updateQuestion(i, { type: e.target.value as QuestionDraft["type"] })} className={`${inputCls} w-36`}>
                <option value="text">Short text</option>
                <option value="textarea">Long text</option>
                <option value="select">Multiple choice</option>
              </select>
              <label className={`flex items-center gap-1.5 text-xs ${label} cursor-pointer`}>
                <input type="checkbox" checked={q.required} onChange={e => updateQuestion(i, { required: e.target.checked })} className="rounded" />
                Required
              </label>
            </div>
            {q.type === "select" && (
              <input value={q.options} onChange={e => updateQuestion(i, { options: e.target.value })} placeholder="Option A, Option B, Option C" className={inputCls} />
            )}
          </div>
        ))}
      </div>

      {/* Availability */}
      <div className={`rounded-xl border ${card} p-5 space-y-4`}>
        <div className="flex items-center justify-between">
          <p className={sectionTitle}>Availability</p>
          <span className={`text-xs ${sub}`}>{previewCount} slots will be generated</span>
        </div>

        <div className="space-y-2">
          {[1,2,3,4,5,6,0].map(d => {
            const day = availability[d];
            return (
              <div key={d} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${day.enabled ? dark ? "bg-white/5" : "bg-gray-50" : ""}`}>
                {/* Toggle */}
                <button type="button" onClick={() => setDay(d, { enabled: !day.enabled })}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${day.enabled ? "bg-brand" : dark ? "bg-white/10" : "bg-gray-200"}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${day.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>

                {/* Day name */}
                <span className={`w-8 text-xs font-semibold ${day.enabled ? heading : sub}`}>{DAY_NAMES[d]}</span>

                {/* Times */}
                {day.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={day.start} onChange={e => setDay(d, { start: e.target.value })}
                      className={`rounded-lg border px-2 py-1.5 text-xs focus:outline-none w-24 ${dark ? "bg-white/5 border-white/8 text-white focus:border-white/20" : "bg-white border-gray-200 text-gray-900 focus:border-gray-300"}`} />
                    <span className={`text-xs ${sub}`}>to</span>
                    <input type="time" value={day.end} onChange={e => setDay(d, { end: e.target.value })}
                      className={`rounded-lg border px-2 py-1.5 text-xs focus:outline-none w-24 ${dark ? "bg-white/5 border-white/8 text-white focus:border-white/20" : "bg-white border-gray-200 text-gray-900 focus:border-gray-300"}`} />
                    <span className={`text-[10px] ${sub} ml-1`}>
                      {(() => {
                        const [sh, sm] = day.start.split(":").map(Number);
                        const [eh, em] = day.end.split(":").map(Number);
                        const count = Math.floor(((eh * 60 + em) - (sh * 60 + sm)) / (Number(duration) || 60));
                        return count > 0 ? `${count} slot${count !== 1 ? "s" : ""}` : "";
                      })()}
                    </span>
                  </div>
                ) : (
                  <span className={`text-xs ${sub}`}>Unavailable</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <span className={`text-xs font-medium ${label}`}>Generate for</span>
          <div className="flex gap-1.5">
            {[2, 4, 6, 8].map(w => (
              <button key={w} type="button" onClick={() => setWeeksAhead(w)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${weeksAhead === w ? "bg-brand text-white" : dark ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {w} weeks
              </button>
            ))}
          </div>
        </div>

        {isEdit && bookedSlots.length > 0 && (
          <p className={`text-xs ${sub}`}>
            {bookedSlots.length} already-booked slot{bookedSlots.length !== 1 ? "s" : ""} will be preserved.
          </p>
        )}
      </div>

      {/* Save */}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save & Regenerate Slots" : "Create Package"}
        </button>
        <button type="button" onClick={() => router.back()} className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${dark ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
          Cancel
        </button>
      </div>
    </form>
  );
}
