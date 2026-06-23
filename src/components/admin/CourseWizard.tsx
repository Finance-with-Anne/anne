"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import type { CourseCategory, CourseTag, Course } from "@/types";
import RichTextEditor from "./RichTextEditor";

function tmpId() { return Math.random().toString(36).slice(2); }

interface WizardLesson {
  id: string;
  title: string;
  type: "video" | "text" | "quiz";
  video_url: string;
  content: string;
  duration: number;
}

interface WizardSection {
  id: string;
  title: string;
  lessons: WizardLesson[];
}

interface CourseWizardProps {
  categories: CourseCategory[];
  tags: CourseTag[];
  initialData?: Course & { tag_ids?: string[] };
}

const STEPS = ["Course Info", "Curriculum", "Pricing & Publish"];

export default function CourseWizard({ categories, tags, initialData }: CourseWizardProps) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [fetchingDuration, setFetchingDuration] = useState<string | null>(null);
  const [error, setError] = useState("");
  const courseIdRef = useRef<string | undefined>(initialData?.id);

  // Step 1
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(initialData?.level ?? "beginner");
  const [language, setLanguage] = useState(initialData?.language ?? "English");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail_url ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tag_ids ?? []);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dragCounter = useRef(0);

  // Step 2 — load from JSONB curriculum field (source of truth going forward)
  const [sections, setSections] = useState<WizardSection[]>(() => {
    const raw: any = (initialData as any)?.curriculum;
    // curriculum JSONB field takes priority
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((s: any) => ({
        id: s.id ?? tmpId(),
        title: s.title ?? "",
        lessons: (s.lessons ?? []).map((l: any) => ({
          id: l.id ?? tmpId(),
          title: l.title ?? "",
          type: l.type ?? "video",
          video_url: l.video_url ?? "",
          content: l.content ?? "",
          duration: l.duration ?? 0,
        })),
      }));
    }
    // Fallback: old sections relation (pre-JSONB courses)
    if (initialData?.sections?.length) {
      const hasLessons = initialData.sections.some((s: any) => s.lessons?.length > 0);
      if (hasLessons) {
        return initialData.sections.map((s: any) => ({
          id: s.id,
          title: s.title,
          lessons: (s.lessons ?? []).map((l: any) => ({
            id: l.id,
            title: l.title,
            type: l.type ?? "video",
            video_url: l.video_url ?? "",
            content: l.content ?? "",
            duration: l.duration ?? 0,
          })),
        }));
      }
    }
    // Fallback: flat lessons (original schema)
    if (initialData?.lessons?.length) {
      return [{
        id: tmpId(),
        title: "Section 1",
        lessons: initialData.lessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          type: l.type ?? "video",
          video_url: l.video_url ?? "",
          content: l.content ?? "",
          duration: l.duration ?? 0,
        })),
      }];
    }
    return [{ id: tmpId(), title: "Section 1", lessons: [] }];
  });

  // Step 3
  const [isFree, setIsFree] = useState<boolean>((initialData as any)?.is_free ?? false);
  const [priceNGN, setPriceNGN] = useState(initialData?.price_ngn?.toString() ?? "");
  const [priceUSD, setPriceUSD] = useState(initialData?.price_usd?.toString() ?? "");
  const [priceGBP, setPriceGBP] = useState(initialData?.price_gbp?.toString() ?? "");
  const [saleEnabled, setSaleEnabled] = useState<boolean>(!!(initialData as any)?.sale_price_ngn || !!(initialData as any)?.sale_price_usd || !!(initialData as any)?.sale_price_gbp);
  const [salePriceNGN, setSalePriceNGN] = useState((initialData as any)?.sale_price_ngn?.toString() ?? "");
  const [salePriceUSD, setSalePriceUSD] = useState((initialData as any)?.sale_price_usd?.toString() ?? "");
  const [salePriceGBP, setSalePriceGBP] = useState((initialData as any)?.sale_price_gbp?.toString() ?? "");
  const [saleStartsAt, setSaleStartsAt] = useState<string>((initialData as any)?.sale_starts_at?.slice(0, 16) ?? "");
  const [saleEndsAt, setSaleEndsAt] = useState<string>((initialData as any)?.sale_ends_at?.slice(0, 16) ?? "");
  const [whatYouLearn, setWhatYouLearn] = useState<string[]>(
    initialData?.what_you_learn?.length ? initialData.what_you_learn : [""]
  );
  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements?.length ? initialData.requirements : [""]
  );
  const [certificate, setCertificate] = useState(initialData?.certificate ?? false);

  // Always point to the latest autoSave closure so the debounce effect never goes stale
  const autoSaveFnRef = useRef<() => Promise<void>>(async () => {});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  autoSaveFnRef.current = autoSave; // update every render

  // Debounce: fire auto-save 2s after the last edit to any key field
  useEffect(() => {
    if (!title.trim()) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      autoSaveFnRef.current?.();
    }, 2000);
    return () => clearTimeout(saveTimerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // NOTE: `published` and `certificate` intentionally excluded — auto-save always drafts (published:false),
  // so including them would overwrite the publish toggle. Only the explicit save buttons persist publish state.
  }, [title, description, sections, isFree, priceNGN, priceUSD, priceGBP, saleEnabled, salePriceNGN, salePriceUSD, salePriceGBP, saleStartsAt, saleEndsAt, selectedTags, categoryId, level, language, thumbnail]);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const labelClass = dark ? "text-white/40" : "text-gray-500";
  const inputClass = dark
    ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const divider = dark ? "border-white/5" : "border-gray-100";

  async function uploadThumb(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "courses");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) setThumbnail(data.url);
    setUploading(false);
  }

  function addSection() {
    setSections(s => [...s, { id: tmpId(), title: `Section ${s.length + 1}`, lessons: [] }]);
  }

  function updateSectionTitle(sid: string, val: string) {
    setSections(s => s.map(sec => sec.id === sid ? { ...sec, title: val } : sec));
  }

  function removeSection(sid: string) {
    setSections(s => s.filter(sec => sec.id !== sid));
  }

  function addLesson(sid: string) {
    setSections(s => s.map(sec => sec.id === sid
      ? { ...sec, lessons: [...sec.lessons, { id: tmpId(), title: "", type: "video", video_url: "", content: "", duration: 0 }] }
      : sec
    ));
  }

  function updateLesson(sid: string, lid: string, field: keyof WizardLesson, value: string | number) {
    setSections(s => s.map(sec => sec.id === sid
      ? { ...sec, lessons: sec.lessons.map(l => l.id === lid ? { ...l, [field]: value } : l) }
      : sec
    ));
  }

  function removeLesson(sid: string, lid: string) {
    setSections(s => s.map(sec => sec.id === sid
      ? { ...sec, lessons: sec.lessons.filter(l => l.id !== lid) }
      : sec
    ));
  }

  function moveLesson(sid: string, idx: number, dir: -1 | 1) {
    setSections(s => s.map(sec => {
      if (sec.id !== sid) return sec;
      const lessons = [...sec.lessons];
      const next = idx + dir;
      if (next < 0 || next >= lessons.length) return sec;
      [lessons[idx], lessons[next]] = [lessons[next], lessons[idx]];
      return { ...sec, lessons };
    }));
  }

  function updateBullet(arr: string[], i: number, val: string, set: (v: string[]) => void) {
    set(arr.map((x, idx) => idx === i ? val : x));
  }

  function buildBody(draft: boolean) {
    return {
      title,
      description,
      category_id: categoryId || null,
      level,
      language,
      thumbnail_url: thumbnail || null,
      tag_ids: selectedTags,
      // Curriculum stored as JSONB — no separate course_sections/lessons inserts needed
      curriculum: sections.map((s, si) => ({
        id: s.id,
        title: s.title,
        sort_order: si,
        lessons: s.lessons.map((l, li) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          video_url: l.video_url || null,
          content: l.content || null,
          duration: l.duration,
          order: li,
        })),
      })),
      is_free: isFree,
      price: parseFloat(priceNGN) || 0,
      price_ngn: isFree ? null : (parseFloat(priceNGN) || null),
      price_usd: isFree ? null : (parseFloat(priceUSD) || null),
      price_gbp: isFree ? null : (parseFloat(priceGBP) || null),
      sale_price_ngn: (!isFree && saleEnabled && salePriceNGN) ? parseFloat(salePriceNGN) : null,
      sale_price_usd: (!isFree && saleEnabled && salePriceUSD) ? parseFloat(salePriceUSD) : null,
      sale_price_gbp: (!isFree && saleEnabled && salePriceGBP) ? parseFloat(salePriceGBP) : null,
      sale_starts_at: (!isFree && saleEnabled && saleStartsAt) ? saleStartsAt : null,
      sale_ends_at: (!isFree && saleEnabled && saleEndsAt) ? saleEndsAt : null,
      what_you_learn: whatYouLearn.filter(Boolean),
      requirements: requirements.filter(Boolean),
      certificate,
      published: !draft,
    };
  }

  async function autoSave() {
    if (!title.trim()) return;
    setAutoSaving(true);
    const endpoint = courseIdRef.current ? `/api/courses/${courseIdRef.current}` : "/api/courses";
    const method = courseIdRef.current ? "PATCH" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildBody(true)),
    });
    if (res.ok) {
      const data = await res.json();
      if (!courseIdRef.current) courseIdRef.current = data.id;
      setSavedAt(new Date());
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }
    setAutoSaving(false);
  }

  async function fetchVideoInfo(sid: string, lid: string, url: string) {
    if (!url.trim() || fetchingDuration === lid) return;
    if (!url.includes("youtu")) return;
    setFetchingDuration(lid);
    try {
      const res = await fetch(`/api/video-info?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.duration) updateLesson(sid, lid, "duration", data.duration);
      }
    } catch {}
    setFetchingDuration(null);
  }

  async function handleStepClick(targetStep: number) {
    if (targetStep === step) return;
    if (targetStep > 0 && !title.trim()) { setError("Add a course title before continuing."); return; }
    setError("");
    await autoSave();
    setStep(targetStep);
  }

  async function handleSave(saveAsDraft: boolean) {
    clearTimeout(saveTimerRef.current); // cancel any pending auto-save to prevent race condition
    if (!title.trim()) { setError("Course title is required."); setStep(0); return; }
    setSaving(true); setError("");
    const endpoint = courseIdRef.current ? `/api/courses/${courseIdRef.current}` : "/api/courses";
    const method = courseIdRef.current ? "PATCH" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildBody(saveAsDraft)),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save."); setSaving(false); return; }
    if (!courseIdRef.current) courseIdRef.current = data.id;
    router.push("/admin/courses/all");
  }

  const totalLessons = sections.reduce((n, s) => n + s.lessons.length, 0);

  return (
    <div className="max-w-4xl">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={() => handleStepClick(i)}
                className="flex items-center gap-2 px-1 py-1 rounded-lg cursor-pointer group"
              >
                <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${i === step
                    ? "bg-[#0822C0] text-white"
                    : dark ? "bg-white/10 text-white/40 group-hover:bg-white/20 group-hover:text-white/70" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"}`}>
                  {i + 1}
                </span>
                <span className={`text-sm font-medium transition-colors
                  ${i === step ? heading : `${sub} group-hover:${dark ? "text-white/70" : "text-gray-600"}`}`}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`mx-3 h-px w-10 ${dark ? "bg-white/10" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
        {/* Save status */}
        <div className="text-xs shrink-0 ml-4">
          {autoSaving && <span className={sub}>Saving…</span>}
          {!autoSaving && savedAt && (
            <span className={dark ? "text-green-400/60" : "text-green-600/70"}>
              Saved {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>
      )}

      {/* ─── Step 1: Course Info ─── */}
      {step === 0 && (
        <div className="space-y-4">
          <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>Basic Information</p>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Course Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Master Your Money in 30 Days"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Description / Tagline</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="What will students learn? Sell the transformation."
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none resize-none transition-colors ${inputClass}`}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Category</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                >
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Language</label>
                <input
                  type="text"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  placeholder="English"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-2 ${labelClass}`}>Level</label>
              <div className="flex gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors
                      ${level === l ? "bg-[#0822C0] text-white" : dark ? "bg-white/5 text-white/40 hover:text-white/70" : "bg-gray-100 text-gray-400 hover:text-gray-600"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Thumbnail */}
            <div className={`rounded-xl border p-5 ${card}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${labelClass}`}>Thumbnail</p>
              {thumbnail ? (
                <div className="relative">
                  <img src={thumbnail} alt="" className="w-full h-40 object-cover rounded-lg" />
                  <button
                    onClick={() => setThumbnail("")}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"
                  >✕</button>
                </div>
              ) : (
                <label
                  onDragEnter={e => { e.preventDefault(); dragCounter.current++; setDragOver(true); }}
                  onDragLeave={() => { dragCounter.current--; if (dragCounter.current === 0) setDragOver(false); }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={async e => {
                    e.preventDefault(); dragCounter.current = 0; setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) await uploadThumb(file);
                  }}
                  className={`flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed cursor-pointer transition-colors
                    ${dragOver
                      ? dark ? "border-white/30 bg-white/5" : "border-blue-400 bg-blue-50"
                      : dark ? "border-white/10 hover:border-white/20" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <svg className={`h-8 w-8 mb-2 ${sub}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M4.5 6.75h.008v.008H4.5V6.75z" />
                  </svg>
                  <span className={`text-xs ${sub}`}>{uploading ? "Uploading…" : "Drag & drop or click"}</span>
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadThumb(f); }} className="hidden" />
                </label>
              )}
            </div>

            {/* Tags */}
            <div className={`rounded-xl border p-5 ${card}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${labelClass}`}>Tags</p>
              {tags.length === 0 ? (
                <p className={`text-xs ${sub}`}>No tags yet — add them in Courses → Tags.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTags(prev =>
                        prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id]
                      )}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                        ${selectedTags.includes(t.id)
                          ? "bg-[#0822C0] text-white"
                          : dark ? "bg-white/5 text-white/40 hover:text-white/70" : "bg-gray-100 text-gray-400 hover:text-gray-600"}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleStepClick(1)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#0822C0] text-white hover:bg-[#061aa0] transition-colors"
            >
              Continue to Curriculum →
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Curriculum ─── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className={`flex items-center justify-between`}>
            <p className={`text-sm ${sub}`}>{sections.length} sections · {totalLessons} lessons</p>
          </div>

          {sections.map((section, si) => (
            <div key={section.id} className={`rounded-xl border ${card}`}>
              {/* Section header */}
              <div className={`flex items-center gap-3 px-4 py-3 border-b ${divider}`}>
                <span className={`text-xs font-bold w-5 shrink-0 ${sub}`}>{si + 1}</span>
                <input
                  type="text"
                  value={section.title}
                  onChange={e => updateSectionTitle(section.id, e.target.value)}
                  placeholder="Section title"
                  className={`flex-1 text-sm font-semibold bg-transparent focus:outline-none ${heading}`}
                />
                {sections.length > 1 && (
                  <button
                    onClick={() => removeSection(section.id)}
                    className={`text-xs transition-colors ${sub} hover:text-red-400`}
                  >Remove</button>
                )}
              </div>

              {/* Lessons */}
              {section.lessons.length === 0 ? (
                <div className={`px-4 py-6 text-center text-xs ${sub}`}>No lessons yet.</div>
              ) : (
                <div className={`divide-y ${divider}`}>
                  {section.lessons.map((lesson, li) => (
                    <div key={lesson.id} className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs shrink-0 w-8 ${sub}`}>{si + 1}.{li + 1}</span>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={e => updateLesson(section.id, lesson.id, "title", e.target.value)}
                          placeholder="Lesson title"
                          className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
                        />
                        {justSaved && (
                          <span className="shrink-0 text-[10px] font-medium text-green-400 animate-pulse">✓ saved</span>
                        )}
                        {/* Type picker */}
                        <div className="flex gap-0.5 shrink-0">
                          {(["video", "text", "quiz"] as const).map(t => (
                            <button
                              key={t}
                              onClick={() => updateLesson(section.id, lesson.id, "type", t)}
                              className={`px-2 py-1 rounded text-xs font-medium capitalize transition-colors
                                ${lesson.type === t
                                  ? "bg-[#0822C0] text-white"
                                  : dark ? "bg-white/5 text-white/30 hover:text-white/50" : "bg-gray-100 text-gray-400 hover:text-gray-600"}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        {/* Reorder */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            onClick={() => moveLesson(section.id, li, -1)}
                            disabled={li === 0}
                            className={`p-0.5 rounded transition-colors ${sub} hover:text-white/60 disabled:opacity-20`}
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveLesson(section.id, li, 1)}
                            disabled={li === section.lessons.length - 1}
                            className={`p-0.5 rounded transition-colors ${sub} hover:text-white/60 disabled:opacity-20`}
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => removeLesson(section.id, lesson.id)}
                          className="shrink-0 text-xs text-red-400/40 hover:text-red-400 transition-colors"
                        >✕</button>
                      </div>

                      {lesson.type === "video" && (
                        <div className="grid grid-cols-2 gap-3 ml-10">
                          <input
                            type="text"
                            value={lesson.video_url}
                            onChange={e => updateLesson(section.id, lesson.id, "video_url", e.target.value)}
                            onBlur={e => fetchVideoInfo(section.id, lesson.id, e.target.value)}
                            onPaste={e => {
                              const pasted = e.clipboardData.getData("text");
                              setTimeout(() => fetchVideoInfo(section.id, lesson.id, pasted), 50);
                            }}
                            placeholder="YouTube / Vimeo URL"
                            className={`rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputClass}`}
                          />
                          <div className="relative flex gap-1">
                            <input
                              type="number"
                              value={lesson.duration || ""}
                              onChange={e => updateLesson(section.id, lesson.id, "duration", parseInt(e.target.value) || 0)}
                              placeholder={fetchingDuration === lesson.id ? "Detecting…" : "Duration (mins)"}
                              disabled={fetchingDuration === lesson.id}
                              className={`flex-1 rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputClass} ${fetchingDuration === lesson.id ? "opacity-50" : ""}`}
                            />
                            <button
                              type="button"
                              onClick={() => fetchVideoInfo(section.id, lesson.id, lesson.video_url)}
                              disabled={!lesson.video_url || fetchingDuration === lesson.id}
                              title="Auto-detect duration"
                              className={`shrink-0 h-[34px] w-[34px] rounded-lg border flex items-center justify-center transition-colors
                                ${dark ? "border-white/5 text-white/30 hover:text-white/60 hover:bg-white/5 disabled:opacity-20" : "border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30"}`}
                            >
                              {fetchingDuration === lesson.id ? (
                                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                              ) : (
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {lesson.type === "text" && (
                        <div className="ml-10" style={{ width: "calc(100% - 2.5rem)" }}>
                          <RichTextEditor
                            value={lesson.content}
                            onChange={html => updateLesson(section.id, lesson.id, "content", html)}
                            dark={dark}
                            placeholder="Write your lesson content here…"
                            minHeight={200}
                          />
                        </div>
                      )}

                      {lesson.type === "quiz" && (
                        <p className={`ml-10 text-xs italic ${sub}`}>Quiz builder coming soon.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className={`px-4 py-3 border-t ${divider}`}>
                <button
                  onClick={() => addLesson(section.id)}
                  className={`text-xs font-medium transition-colors ${dark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-600"}`}
                >
                  + Add Lesson
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addSection}
            className={`w-full rounded-xl border-2 border-dashed py-3 text-sm font-medium transition-colors
              ${dark ? "border-white/10 text-white/30 hover:border-white/20 hover:text-white/50" : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"}`}
          >
            + Add Section
          </button>

          <div className="flex justify-between">
            <button
              onClick={() => handleStepClick(0)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >← Back</button>
            <button
              onClick={() => handleStepClick(2)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#0822C0] text-white hover:bg-[#061aa0] transition-colors"
            >Continue to Pricing →</button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Pricing & Publish ─── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Pricing */}
          <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
            <div className="flex items-center justify-between">
              <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>Pricing</p>
              {/* Free / Paid toggle */}
              <div className={`flex rounded-lg p-0.5 text-xs font-semibold ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                <button
                  onClick={() => setIsFree(true)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${isFree ? "bg-emerald-500 text-white shadow-sm" : dark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-700"}`}
                >Free</button>
                <button
                  onClick={() => setIsFree(false)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${!isFree ? "bg-[#0822C0] text-white shadow-sm" : dark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-700"}`}
                >Paid</button>
              </div>
            </div>

            {isFree ? (
              <div className="flex items-center gap-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-medium text-emerald-600">This course is free — students can enrol at no cost.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Price (NGN ₦)</label>
                    <input
                      type="number" value={priceNGN} onChange={e => setPriceNGN(e.target.value)}
                      min="0" step="100" placeholder="0"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Price (USD $)</label>
                    <input
                      type="number" value={priceUSD} onChange={e => setPriceUSD(e.target.value)}
                      min="0" step="0.01" placeholder="0.00"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Price (GBP £)</label>
                    <input
                      type="number" value={priceGBP} onChange={e => setPriceGBP(e.target.value)}
                      min="0" step="0.01" placeholder="0.00"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                    />
                  </div>
                </div>

                {/* Sale / Promo toggle */}
                <div className={`rounded-lg border p-4 space-y-4 ${dark ? "border-white/5 bg-white/3" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-semibold ${heading}`}>Run a Sale / Promo</p>
                      <p className={`text-[11px] mt-0.5 ${sub}`}>Offer a discounted price for a limited time</p>
                    </div>
                    <button
                      onClick={() => setSaleEnabled(v => !v)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${saleEnabled ? "bg-[#0822C0]" : dark ? "bg-white/10" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${saleEnabled ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>

                  {saleEnabled && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Sale Price (NGN ₦)</label>
                          <input
                            type="number" value={salePriceNGN} onChange={e => setSalePriceNGN(e.target.value)}
                            min="0" step="100" placeholder="0"
                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Sale Price (USD $)</label>
                          <input
                            type="number" value={salePriceUSD} onChange={e => setSalePriceUSD(e.target.value)}
                            min="0" step="0.01" placeholder="0.00"
                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Sale Price (GBP £)</label>
                          <input
                            type="number" value={salePriceGBP} onChange={e => setSalePriceGBP(e.target.value)}
                            min="0" step="0.01" placeholder="0.00"
                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Sale Starts</label>
                          <input
                            type="datetime-local" value={saleStartsAt} onChange={e => setSaleStartsAt(e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Sale Ends</label>
                          <input
                            type="datetime-local" value={saleEndsAt} onChange={e => setSaleEndsAt(e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* What you'll learn */}
          <div className={`rounded-xl border p-5 space-y-3 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>What You'll Learn</p>
            {whatYouLearn.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text" value={item}
                  onChange={e => updateBullet(whatYouLearn, i, e.target.value, setWhatYouLearn)}
                  placeholder="e.g. Create and stick to a budget"
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
                />
                <button
                  onClick={() => setWhatYouLearn(w => w.filter((_, idx) => idx !== i))}
                  className="text-xs text-red-400/40 hover:text-red-400 transition-colors px-1"
                >✕</button>
              </div>
            ))}
            <button
              onClick={() => setWhatYouLearn(w => [...w, ""])}
              className={`text-xs font-medium transition-colors ${dark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-600"}`}
            >+ Add point</button>
          </div>

          {/* Requirements */}
          <div className={`rounded-xl border p-5 space-y-3 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>Requirements</p>
            {requirements.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text" value={item}
                  onChange={e => updateBullet(requirements, i, e.target.value, setRequirements)}
                  placeholder="e.g. No prior knowledge required"
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
                />
                <button
                  onClick={() => setRequirements(r => r.filter((_, idx) => idx !== i))}
                  className="text-xs text-red-400/40 hover:text-red-400 transition-colors px-1"
                >✕</button>
              </div>
            ))}
            <button
              onClick={() => setRequirements(r => [...r, ""])}
              className={`text-xs font-medium transition-colors ${dark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-600"}`}
            >+ Add requirement</button>
          </div>

          {/* Certificate + Published */}
          <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${heading}`}>Certificate</p>
                <p className={`text-xs mt-0.5 ${sub}`}>Issue a completion certificate</p>
              </div>
              <button
                onClick={() => setCertificate(!certificate)}
                className={`relative h-5 w-9 rounded-full transition-colors ${certificate ? "bg-[#0822C0]" : dark ? "bg-white/10" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${certificate ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => handleStepClick(1)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >← Back</button>
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50
                  ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {saving ? "Saving…" : "Save as Draft"}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#0822C0] text-white hover:bg-[#061aa0] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Publish Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
