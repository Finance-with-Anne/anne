"use client";

import { useAdminTheme } from "@/lib/admin-theme";
import { useState, useEffect } from "react";

const PRESET = ["Budgeting", "Investing", "Debt Management", "Savings", "Money Mindset", "Business Finance", "Financial Planning", "Side Hustles", "Tax", "Property"];

export default function BlogCategoriesPage() {
  const { dark } = useAdminTheme();
  const [categories, setCategories] = useState<string[]>(PRESET);
  const [newCat, setNewCat] = useState("");
  const [saved, setSaved] = useState(false);

  const card    = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub     = dark ? "text-white/40" : "text-gray-400";
  const inputBg = dark ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const tagBg   = dark ? "bg-white/5 border-white/10 text-white/70" : "bg-gray-50 border-gray-200 text-gray-700";
  const divider = dark ? "border-white/5" : "border-gray-100";

  function add() {
    const t = newCat.trim();
    if (t && !categories.includes(t)) { setCategories([...categories, t]); setNewCat(""); }
  }

  function remove(cat: string) { setCategories(categories.filter(c => c !== cat)); }

  function handleSave() {
    // persist to localStorage (can be wired to DB once blog_categories table is added)
    localStorage.setItem("anne_blog_categories", JSON.stringify(categories));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  useEffect(() => {
    const stored = localStorage.getItem("anne_blog_categories");
    if (stored) setCategories(JSON.parse(stored));
  }, []);

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Categories</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{categories.length} categories</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors"
        >
          {saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      <div className={`rounded-xl border ${card}`}>
        {/* Add new */}
        <div className={`p-5 border-b ${divider}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${sub}`}>Add Category</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Retirement Planning"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputBg}`}
            />
            <button
              onClick={add}
              className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Categories grid */}
        <div className="p-5">
          <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${sub}`}>All Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium ${tagBg}`}>
                {cat}
                <button onClick={() => remove(cat)} className={`text-xs transition-opacity opacity-40 hover:opacity-80 ${dark ? "text-white" : "text-gray-600"}`}>✕</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className={`rounded-xl border border-dashed p-5 text-sm ${dark ? "border-white/10 text-white/30" : "border-gray-200 text-gray-400"}`}>
        <p className="font-medium mb-1">How categories work</p>
        <p className="text-xs leading-relaxed">Categories are used to organise blog posts and help readers find related content. You can assign categories when writing or editing a post.</p>
      </div>
    </div>
  );
}
