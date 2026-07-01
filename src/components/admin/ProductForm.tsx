"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import type { ProductCategory } from "@/types";

type CommunityLink = { type: "whatsapp" | "telegram"; label: string; url: string };

interface InitialData {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  price_ngn?: number | null;
  price_usd?: number | null;
  price_gbp?: number | null;
  image_url?: string | null;
  category_id?: string | null;
  stock?: number;
  active?: boolean;
  download_url?: string | null;
  sales_page_url?: string | null;
  source_type?: string | null;
  source_id?: string | null;
  community_links?: CommunityLink[] | null;
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
  const [priceNgn, setPriceNgn] = useState(initialData?.price_ngn?.toString() ?? "");
  const [priceUsd, setPriceUsd] = useState(initialData?.price_usd?.toString() ?? "");
  const [priceGbp, setPriceGbp] = useState(initialData?.price_gbp?.toString() ?? (initialData?.price?.toString() ?? ""));
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [stock, setStock] = useState(initialData?.stock?.toString() ?? "0");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "");
  const [downloadUrl, setDownloadUrl] = useState(initialData?.download_url ?? "");
  const [salesPageUrl, setSalesPageUrl] = useState(initialData?.sales_page_url ?? "");
  const [communityLinks, setCommunityLinks] = useState<CommunityLink[]>(initialData?.community_links ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
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
    if (!name) return setError("Name is required.");
    if (!priceNgn && !priceUsd && !priceGbp) return setError("At least one price is required.");
    setSaving(true); setError("");
    const body: Record<string, unknown> = {
      name,
      description,
      price: parseFloat(priceNgn || priceGbp || priceUsd || "0"),
      price_ngn: priceNgn ? parseFloat(priceNgn) : null,
      price_usd: priceUsd ? parseFloat(priceUsd) : null,
      price_gbp: priceGbp ? parseFloat(priceGbp) : null,
      category_id: categoryId || null,
      stock: parseInt(stock),
      active,
      image_url: imageUrl || null,
      download_url: downloadUrl || null,
      sales_page_url: salesPageUrl || null,
      community_links: communityLinks,
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
            {initialData.source_type === "template"
              ? "Template product."
              : initialData.source_type === "community"
              ? "Community product. Add WhatsApp or Telegram links below. A sales page is optional."
              : `Imported from ${initialData.source_type === "course" ? "a Course" : "a Booking Session"}.`}
            {initialData.source_type !== "community" && " You can edit all fields freely."}
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
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${labelClass}`}>Download File / URL</p>
              <p className={`text-xs mb-3 ${dark ? "text-white/25" : "text-gray-400"}`}>
                Upload a PDF or paste a link. Buyers will see a download button in their Files page.
              </p>

              {/* File upload button */}
              <div className="mb-3">
                <label className={`inline-flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${dark ? "border-white/10 text-white/50 hover:text-white hover:border-white/20 bg-white/3" : "border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 bg-gray-50"} ${uploadingFile ? "opacity-60 pointer-events-none" : ""}`}>
                  {uploadingFile ? (
                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                  {uploadingFile ? "Uploading…" : "Upload PDF / file"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.csv"
                    className="hidden"
                    disabled={uploadingFile}
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingFile(true);
                      const form = new FormData();
                      form.append("file", file);
                      form.append("folder", "downloads");
                      const res = await fetch("/api/upload", { method: "POST", body: form });
                      const data = await res.json();
                      if (data.url) setDownloadUrl(data.url);
                      setUploadingFile(false);
                      e.target.value = "";
                    }}
                  />
                </label>
                {downloadUrl && downloadUrl.includes("r2.dev") && (
                  <span className={`ml-2 text-xs ${dark ? "text-white/30" : "text-gray-400"}`}>
                    ✓ File uploaded
                  </span>
                )}
              </div>

              {/* URL fallback */}
              <input
                type="text"
                value={downloadUrl}
                onChange={e => setDownloadUrl(e.target.value)}
                placeholder="Or paste a URL: https://…"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
              />

              {/* Preview link */}
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 mt-2 text-xs underline underline-offset-2 ${dark ? "text-white/30 hover:text-white/60" : "text-gray-400 hover:text-gray-700"}`}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Preview file
                </a>
              )}
            </div>

            <div className={`rounded-xl border p-5 ${card}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${labelClass}`}>Sales Page URL</p>
              <p className={`text-xs mb-3 ${dark ? "text-white/25" : "text-gray-400"}`}>
                Path to the dedicated sales page for this product (e.g. <code className="font-mono">/money-tracker</code>).
                The &quot;Learn More&quot; card button will link here, and &quot;Buy Now&quot; goes to{" "}
                <code className="font-mono">/money-tracker/checkout</code>.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={salesPageUrl}
                  onChange={e => setSalesPageUrl(e.target.value)}
                  placeholder="/money-tracker"
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                />
                {salesPageUrl && (
                  <a
                    href={salesPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors ${dark ? "border-white/10 text-white/50 hover:text-white hover:border-white/20" : "border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300"}`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Preview
                  </a>
                )}
              </div>
            </div>

            {/* Community Links */}
            <div className={`rounded-xl border p-5 ${card}`}>
              <div className="flex items-center justify-between mb-1">
                <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>Community Links</p>
                <button
                  type="button"
                  onClick={() => setCommunityLinks(prev => [...prev, { type: "whatsapp", label: "", url: "" }])}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${dark ? "border-white/10 text-white/50 hover:text-white hover:border-white/20" : "border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300"}`}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add link
                </button>
              </div>
              <p className={`text-xs mb-4 ${dark ? "text-white/25" : "text-gray-400"}`}>
                WhatsApp or Telegram links shown to buyers in their Communities page after payment.
              </p>
              {communityLinks.length === 0 ? (
                <p className={`text-xs italic ${dark ? "text-white/20" : "text-gray-300"}`}>No community links yet.</p>
              ) : (
                <div className="space-y-3">
                  {communityLinks.map((link, i) => (
                    <div key={i} className={`rounded-lg border p-3 space-y-2 ${dark ? "border-white/8 bg-white/3" : "border-gray-100 bg-gray-50"}`}>
                      <div className="flex items-center gap-2">
                        <select
                          value={link.type}
                          onChange={e => setCommunityLinks(prev => prev.map((l, idx) => idx === i ? { ...l, type: e.target.value as "whatsapp" | "telegram" } : l))}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs focus:outline-none transition-colors ${inputClass}`}
                        >
                          <option value="whatsapp">WhatsApp</option>
                          <option value="telegram">Telegram</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setCommunityLinks(prev => prev.filter((_, idx) => idx !== i))}
                          className={`ml-auto text-xs ${dark ? "text-white/30 hover:text-red-400" : "text-gray-300 hover:text-red-500"} transition-colors`}
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={link.label}
                        onChange={e => setCommunityLinks(prev => prev.map((l, idx) => idx === i ? { ...l, label: e.target.value } : l))}
                        placeholder="Label (e.g. LBN Members Group)"
                        className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputClass}`}
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={e => setCommunityLinks(prev => prev.map((l, idx) => idx === i ? { ...l, url: e.target.value } : l))}
                        placeholder="https://chat.whatsapp.com/… or https://t.me/…"
                        className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputClass}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="space-y-4">
            <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>Pricing</p>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${labelClass}`}>NGN ₦</label>
                <input
                  type="number"
                  value={priceNgn}
                  onChange={e => setPriceNgn(e.target.value)}
                  min="0"
                  step="1"
                  placeholder="e.g. 50000"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${labelClass}`}>USD $</label>
                <input
                  type="number"
                  value={priceUsd}
                  onChange={e => setPriceUsd(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="e.g. 29.99"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${labelClass}`}>GBP £</label>
                <input
                  type="number"
                  value={priceGbp}
                  onChange={e => setPriceGbp(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="e.g. 24.99"
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
                  <option value="">No category</option>
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
