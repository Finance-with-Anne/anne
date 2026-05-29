"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";

const CATEGORIES = ["Digital Product", "Template", "Course", "Ebook", "Coaching", "Membership", "Other"];

interface ProductFormProps {
  initialData?: { id?: string; name?: string; description?: string; price?: number; image_url?: string; category?: string; stock?: number; active?: boolean };
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const { dark } = useAdminTheme();
  const router = useRouter();

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [category, setCategory] = useState(initialData?.category ?? CATEGORIES[0]);
  const [stock, setStock] = useState(initialData?.stock?.toString() ?? "0");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const labelClass = dark ? "text-white/40" : "text-gray-500";
  const inputClass = dark ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const divider = dark ? "border-white/5" : "border-gray-100";

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "products");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) setImageUrl(data.url);
    setUploading(false);
  }

  async function handleSave() {
    if (!name || !price) return setError("Name and price are required.");
    setSaving(true); setError("");
    const body = { name, description, price: parseFloat(price), category, stock: parseInt(stock), active, image_url: imageUrl };
    const endpoint = initialData?.id ? `/api/products/${initialData.id}` : "/api/products";
    const method = initialData?.id ? "PATCH" : "POST";
    const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save."); } else { router.push("/admin/products"); }
    setSaving(false);
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>{initialData?.id ? "Edit Product" : "New Product"}</h1>
          <p className={`text-sm mt-0.5 ${labelClass}`}>Fill in the details below.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50">{saving ? "Saving…" : "Save Product"}</button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Product Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Budget Planner Template" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe what this product includes…" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors resize-none ${inputClass}`} />
            </div>
          </div>

          <div className={`rounded-xl border p-5 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-4 ${labelClass}`}>Image</p>
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="" className="w-full h-48 object-cover rounded-lg" />
                <button onClick={() => setImageUrl("")} className="absolute top-2 right-2 bg-black/60 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">✕</button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${dark ? "border-white/10 hover:border-white/20" : "border-gray-200 hover:border-gray-300"}`}>
                <svg className={`h-8 w-8 mb-2 ${labelClass}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className={`text-sm ${labelClass}`}>{uploading ? "Uploading…" : "Click to upload image"}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Price (£)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01" placeholder="0.00" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Stock</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} min="0" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`} />
            </div>
          </div>
          <div className={`rounded-xl border p-5 ${card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>Active</p>
                <p className={`text-xs mt-0.5 ${labelClass}`}>{active ? "Visible in shop" : "Hidden from shop"}</p>
              </div>
              <button onClick={() => setActive(!active)} className={`relative h-5 w-9 rounded-full transition-colors ${active ? "bg-green-500" : dark ? "bg-white/10" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
