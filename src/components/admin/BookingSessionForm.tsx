"use client";

import { useState, useRef, useCallback } from "react";
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
  const weeksAhead = 52; // always generate 1 year ahead

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
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const card  = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub   = dark ? "text-white/40" : "text-gray-400";
  const label = dark ? "text-white/60" : "text-gray-600";
  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${dark ? "bg-white/5 border-white/8 text-white placeholder-white/20 focus:border-white/20" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300"}`;
  const sectionTitle = `text-xs font-semibold uppercase tracking-wide mb-3 ${sub}`;

  function setDay(d: number, patch: Partial<DayAvail>) {
    setAvailability(a => ({ ...a, [d]: { ...a[d], ...patch } }));
  }

  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);

    // Resize to 1080×1080 center-crop before upload
    const resized = await new Promise<Blob>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const size = 1080;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const scale = Math.max(size / img.width, size / img.height);
        const sw = size / scale;
        const sh = size / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        canvas.toBlob(b => resolve(b!), "image/jpeg", 0.9);
      };
      img.src = URL.createObjectURL(file);
    });

    const fd = new FormData();
    fd.append("file", new File([resized], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
    fd.append("folder", "booking-sessions");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) setCoverImage(json.url);
    setUploading(false);
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadImage(file);
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

  const whatYouGetLines = whatYouGet.split("\n").filter(Boolean);
  const displayPrice = priceNgn ? `₦${Number(priceNgn).toLocaleString()}` : priceUsd ? `$${priceUsd}` : priceGbp ? `£${priceGbp}` : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={() => router.back()} className={`text-sm ${sub} hover:opacity-70`}>← Back</button>
        <h1 className={`text-xl font-bold ${heading}`}>{isEdit ? "Edit Package" : "New Booking Package"}</h1>
      </div>

      {error && <p className="text-sm text-red-400 rounded-lg bg-red-400/10 px-3 py-2">{error}</p>}

      <div className="flex gap-6 items-start">
      {/* ── Form column ───────────────────────────────── */}
      <div className="flex-1 min-w-0 max-w-2xl space-y-6">

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
          <label className={`block text-xs font-medium mb-1.5 ${label}`}>Cover Image</label>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
          {coverImage ? (
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setCoverImage("")} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`rounded-xl border-2 border-dashed px-6 py-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragOver ? "border-brand bg-brand/5" : dark ? "border-white/10 hover:border-white/20" : "border-gray-200 hover:border-gray-300"}`}>
              {uploading ? (
                <div className={`text-sm ${sub}`}>Uploading…</div>
              ) : (
                <>
                  <svg className={`h-8 w-8 mb-2 ${sub}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
                  <p className={`text-sm font-medium ${sub}`}>Drag & drop or <span className="text-brand">browse</span></p>
                  <p className={`text-xs mt-0.5 ${dark ? "text-white/20" : "text-gray-300"}`}>PNG, JPG, WebP · resized to 1080×1080</p>
                </>
              )}
            </div>
          )}
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
          <span className={`text-xs ${sub}`}>{previewCount} slots · 1 year ahead</span>
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

      </div>{/* end form column */}

      {/* ── Preview column ───────────────────────────── */}
      <div className="w-72 shrink-0 hidden xl:block">
        <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${sub}`}>Preview</p>
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {coverImage ? (
            <img src={coverImage} alt="Cover" className="w-full aspect-square object-cover" />
          ) : (
            <div className={`w-full aspect-square flex items-center justify-center ${dark ? "bg-white/3" : "bg-gray-50"}`}>
              <svg className={`h-8 w-8 ${dark ? "text-white/10" : "text-gray-200"}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5c.414 0 .75.336.75.75v13.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75c0-.414.336-.75.75-.75z"/></svg>
            </div>
          )}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isFree ? dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-blue-400/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                {isFree ? "Free" : "Paid"}
              </span>
              <span className={`text-[10px] ${sub}`}>{duration} min</span>
            </div>
            <div>
              <p className={`font-semibold text-sm ${heading} leading-snug`}>{title || "Package title"}</p>
              {description && <p className={`text-xs mt-1 ${sub} line-clamp-2`}>{description}</p>}
            </div>
            {!isFree && displayPrice && (
              <p className={`text-base font-bold ${heading}`}>{displayPrice}</p>
            )}
            {whatYouGetLines.length > 0 && (
              <div className="space-y-1 pt-1">
                {whatYouGetLines.slice(0, 4).map((line, i) => (
                  <p key={i} className={`text-xs ${sub}`}>{line}</p>
                ))}
              </div>
            )}
            <div className={`rounded-lg py-2 text-center text-xs font-semibold text-white bg-brand mt-2`}>
              Book now →
            </div>
          </div>
        </div>
        <p className={`text-[10px] mt-2 text-center ${dark ? "text-white/15" : "text-gray-300"}`}>Live preview · updates as you type</p>
      </div>

      </div>{/* end two-col wrapper */}
    </form>
  );
}
