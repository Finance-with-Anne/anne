"use client";

import { useAdminTheme } from "@/lib/admin-theme";
import { useState } from "react";
import ActionButton from "@/components/admin/ActionButton";

const DEFAULT_CATEGORIES = ["Budgeting", "Investing", "Debt", "Savings", "Money Mindset", "Business Finance"];

export default function BlogCategoriesPage() {
  const { dark } = useAdminTheme();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCat, setNewCat] = useState("");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const inputClass = dark ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const tagBg = dark ? "bg-white/5 border-white/10 text-white/70" : "bg-gray-50 border-gray-200 text-gray-700";

  function addCategory() {
    const t = newCat.trim();
    if (t && !categories.includes(t)) { setCategories([...categories, t]); setNewCat(""); }
  }

  function removeCategory(cat: string) {
    setCategories(categories.filter(c => c !== cat));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Categories</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>Manage blog post categories.</p>
        </div>
        <ActionButton label="Save Changes" onClick={() => {}} />
      </div>

      <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New category name…"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputClass}`}
          />
          <button
            onClick={addCategory}
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${tagBg}`}>
              {cat}
              <button onClick={() => removeCategory(cat)} className="opacity-40 hover:opacity-80 transition-opacity text-xs">✕</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
