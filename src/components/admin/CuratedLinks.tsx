"use client";

import { useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

type CuratedLink = {
  id: string;
  url: string;
  source_name: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  published: boolean;
  created_at: string;
};

type FetchedMeta = {
  title: string;
  description: string;
  image: string;
  site_name: string;
  url: string;
  partial?: boolean;
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function CuratedLinksClient({ initialLinks }: { initialLinks: CuratedLink[] }) {
  const { dark } = useAdminTheme();

  const [links, setLinks] = useState<CuratedLink[]>(initialLinks);
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [preview, setPreview] = useState<FetchedMeta | null>(null);

  // Editable fields after fetch
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Theme
  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-500";
  const inputCls = dark
    ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const divider = dark ? "border-white/5" : "border-gray-100";

  async function handleFetch() {
    if (!url.trim()) return;
    setFetching(true); setFetchError(""); setPreview(null);
    const res = await fetch("/api/curated/fetch-meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim() }),
    });
    const data = await res.json();
    if (!res.ok) { setFetchError(data.error ?? "Failed to fetch."); setFetching(false); return; }
    setPreview({ ...data, partial: data.partial ?? false });
    setTitle(data.title);
    setExcerpt(data.description);
    setSourceName(data.site_name);
    setCoverImage(data.image);
    setFetching(false);
  }

  async function handleSave() {
    if (!preview || !title.trim()) return;
    setSaving(true); setSaveError("");
    const res = await fetch("/api/curated", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim(), source_name: sourceName, title, excerpt, cover_image: coverImage }),
    });
    const data = await res.json();
    if (!res.ok) { setSaveError(data.error ?? "Failed to save."); setSaving(false); return; }
    setLinks(prev => [data, ...prev]);
    // Reset
    setUrl(""); setPreview(null); setTitle(""); setExcerpt(""); setSourceName(""); setCoverImage("");
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/curated/${id}`, { method: "DELETE" });
    setLinks(prev => prev.filter(l => l.id !== id));
    setDeleting(null);
  }

  async function togglePublished(link: CuratedLink) {
    const res = await fetch(`/api/curated/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !link.published }),
    });
    if (res.ok) {
      setLinks(prev => prev.map(l => l.id === link.id ? { ...l, published: !l.published } : l));
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className={`text-xl font-bold ${heading}`}>Curated Links</h1>
        <p className={`text-sm mt-0.5 ${sub}`}>Paste any article URL — we'll pull the metadata automatically.</p>
      </div>

      {/* ── URL input ── */}
      <div className={`rounded-2xl border p-5 space-y-4 ${card}`}>
        <p className={`text-sm font-semibold ${heading}`}>Add New Source</p>

        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleFetch()}
            placeholder="https://bloomberg.com/article/..."
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm focus:outline-none transition-colors ${inputCls}`}
          />
          <button
            onClick={handleFetch}
            disabled={fetching || !url.trim()}
            className="rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2.5 transition-colors disabled:opacity-50 shrink-0"
          >
            {fetching ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Fetching…
              </span>
            ) : "Fetch →"}
          </button>
        </div>

        {fetchError && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{fetchError}</div>
        )}

        {/* ── Preview + edit ── */}
        {preview && (
          <div className="space-y-4 pt-2">
            {preview.partial && (
              <div className={`rounded-lg px-4 py-3 text-xs flex items-start gap-2.5 ${dark ? "bg-amber-500/8 border border-amber-500/15 text-amber-400" : "bg-amber-50 border border-amber-100 text-amber-700"}`}>
                <svg className="h-3.5 w-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                This site blocked automatic fetching. Fill in the details manually below — the title, image URL, and source name are all editable.
              </div>
            )}
            <p className={`text-xs font-semibold uppercase tracking-widest ${sub}`}>Preview & Edit</p>

            {/* Visual preview card — how it'll look on the frontend */}
            <div className={`rounded-xl overflow-hidden border ${dark ? "border-white/8" : "border-gray-100"}`}>
              {coverImage && (
                <div className="relative h-44 bg-gray-100 dark:bg-white/5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white bg-black/50 backdrop-blur-sm`}>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {sourceName}
                  </span>
                </div>
              )}
              <div className={`p-4 ${dark ? "bg-white/3" : "bg-gray-50"}`}>
                <p className={`text-sm font-bold leading-snug line-clamp-2 ${heading}`}>{title}</p>
                {excerpt && <p className={`text-xs mt-1.5 line-clamp-2 ${sub}`}>{excerpt}</p>}
                <p className={`mt-2 text-xs font-semibold ${dark ? "text-blue-400" : "text-brand"}`}>Read on {sourceName} →</p>
              </div>
            </div>

            {/* Edit fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={`text-xs font-medium ${sub}`}>Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputCls}`} />
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs font-medium ${sub}`}>Source Name</label>
                <input value={sourceName} onChange={e => setSourceName(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputCls}`} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={`text-xs font-medium ${sub}`}>Excerpt</label>
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} style={{ resize: "none" }}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputCls}`} />
            </div>
            <div className="space-y-1.5">
              <label className={`text-xs font-medium ${sub}`}>Cover Image URL</label>
              <input value={coverImage} onChange={e => setCoverImage(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputCls}`} />
            </div>

            {saveError && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{saveError}</div>}

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving || !title.trim()}
                className="rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2.5 transition-colors disabled:opacity-50">
                {saving ? "Saving…" : "Save to Curated"}
              </button>
              <button onClick={() => { setPreview(null); setUrl(""); }}
                className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors ${dark ? "border-white/10 text-white/50 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Saved list ── */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
          <p className={`text-sm font-semibold ${heading}`}>Saved Links</p>
          <p className={`text-xs ${sub}`}>{links.length} total</p>
        </div>

        {links.length === 0 ? (
          <p className={`py-16 text-center text-sm ${sub}`}>No curated links yet.</p>
        ) : (
          <div>
            {links.map(link => (
              <div key={link.id} className={`flex items-start gap-4 px-5 py-4 border-b last:border-0 ${divider}`}>
                {/* Thumbnail */}
                <div className={`h-16 w-24 shrink-0 rounded-lg overflow-hidden ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                  {link.cover_image && (
                    <img src={link.cover_image} alt="" className="h-full w-full object-cover" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                      {link.source_name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${link.published ? dark ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"}`}>
                      {link.published ? "Live" : "Hidden"}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold line-clamp-1 ${heading}`}>{link.title}</p>
                  {link.excerpt && <p className={`text-xs mt-0.5 line-clamp-1 ${sub}`}>{link.excerpt}</p>}
                  <a href={link.url} target="_blank" rel="noopener noreferrer"
                    className={`text-xs mt-0.5 block truncate hover:underline ${dark ? "text-white/20 hover:text-white/50" : "text-gray-400 hover:text-gray-600"}`}>
                    {link.url}
                  </a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-xs ${sub}`}>{fmtDate(link.created_at)}</span>
                  <button onClick={() => togglePublished(link)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${dark ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {link.published ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => handleDelete(link.id)} disabled={deleting === link.id}
                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
