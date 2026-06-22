"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import type { ProductCategory } from "@/types";

interface InitialData {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  image_url?: string | null;
  category_id?: string | null;
  stock?: number;
  active?: boolean;
  download_url?: string | null;
  source_type?: string | null;
  source_id?: string | null;
}

interface ProductFormProps {
  initialData?: InitialData;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const { dark } = useAdminTheme();
  const router = useRouter();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [stock, setStock] = useState(initialData?.stock?.toString() ?? "0");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "");
  const [downloadUrl, setDownloadUrl] = useState(initialData?.download_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/product-categories")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); });
  }, []);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const labelClass = dark ? "text-white/40" : "text-gray-500";
  const inputClass = dark
    ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "products");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) setImageUrl(data.url);
    setUploading(false);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current++;
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  async function handleSave() {
    if (!name || !price) return setError("Name and price are required.");
    setSaving(true); setError("");
    const body: Record<string, unknown> = {
      name,
      description,
      price: parseFloat(price),
      category_id: categoryId || null,
      stock: parseInt(stock),
      active,
      image_url: imageUrl || null,
      download_url: downloadUrl || null,
      source_type: initialData?.source_type ?? "manual",
      source_id: initialData?.source_id ?? null,
    };
    const endpoint = initialData?.id ? `/api/products/${initialData.id}` : "/api/products";
    const method = initialData?.id ? "PATCH" : "POST";
    const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save."); } else { router.push("/admin/products/all"); }
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
            <button
              onClick={() => router.back()}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#0822C0] text-white hover:bg-[#061aa0] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Product"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>
        )}

        {initialData?.source_type && initialData.source_type !== "manual" && (
          <div className={`rounded-lg px-4 py-2.5 text-xs flex items-center gap-2 ${dark ? "bg-white/3 border border-white/5 text-white/40" : "bg-blue-50 border border-blue-100 text-blue-600"}`}>
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Imported from {initialData.source_type === "course" ? "a Course" : "a Booking Session"}. You can edit all fields freely.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Budget Planner Template"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe what this product includes…"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors resize-none ${inputClass}`}
                />
              </div>
            </div>

            <div className={`rounded-xl border p-5 ${card}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-4 ${labelClass}`}>Product Image</p>
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs hover:bg-black/80"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                    dragging
                      ? dark ? "border-blue-400/60 bg-blue-400/5" : "border-[#0822C0]/50 bg-[#0822C0]/5"
                      : dark ? "border-white/10 hover:border-white/20" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <svg className={`h-8 w-8 mb-2 transition-colors ${dragging ? dark ? "text-blue-400" : "text-[#0822C0]" : labelClass}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm font-medium transition-colors ${dragging ? dark ? "text-blue-400" : "text-[#0822C0]" : labelClass}`}>
                    {uploading ? "Uploading…" : dragging ? "Drop image here" : "Drag & drop or click to upload"}
                  </span>
                  {!uploading && !dragging && (
                    <span className={`text-xs mt-1 ${dark ? "text-white/20" : "text-gray-300"}`}>PNG, JPG, WEBP</span>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className={`rounded-xl border p-5 ${card}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${labelClass}`}>Download URL</p>
              <p className={`text-xs mb-3 ${dark ? "text-white/25" : "text-gray-400"}`}>For digital products — link to file or Gumroad/Payhip page.</p>
              <input
                type="url"
                value={downloadUrl}
                onChange={e => setDownloadUrl(e.target.value)}
                placeholder="https://…"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Price (£)</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Category</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                >
                  <option value="">— No category —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  min="0"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                />
                <p className={`text-xs mt-1 ${dark ? "text-white/25" : "text-gray-400"}`}>Set 0 for unlimited digital products.</p>
              </div>
            </div>

            <div className={`rounded-xl border p-5 ${card}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>Active</p>
                  <p className={`text-xs mt-0.5 ${labelClass}`}>{active ? "Visible in shop" : "Hidden from shop"}</p>
                </div>
                <button
                  onClick={() => setActive(!active)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${active ? "bg-green-500" : dark ? "bg-white/10" : "bg-gray-200"}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
