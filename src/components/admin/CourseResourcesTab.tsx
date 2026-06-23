"use client";

import { useEffect, useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

type Resource = {
  id: string;
  type: "file" | "link" | "note";
  title: string;
  url: string | null;
  content: string | null;
  created_at: string;
};

const TYPE_ICONS = {
  file: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  ),
  link: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  ),
  note: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  ),
};

const TYPE_COLOR = {
  file: "text-blue-400 bg-blue-400/10",
  link: "text-green-400 bg-green-400/10",
  note: "text-yellow-400 bg-yellow-400/10",
};

export default function CourseResourcesTab({ courseId }: { courseId: string }) {
  const { dark } = useAdminTheme();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<"file" | "link" | "note">("link");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/35" : "text-gray-400";
  const inputBg = dark
    ? "bg-white/5 border-white/8 text-white/80 placeholder-white/20"
    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400";
  const divider = dark ? "border-white/5" : "border-gray-100";

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/courses/${courseId}/resources`);
    const data = await res.json();
    setResources(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [courseId]);

  async function handleAdd() {
    if (!title.trim()) return;
    if (type !== "note" && !url.trim()) { setError("URL is required for files and links."); return; }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/courses/${courseId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title: title.trim(), url: url.trim() || null, content: content.trim() || null }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to add resource"); return; }
    setTitle(""); setUrl(""); setContent(""); setType("link");
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/courses/${courseId}/resources`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource_id: id }),
    });
    setResources(r => r.filter(x => x.id !== id));
  }

  const tabBtn = (active: boolean) =>
    active
      ? dark ? "bg-white/10 text-white" : "bg-brand text-white"
      : dark ? "text-white/35 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100";

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className={`rounded-2xl border p-5 space-y-4 ${card}`}>
        <h3 className={`text-sm font-semibold ${tText}`}>Add Resource</h3>

        {/* Type selector */}
        <div className={`inline-flex gap-1 rounded-xl p-1 ${dark ? "bg-white/5" : "bg-gray-100"}`}>
          {(["link", "file", "note"] as const).map(t => (
            <button key={t} onClick={() => setType(t)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${tabBtn(type === t)}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 ${inputBg}`}
          />
          {type !== "note" && (
            <input
              type="url"
              placeholder={type === "link" ? "https://…" : "File URL (from upload)"}
              value={url}
              onChange={e => setUrl(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 ${inputBg}`}
            />
          )}
          {type === "note" && (
            <textarea
              placeholder="Note content…"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none ${inputBg}`}
            />
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleAdd}
          disabled={saving || !title.trim()}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add Resource"}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className={`rounded-2xl border py-10 text-center text-sm ${card} ${tSub}`}>Loading…</div>
      ) : resources.length === 0 ? (
        <div className={`rounded-2xl border py-10 text-center text-sm ${card} ${tSub}`}>No resources yet.</div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {resources.map((r, i) => (
            <div key={r.id} className={`flex items-start gap-3 px-4 py-3.5 border-b last:border-b-0 ${divider}`}>
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TYPE_COLOR[r.type]}`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  {TYPE_ICONS[r.type]}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${tText}`}>{r.title}</p>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate block mt-0.5">{r.url}</a>
                )}
                {r.content && (
                  <p className={`text-xs mt-0.5 line-clamp-2 ${tSub}`}>{r.content}</p>
                )}
              </div>
              <span className={`text-[10px] shrink-0 mt-1 ${tSub}`}>{r.type}</span>
              <button
                onClick={() => handleDelete(r.id)}
                className={`shrink-0 rounded-lg p-1.5 transition-colors ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
