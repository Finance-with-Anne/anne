"use client";

import { useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";
import type { CourseTag } from "@/types";

export default function CourseTagsPage({ tags: initial }: { tags: CourseTag[] }) {
  const { dark } = useAdminTheme();

  const [tags, setTags] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const inputClass = dark
    ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const labelClass = dark ? "text-white/40" : "text-gray-500";

  async function handleAdd() {
    if (!name.trim()) return setError("Name is required.");
    setSaving(true); setError("");
    const res = await fetch("/api/course-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save."); }
    else { setTags(prev => [...prev, data]); setName(""); setAdding(false); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tag? It will be removed from all courses.")) return;
    setDeleting(id);
    await fetch(`/api/course-tags/${id}`, { method: "DELETE" });
    setTags(prev => prev.filter(t => t.id !== id));
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Course Tags</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{tags.length} tags</p>
        </div>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setError(""); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#0822C0] text-white hover:bg-[#061aa0] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Tag
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>
      )}

      {adding && (
        <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>New Tag</p>
          <div className="flex gap-3">
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Budgeting"
              autoFocus
              className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
            />
            <button
              onClick={handleAdd} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#0822C0] text-white hover:bg-[#061aa0] disabled:opacity-50 transition-colors"
            >{saving ? "Saving…" : "Add Tag"}</button>
            <button
              onClick={() => { setAdding(false); setName(""); setError(""); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/50 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >Cancel</button>
          </div>
        </div>
      )}

      {tags.length === 0 && !adding ? (
        <div className={`rounded-xl border py-16 text-center ${card}`}>
          <p className={`text-sm ${sub}`}>No tags yet. Create your first one above.</p>
        </div>
      ) : (
        <div className={`rounded-xl border ${card}`}>
          <div className="flex flex-wrap gap-2 p-5">
            {tags.map(tag => (
              <div
                key={tag.id}
                className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-medium
                  ${dark ? "bg-white/5 text-white/70" : "bg-gray-100 text-gray-700"}`}
              >
                <span>{tag.name}</span>
                <button
                  onClick={() => handleDelete(tag.id)}
                  disabled={deleting === tag.id}
                  className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors
                    ${dark ? "text-white/30 hover:text-red-400 hover:bg-red-400/10" : "text-gray-400 hover:text-red-500 hover:bg-red-100"}`}
                >
                  <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
