"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import type { CourseCategory } from "@/types";

const PALETTE = [
  "#3B82F6", "#8B5CF6", "#F59E0B", "#10B981",
  "#EC4899", "#06B6D4", "#F97316", "#EF4444",
  "#14B8A6", "#6B7280",
];

interface CategoryWithCount extends CourseCategory {
  course_count?: number;
}

const emptyForm = { name: "", description: "", color: PALETTE[0] };

export default function CourseCategoriesPage({ categories: initial }: { categories: CategoryWithCount[] }) {
  const { dark } = useAdminTheme();
  const router = useRouter();

  const [categories, setCategories] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
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
    if (!form.name.trim()) return setError("Name is required.");
    setSaving(true); setError("");
    const res = await fetch("/api/course-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save."); }
    else { setCategories(prev => [...prev, data]); setForm(emptyForm); setAdding(false); }
    setSaving(false);
  }

  async function handleEdit(id: string) {
    if (!editForm.name.trim()) return setError("Name is required.");
    setSaving(true); setError("");
    const res = await fetch(`/api/course-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save."); }
    else { setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c)); setEditingId(null); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Courses using it will have no category.")) return;
    setDeleting(id);
    await fetch(`/api/course-categories/${id}`, { method: "DELETE" });
    setCategories(prev => prev.filter(c => c.id !== id));
    router.refresh();
    setDeleting(null);
  }

  function startEdit(c: CategoryWithCount) {
    setEditingId(c.id);
    setEditForm({ name: c.name, description: c.description ?? "", color: c.color });
    setError("");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Course Categories</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{categories.length} categories</p>
        </div>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setEditingId(null); setError(""); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#0822C0] text-white hover:bg-[#061aa0] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Category
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>
      )}

      {adding && (
        <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>New Category</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Name *</label>
              <input
                type="text" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Personal Finance"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>Description</label>
              <input
                type="text" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
              />
            </div>
          </div>
          <div>
            <label className={`block text-xs font-semibold mb-2 ${labelClass}`}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {PALETTE.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`h-7 w-7 rounded-full transition-transform
                    ${form.color === c ? "ring-2 ring-offset-2 scale-110" : "hover:scale-105"}
                    ${dark ? "ring-offset-[#111318]" : "ring-offset-white"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#0822C0] text-white hover:bg-[#061aa0] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save Category"}
            </button>
            <button
              onClick={() => { setAdding(false); setForm(emptyForm); setError(""); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/50 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >Cancel</button>
          </div>
        </div>
      )}

      {categories.length === 0 && !adding ? (
        <div className={`rounded-xl border py-16 text-center ${card}`}>
          <p className={`text-sm ${sub}`}>No categories yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className={`rounded-xl border p-5 ${card}`}>
              {editingId === cat.id ? (
                <div className="space-y-3">
                  <input
                    type="text" value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
                  />
                  <input
                    type="text" value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Description"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {PALETTE.map(c => (
                      <button
                        key={c}
                        onClick={() => setEditForm(f => ({ ...f, color: c }))}
                        className={`h-6 w-6 rounded-full transition-transform
                          ${editForm.color === c ? "ring-2 ring-offset-1 scale-110" : "hover:scale-105"}
                          ${dark ? "ring-offset-[#111318]" : "ring-offset-white"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(cat.id)} disabled={saving}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-[#0822C0] text-white hover:bg-[#061aa0] disabled:opacity-50 transition-colors"
                    >{saving ? "Saving…" : "Save"}</button>
                    <button
                      onClick={() => { setEditingId(null); setError(""); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${dark ? "border-white/10 text-white/50 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + "22" }}>
                        <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      </span>
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm truncate ${heading}`}>{cat.name}</p>
                        {cat.course_count !== undefined && (
                          <p className={`text-xs mt-0.5 ${sub}`}>{cat.course_count} course{cat.course_count !== 1 ? "s" : ""}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(cat)}
                        className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-white/60 hover:bg-white/5" : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deleting === cat.id}
                        className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {cat.description && (
                    <p className={`mt-3 text-xs leading-relaxed ${sub}`}>{cat.description}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
