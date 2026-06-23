"use client";

import { useEffect, useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";
import RichTextEditor from "./RichTextEditor";

function hasContent(html: string) {
  return html.replace(/<[^>]*>/g, "").trim().length > 0;
}

type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function CourseAnnouncementsTab({ courseId }: { courseId: string }) {
  const { dark } = useAdminTheme();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/35" : "text-gray-400";
  const inputBg = dark
    ? "bg-white/5 border-white/8 text-white/80 placeholder-white/20"
    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400";
  const divider = dark ? "border-white/5" : "border-gray-100";

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/courses/${courseId}/announcements`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [courseId]);

  async function handlePost() {
    if (!title.trim() || !hasContent(body)) { setError("Title and body are required."); return; }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/courses/${courseId}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), body: body.trim() }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed"); return; }
    setTitle(""); setBody("<p></p>");
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/courses/${courseId}/announcements`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcement_id: id }),
    });
    setItems(prev => prev.filter(x => x.id !== id));
    setPendingDelete(null);
  }

  return (
    <div className="space-y-4">
      {/* Post form */}
      <div className={`rounded-2xl border p-5 space-y-3 ${card}`}>
        <h3 className={`text-sm font-semibold ${tText}`}>New Announcement</h3>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 ${inputBg}`}
        />
        <RichTextEditor
          value={body}
          onChange={setBody}
          dark={dark}
          placeholder="Write your announcement…"
          minHeight={160}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          onClick={handlePost}
          disabled={saving || !title.trim() || !hasContent(body)}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
        >
          {saving ? "Posting…" : "Post Announcement"}
        </button>
      </div>

      {/* Announcement list — newest first, all visible */}
      {loading ? (
        <div className={`rounded-2xl border py-10 text-center text-sm ${card} ${tSub}`}>Loading…</div>
      ) : items.length === 0 ? (
        <div className={`rounded-2xl border py-10 text-center text-sm ${card} ${tSub}`}>No announcements yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.id} className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {i === 0 && (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${dark ? "bg-blue-400/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                      Latest
                    </span>
                  )}
                  <h4 className={`text-sm font-semibold truncate ${tText}`}>{item.title}</h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs ${tSub}`}>{formatDate(item.created_at)}</span>
                  <button
                    onClick={() => setPendingDelete(item.id)}
                    className={`rounded-lg p-1 transition-colors ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                className={`mt-2.5 prose prose-sm max-w-none prose-p:my-1.5 prose-headings:font-semibold ${
                  dark
                    ? "prose-invert prose-p:text-white/60 prose-headings:text-white/80 prose-strong:text-white/90 prose-a:text-blue-400 prose-li:text-white/60"
                    : "prose-p:text-gray-500 prose-a:text-[#0822C0]"
                }`}
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPendingDelete(null)} />
          <div className={`relative w-full max-w-xs rounded-2xl border shadow-2xl p-6 ${dark ? "bg-[#111318] border-white/8" : "bg-white border-gray-200"}`}>
            <p className={`text-sm font-medium text-center mb-4 ${tText}`}>Delete this announcement?</p>
            <div className="flex gap-3">
              <button onClick={() => setPendingDelete(null)} className={`flex-1 rounded-xl py-2 text-sm ${dark ? "bg-white/6 text-white/60" : "bg-gray-100 text-gray-600"}`}>Cancel</button>
              <button onClick={() => handleDelete(pendingDelete)} className="flex-1 rounded-xl py-2 text-sm bg-red-500 text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
