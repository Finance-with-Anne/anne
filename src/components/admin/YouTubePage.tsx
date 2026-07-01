"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import ActionButton from "./ActionButton";

const YT_PATTERN = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function extractId(input: string) {
  const match = input.match(YT_PATTERN);
  return match ? match[1] : input.trim().slice(0, 11);
}

export default function YouTubePage({ videos }: { videos: any[] }) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videoId, setVideoId] = useState("");
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const inputClass = dark
    ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/30" : "text-gray-400";

  function resetForm() {
    setUrl(""); setTitle(""); setDescription(""); setThumbnail(""); setVideoId(""); setError("");
  }

  async function fetchVideoInfo(input: string) {
    if (!YT_PATTERN.test(input)) return;
    setFetching(true);
    setError("");
    try {
      const res = await fetch(`/api/video-info?url=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (res.ok) {
        setVideoId(data.videoId ?? "");
        if (data.title) setTitle(data.title);
        if (data.thumbnail) setThumbnail(data.thumbnail);
      } else {
        setError(data.error ?? "Could not fetch video info.");
      }
    } catch {
      setError("Network error fetching video info.");
    }
    setFetching(false);
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    setTitle(""); setDescription(""); setThumbnail(""); setVideoId(""); setError("");
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => fetchVideoInfo(value), 600);
  }

  async function handleAdd() {
    const id = videoId || extractId(url);
    if (!id || !title) return setError("Paste a YouTube link. Title is required.");
    setSaving(true); setError("");
    const body = {
      youtube_id: id,
      title,
      description,
      thumbnail: thumbnail || `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
      published: true,
    };
    const res = await fetch("/api/youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) { setShowForm(false); resetForm(); router.refresh(); }
    else { const d = await res.json(); setError(d.error ?? "Failed to add."); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this video?")) return;
    await fetch(`/api/youtube/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function togglePublish(video: any) {
    await fetch(`/api/youtube/${video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !video.published }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>YouTube</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{videos.length} videos</p>
        </div>
        <ActionButton label="Add Video" onClick={() => { setShowForm(!showForm); resetForm(); }} />
      </div>

      {showForm && (
        <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
          <p className={`text-sm font-semibold ${heading}`}>Add YouTube Video</p>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>
          )}

          {/* URL input with inline status */}
          <div className="relative">
            <input
              type="text"
              placeholder="Paste YouTube link…"
              value={url}
              onChange={e => handleUrlChange(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none pr-24 ${inputClass}`}
            />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${dark ? "text-white/30" : "text-gray-400"}`}>
              {fetching ? "Fetching…" : videoId ? "✓ Got it" : ""}
            </span>
          </div>

          {/* Preview card — shown once video info is loaded */}
          {thumbnail && (
            <div className={`flex gap-3 rounded-lg border p-3 ${dark ? "border-white/5 bg-white/3" : "border-gray-100 bg-gray-50"}`}>
              <img src={thumbnail} alt="" className="w-28 h-16 rounded object-cover shrink-0" />
              <div className="min-w-0">
                <p className={`text-xs font-semibold leading-snug line-clamp-2 ${dark ? "text-white/80" : "text-gray-800"}`}>{title}</p>
                <p className={`text-xs mt-1 ${dark ? "text-white/30" : "text-gray-400"}`}>youtube.com/watch?v={videoId}</p>
              </div>
            </div>
          )}

          {/* Title — editable so user can override */}
          <input
            type="text"
            placeholder="Video title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none ${inputClass}`}
          />

          <textarea
            rows={2}
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none resize-none ${inputClass}`}
          />

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || fetching || !videoId}
              className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-hover disabled:opacity-40 transition-colors"
            >
              {saving ? "Adding…" : "Add Video"}
            </button>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {videos.length === 0 ? (
        <div className={`rounded-xl border py-16 text-center text-sm ${card} ${sub}`}>
          No videos yet. Add your first YouTube video.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(video => (
            <div key={video.id} className={`rounded-xl border overflow-hidden ${card}`}>
              <div className="relative">
                <img
                  src={video.thumbnail ?? `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                  alt=""
                  className="w-full h-40 object-cover"
                />
                <a
                  href={`https://youtube.com/watch?v=${video.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </a>
              </div>
              <div className="p-4 space-y-3">
                <p className={`font-semibold text-sm leading-snug ${tText}`}>{video.title}</p>
                {video.description && <p className={`text-xs line-clamp-2 ${tSub}`}>{video.description}</p>}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(video)}
                    className={`flex-1 text-center rounded-lg py-1.5 text-xs font-medium transition-colors ${
                      video.published
                        ? dark ? "bg-green-400/15 text-green-400 hover:bg-green-400/25" : "bg-green-50 text-green-600 hover:bg-green-100"
                        : dark ? "bg-white/5 text-white/30 hover:bg-white/10" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    {video.published ? "Published" : "Hidden"}
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dark ? "bg-white/5 text-white/40 hover:bg-red-400/10 hover:text-red-400" : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
