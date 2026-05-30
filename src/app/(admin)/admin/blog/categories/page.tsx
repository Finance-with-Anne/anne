"use client";

import { useAdminTheme } from "@/lib/admin-theme";
import { useState, useEffect, useCallback } from "react";
import type { Category } from "@/types";

export default function BlogCategoriesPage() {
  const { dark } = useAdminTheme();

  const [categories, setCategories]   = useState<Category[]>([]);
  const [loading, setLoading]         = useState(true);
  const [newName, setNewName]         = useState("");
  const [newParent, setNewParent]     = useState<string>("");
  const [adding, setAdding]           = useState(false);
  const [error, setError]             = useState("");
  const [search, setSearch]           = useState("");
  // subcategory form per parent
  const [subForm, setSubForm]         = useState<Record<string, string>>({});
  const [addingSub, setAddingSub]     = useState<Record<string, boolean>>({});
  const [expandedSub, setExpandedSub] = useState<Record<string, boolean>>({});

  const card    = dark ? "bg-[#111318] border-white/5"  : "bg-white border-gray-200";
  const heading = dark ? "text-white"                   : "text-gray-900";
  const sub     = dark ? "text-white/40"                : "text-gray-500";
  const inputCls = dark
    ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const rowHover = dark ? "hover:bg-white/3" : "hover:bg-gray-50";

  const allParents = categories.filter(c => !c.parent_id);
  const parents = search
    ? allParents.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        categories.some(s => s.parent_id === c.id && s.name.toLowerCase().includes(search.toLowerCase()))
      )
    : allParents;
  const children = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/blog-categories");
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addCategory(name: string, parentId?: string) {
    if (!name.trim()) return;
    if (parentId) {
      setAddingSub(p => ({ ...p, [parentId]: true }));
    } else {
      setAdding(true);
    }
    setError("");
    const res = await fetch("/api/blog-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), parent_id: parentId ?? null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to add.");
    } else {
      // optimistic insert
      setCategories(prev => [...prev, data]);
      if (parentId) {
        setSubForm(p => ({ ...p, [parentId]: "" }));
        setExpandedSub(p => ({ ...p, [parentId]: true }));
      } else {
        setNewName(""); setNewParent("");
      }
    }
    if (parentId) setAddingSub(p => ({ ...p, [parentId]: false }));
    else setAdding(false);
  }

  async function deleteCategory(id: string) {
    // optimistic remove
    setCategories(prev => prev.filter(c => c.id !== id && c.parent_id !== id));
    await fetch(`/api/blog-categories/${id}`, { method: "DELETE" });
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Categories</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{allParents.length} parent · {categories.filter(c=>c.parent_id).length} sub</p>
        </div>
        <div className="relative w-52">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${sub}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)}
            className={`w-full rounded-lg border pl-9 pr-3 py-2 text-xs focus:outline-none transition-colors ${inputCls}`} />
          {search && (
            <button onClick={() => setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${sub} hover:opacity-70`}>✕</button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Left: Add forms ─────────────────────────── */}
        <div className="space-y-4">

          {/* Add parent category */}
          <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${sub}`}>New Category</p>
            <input
              type="text"
              placeholder="e.g. Retirement Planning"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCategory(newName)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputCls}`}
            />
            <button
              onClick={() => addCategory(newName)}
              disabled={adding || !newName.trim()}
              className="w-full py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors disabled:opacity-40"
            >
              {adding ? "Adding…" : "Add Category"}
            </button>
          </div>

          {/* How it works */}
          <div className={`rounded-xl border border-dashed p-5 space-y-1 ${dark ? "border-white/10" : "border-gray-200"}`}>
            <p className={`text-xs font-semibold ${sub}`}>How categories work</p>
            <p className={`text-xs leading-relaxed ${dark ? "text-white/20" : "text-gray-400"}`}>
              Add parent categories first. Then expand any parent to add subcategories beneath it.
              When writing a post you can assign one or more categories and subcategories.
            </p>
          </div>
        </div>

        {/* ── Right: Category tree ─────────────────────── */}
        <div className={`rounded-xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-4 border-b ${divider}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${sub}`}>
              All Categories
            </p>
          </div>

          {loading ? (
            <div className={`py-12 text-center text-sm ${sub}`}>Loading…</div>
          ) : parents.length === 0 ? (
            <div className={`py-12 text-center text-sm ${sub}`}>No categories yet. Add your first one.</div>
          ) : (
            <div className="divide-y divide-inherit" style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6" }}>
              {parents.map(cat => {
                const subs = children(cat.id);
                const isExpanded = expandedSub[cat.id];
                return (
                  <div key={cat.id}>
                    {/* Parent row */}
                    <div className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${rowHover}`}>
                      <button
                        onClick={() => setExpandedSub(p => ({ ...p, [cat.id]: !p[cat.id] }))}
                        className={`h-5 w-5 rounded flex items-center justify-center flex-none transition-colors ${dark ? "text-white/30 hover:text-white/60" : "text-gray-300 hover:text-gray-600"}`}
                      >
                        <svg className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <span className={`flex-1 text-sm font-medium ${heading}`}>{cat.name}</span>
                      {subs.length > 0 && (
                        <span className={`text-xs rounded-full px-2 py-0.5 ${dark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"}`}>{subs.length}</span>
                      )}
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className={`h-6 w-6 rounded flex items-center justify-center flex-none transition-colors opacity-0 group-hover:opacity-100 ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <button onClick={() => deleteCategory(cat.id)} className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-200 hover:text-red-500 hover:bg-red-50"}`}>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    {/* Expanded: subcategories + add sub form */}
                    {isExpanded && (
                      <div className={`border-t ${divider}`}>
                        {subs.map(s => (
                          <div key={s.id} className={`flex items-center gap-2 pl-12 pr-5 py-2.5 transition-colors ${rowHover}`}>
                            <span className={`h-1 w-1 rounded-full flex-none ${dark ? "bg-white/20" : "bg-gray-300"}`} />
                            <span className={`flex-1 text-sm ${dark ? "text-white/60" : "text-gray-600"}`}>{s.name}</span>
                            <button onClick={() => deleteCategory(s.id)} className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${dark ? "text-white/10 hover:text-red-400 hover:bg-red-400/10" : "text-gray-200 hover:text-red-500 hover:bg-red-50"}`}>
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}

                        {/* Add sub form */}
                        <div className={`flex items-center gap-2 pl-10 pr-4 py-2.5 border-t ${divider}`}>
                          <input
                            type="text"
                            placeholder="Add subcategory…"
                            value={subForm[cat.id] ?? ""}
                            onChange={e => setSubForm(p => ({ ...p, [cat.id]: e.target.value }))}
                            onKeyDown={e => e.key === "Enter" && addCategory(subForm[cat.id] ?? "", cat.id)}
                            className={`flex-1 rounded-lg border px-3 py-1.5 text-xs focus:outline-none transition-colors ${inputCls}`}
                          />
                          <button
                            onClick={() => addCategory(subForm[cat.id] ?? "", cat.id)}
                            disabled={addingSub[cat.id] || !subForm[cat.id]?.trim()}
                            className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-hover transition-colors disabled:opacity-40"
                          >
                            {addingSub[cat.id] ? "…" : "Add"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
