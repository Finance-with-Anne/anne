"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";

interface Lesson { title: string; video_url: string; duration: number; }
interface CourseFormProps {
  initialData?: { id?: string; title?: string; description?: string; price?: number; thumbnail_url?: string; published?: boolean; lessons?: Lesson[] };
}

export default function CourseForm({ initialData }: CourseFormProps) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail_url ?? "");
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [lessons, setLessons] = useState<Lesson[]>(initialData?.lessons ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const labelClass = dark ? "text-white/40" : "text-gray-500";
  const inputClass = dark ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const divider = dark ? "border-white/5" : "border-gray-100";

  function addLesson() { setLessons([...lessons, { title: "", video_url: "", duration: 0 }]); }
  function updateLesson(i: number, field: keyof Lesson, value: string | number) {
    setLessons(lessons.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }
  function removeLesson(i: number) { setLessons(lessons.filter((_, idx) => idx !== i)); }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const form = new FormData(); form.append("file", file); form.append("folder", "courses");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) setThumbnail(data.url);
    setUploading(false);
  }

  async function handleSave() {
    if (!title) return setError("Title is required.");
    setSaving(true); setError("");
    const body = { title, description, price: parseFloat(price) || 0, thumbnail_url: thumbnail, published, lessons };
    const endpoint = initialData?.id ? `/api/courses/${initialData.id}` : "/api/courses";
    const method = initialData?.id ? "PATCH" : "POST";
    const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save."); } else { router.push("/admin/courses"); }
    setSaving(false);
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>{initialData?.id ? "Edit Course" : "New Course"}</h1>
          <p className={`text-sm mt-0.5 ${labelClass}`}>{lessons.length} lessons</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50">{saving ? "Saving…" : "Save Course"}</button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Course Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Master Your Money in 30 Days" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What will students learn?" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none resize-none ${inputClass}`} />
            </div>
          </div>

          {/* Lessons */}
          <div className={`rounded-xl border ${card}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
              <p className={`text-sm font-semibold ${heading}`}>Lessons</p>
              <button onClick={addLesson} className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-hover transition-colors">+ Add Lesson</button>
            </div>
            {lessons.length === 0 ? (
              <div className={`py-10 text-center text-sm ${labelClass}`}>No lessons yet. Add your first lesson.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {lessons.map((lesson, i) => (
                  <div key={i} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${labelClass}`}>Lesson {i + 1}</span>
                      <button onClick={() => removeLesson(i)} className="text-xs text-red-400 hover:opacity-70">Remove</button>
                    </div>
                    <input type="text" placeholder="Lesson title" value={lesson.title} onChange={e => updateLesson(i, "title", e.target.value)} className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${inputClass}`} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Video URL (YouTube/Vimeo)" value={lesson.video_url} onChange={e => updateLesson(i, "video_url", e.target.value)} className={`rounded-lg border px-3 py-2 text-sm focus:outline-none ${inputClass}`} />
                      <input type="number" placeholder="Duration (mins)" value={lesson.duration || ""} onChange={e => updateLesson(i, "duration", parseInt(e.target.value) || 0)} className={`rounded-lg border px-3 py-2 text-sm focus:outline-none ${inputClass}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Price (£)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01" placeholder="0.00" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none ${inputClass}`} />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>Published</p>
                <p className={`text-xs mt-0.5 ${labelClass}`}>{published ? "Live" : "Draft"}</p>
              </div>
              <button onClick={() => setPublished(!published)} className={`relative h-5 w-9 rounded-full transition-colors ${published ? "bg-green-500" : dark ? "bg-white/10" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${published ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <div className={`rounded-xl border p-5 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${labelClass}`}>Thumbnail</p>
            {thumbnail ? (
              <div className="relative">
                <img src={thumbnail} alt="" className="w-full h-36 object-cover rounded-lg" />
                <button onClick={() => setThumbnail("")} className="absolute top-2 right-2 bg-black/60 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">✕</button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed cursor-pointer ${dark ? "border-white/10 hover:border-white/20" : "border-gray-200 hover:border-gray-300"}`}>
                <span className={`text-xs ${labelClass}`}>{uploading ? "Uploading…" : "Upload thumbnail"}</span>
                <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
