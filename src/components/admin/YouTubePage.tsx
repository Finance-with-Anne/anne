"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import ActionButton from "./ActionButton";

export default function YouTubePage({ videos }: { videos: any[] }) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [youtubeId, setYoutubeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const inputClass = dark ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/30" : "text-gray-400";

  function extractId(input: string) {
    const match = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : input.trim();
  }

  async function handleAdd() {
    const id = extractId(youtubeId);
    if (!id || !title) return setError("Title and YouTube ID/URL are required.");
    setSaving(true); setError("");
    const body = { youtube_id: id, title, description, thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`, published: true, order: videos.length };
    const res = await fetch("/api/youtube", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setShowForm(false); setYoutubeId(""); setTitle(""); setDescription(""); router.refresh(); }
    else { const d = await res.json(); setError(d.error ?? "Failed to add."); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this video?")) return;
    await fetch(`/api/youtube/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function togglePublish(video: any) {
    await fetch(`/api/youtube/${video.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !video.published }) });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>YouTube</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{videos.length} videos</p>
        </div>
        <ActionButton label="Add Video" onClick={() => setShowForm(!showForm)} />
      </div>

      {showForm && (
        <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
          <p className={`text-sm font-semibold ${heading}`}>Add YouTube Video</p>
          {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>}
          <input type="text" placeholder="YouTube URL or Video ID" value={youtubeId} onChange={e => setYoutubeId(e.target.value)} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none ${inputClass}`} />
          <input type="text" placeholder="Video title" value={title} onChange={e => setTitle(e.target.value)} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none ${inputClass}`} />
          <textarea rows={2} placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none resize-none ${inputClass}`} />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-hover disabled:opacity-50 transition-colors">{saving ? "Adding…" : "Add Video"}</button>
            <button onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancel</button>
          </div>
        </div>
      )}

      {videos.length === 0 ? (
        <div className={`rounded-xl border py-16 text-center text-sm ${card} ${sub}`}>No videos yet. Add your first YouTube video.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(video => (
            <div key={video.id} className={`rounded-xl border overflow-hidden ${card}`}>
              <div className="relative">
                <img src={video.thumbnail ?? `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} alt="" className="w-full h-40 object-cover" />
                <a href={`https://youtube.com/watch?v=${video.youtube_id}`} target="_blank" rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </a>
              </div>
              <div className="p-4 space-y-3">
                <p className={`font-semibold text-sm leading-snug ${tText}`}>{video.title}</p>
                {video.description && <p className={`text-xs line-clamp-2 ${tSub}`}>{video.description}</p>}
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePublish(video)} className={`flex-1 text-center rounded-lg py-1.5 text-xs font-medium transition-colors ${video.published ? dark ? "bg-green-400/15 text-green-400 hover:bg-green-400/25" : "bg-green-50 text-green-600 hover:bg-green-100" : dark ? "bg-white/5 text-white/30 hover:bg-white/10" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                    {video.published ? "Published" : "Hidden"}
                  </button>
                  <button onClick={() => handleDelete(video.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dark ? "bg-white/5 text-white/40 hover:bg-red-400/10 hover:text-red-400" : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"}`}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
