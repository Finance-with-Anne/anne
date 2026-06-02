"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import type { BookingSession, BookingQuestion, BookingSlot } from "@/types";

type QuestionDraft = { id?: string; question: string; type: "text" | "textarea" | "select"; options: string; required: boolean };
type SlotDraft = { id?: string; date: string; start_time: string; is_booked?: boolean };

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
  const [isActive, setIsActive] = useState(session?.is_active ?? true);

  const [questions, setQuestions] = useState<QuestionDraft[]>(
    (session?.questions ?? []).map((q: BookingQuestion) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: (q.options ?? []).join(", "),
      required: q.required,
    }))
  );

  const [slots, setSlots] = useState<SlotDraft[]>(
    (session?.slots ?? []).map((s: BookingSlot) => ({ id: s.id, date: s.date, start_time: s.start_time, is_booked: s.is_booked }))
  );

  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotTime, setNewSlotTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const label = dark ? "text-white/60" : "text-gray-600";
  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${dark ? "bg-white/5 border-white/8 text-white placeholder-white/20 focus:border-white/20" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300"}`;
  const sectionTitle = `text-xs font-semibold uppercase tracking-wide mb-3 ${sub}`;

  function addQuestion() {
    setQuestions(q => [...q, { question: "", type: "text", options: "", required: false }]);
  }

  function updateQuestion(i: number, patch: Partial<QuestionDraft>) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  }

  function removeQuestion(i: number) {
    setQuestions(qs => qs.filter((_, idx) => idx !== i));
  }

  function addSlot() {
    if (!newSlotDate || !newSlotTime) return;
    setSlots(s => [...s, { date: newSlotDate, start_time: newSlotTime }]);
    setNewSlotTime("");
  }

  function removeSlot(i: number) {
    setSlots(s => s.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      duration_minutes: Number(duration),
      is_free: isFree,
      price_ngn: !isFree && priceNgn ? Number(priceNgn) : null,
      price_usd: !isFree && priceUsd ? Number(priceUsd) : null,
      price_gbp: !isFree && priceGbp ? Number(priceGbp) : null,
      google_meet_link: meetLink.trim() || null,
      is_active: isActive,
      questions: questions.map((q, i) => ({
        ...(q.id ? { id: q.id } : {}),
        question: q.question,
        type: q.type,
        options: q.type === "select" ? q.options.split(",").map(o => o.trim()).filter(Boolean) : null,
        required: q.required,
        sort_order: i,
      })),
      slots: slots.filter(s => !s.id).map(s => ({ date: s.date, start_time: s.start_time })),
    };

    const url = isEdit ? `/api/booking-sessions/${session!.id}` : "/api/booking-sessions";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();

    if (!res.ok) { setError(json.error ?? "Something went wrong."); setSaving(false); return; }

    // Add new slots separately for edit mode
    if (isEdit) {
      const newSlots = slots.filter(s => !s.id);
      if (newSlots.length) {
        await fetch("/api/booking-slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSlots.map(s => ({ ...s, session_id: session!.id }))),
        });
      }
    }

    router.push("/admin/booking");
    router.refresh();
  }

  async function deleteSlot(slot: SlotDraft, i: number) {
    if (slot.id) {
      await fetch(`/api/booking-slots/${slot.id}`, { method: "DELETE" });
    }
    removeSlot(i);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={() => router.back()} className={`text-sm ${sub} hover:opacity-70`}>← Back</button>
        <h1 className={`text-xl font-bold ${heading}`}>{isEdit ? "Edit Session" : "New Booking Session"}</h1>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Basic Info */}
      <div className={`rounded-xl border ${card} p-5 space-y-4`}>
        <p className={sectionTitle}>Basic Info</p>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Session Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 1-on-1 Financial Coaching" className={inputCls} />
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What will this session cover?" rows={3} className={inputCls} />
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Duration (minutes)</label>
          <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={15} step={15} className={`${inputCls} w-32`} />
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Google Meet Link</label>
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
              <label className={`block text-xs font-medium mb-1.5 ${label}`}>Price (NGN ₦)</label>
              <input type="number" value={priceNgn} onChange={e => setPriceNgn(e.target.value)} placeholder="50000" className={inputCls} />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${label}`}>Price (USD $)</label>
              <input type="number" value={priceUsd} onChange={e => setPriceUsd(e.target.value)} placeholder="50" className={inputCls} />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${label}`}>Price (GBP £)</label>
              <input type="number" value={priceGbp} onChange={e => setPriceGbp(e.target.value)} placeholder="40" className={inputCls} />
            </div>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className={`rounded-xl border ${card} p-5 space-y-3`}>
        <div className="flex items-center justify-between">
          <p className={sectionTitle}>Questions</p>
          <button type="button" onClick={addQuestion} className={`text-xs font-medium ${dark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors`}>
            + Add Question
          </button>
        </div>
        {questions.length === 0 && <p className={`text-xs ${sub}`}>No questions yet. Clients will only fill in their name, email, and phone.</p>}
        {questions.map((q, i) => (
          <div key={i} className={`rounded-lg p-3 space-y-2 ${dark ? "bg-white/3" : "bg-gray-50"}`}>
            <div className="flex items-start gap-2">
              <input value={q.question} onChange={e => updateQuestion(i, { question: e.target.value })} placeholder="Question text…" className={`${inputCls} flex-1`} />
              <button type="button" onClick={() => removeQuestion(i)} className="text-red-400 hover:opacity-70 mt-2 shrink-0">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <select value={q.type} onChange={e => updateQuestion(i, { type: e.target.value as "text" | "textarea" | "select" })} className={`${inputCls} w-36`}>
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

      {/* Available Slots */}
      <div className={`rounded-xl border ${card} p-5 space-y-3`}>
        <p className={sectionTitle}>Available Dates & Times</p>
        {slots.length === 0 && <p className={`text-xs ${sub}`}>No slots added yet.</p>}
        {slots.length > 0 && (
          <div className="space-y-1.5">
            {slots.map((s, i) => (
              <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${dark ? "bg-white/3" : "bg-gray-50"}`}>
                <span className={tText(dark)}>
                  {new Date(s.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {s.start_time}
                  {s.is_booked && <span className={`ml-2 text-xs ${dark ? "text-yellow-400" : "text-yellow-600"}`}>(booked)</span>}
                </span>
                {!s.is_booked && (
                  <button type="button" onClick={() => deleteSlot(s, i)} className="text-red-400 hover:opacity-70">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input type="date" value={newSlotDate} onChange={e => setNewSlotDate(e.target.value)} className={`${inputCls} flex-1`} />
          <input type="time" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} className={`${inputCls} w-32`} />
          <button type="button" onClick={addSlot} disabled={!newSlotDate || !newSlotTime} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0">
            Add
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Session"}
        </button>
        <button type="button" onClick={() => router.back()} className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${dark ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function tText(dark: boolean) {
  return dark ? "text-white/70" : "text-gray-700";
}
