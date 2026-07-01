"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Lesson {
  id: string;
  title: string;
  type: string;
  video_url?: string;
  content?: string;
  duration?: number;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Props {
  courseId: string;
  courseTitle: string;
  thumbnailUrl?: string | null;
  curriculum: Section[];
  initialLessonId: string | null;
  completedLessonIds: string[];
  backHref?: string;
}

type Tab = "overview" | "announcements" | "reviews" | "support" | "resources" | "notes" | "quiz";

function getYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      return u.searchParams.get("v") ?? (u.hostname === "youtu.be" ? u.pathname.slice(1) : null);
    }
    return null;
  } catch { return null; }
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const ytId = getYoutubeId(url);
    if (ytId) {
      return `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&iv_load_policy=3&disablekb=0`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch { return null; }
}

function YoutubeEmbed({ embedUrl, videoId, lessonId }: { embedUrl: string; videoId: string; lessonId: string }) {
  const [playing, setPlaying] = useState(false);
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  useEffect(() => { setPlaying(false); }, [lessonId]);

  return (
    <div
      className="relative w-full select-none"
      style={{ paddingBottom: "56.25%" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        key={lessonId + (playing ? "-play" : "")}
        src={playing ? `${embedUrl}&autoplay=1` : embedUrl}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />

      {/* Custom play overlay — hides YouTube's unstarted screen and "Watch on YouTube" button */}
      {!playing && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black"
          onClick={() => setPlaying(true)}
          style={{ backgroundImage: `url(${thumbUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-2xl hover:scale-105 transition-transform">
            <svg className="h-7 w-7 text-[#0822C0] ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Cover YouTube watermark / "Watch on YouTube" in controls bar (bottom-right) */}
      <div className="absolute bottom-0 right-0 z-20 h-10 w-36 bg-black" style={{ pointerEvents: "none" }} />
    </div>
  );
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function Stars({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          disabled={!onChange}
        >
          <svg className="h-5 w-5" fill={(hover || rating) >= i ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── Announcements Tab ───────────────────────────────────────────────────────
function AnnouncementsTab({ courseId }: { courseId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${courseId}/announcements`)
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : (d.announcements ?? [])); setLoading(false); });
  }, [courseId]);

  if (loading) return (
    <div className="space-y-4 px-8 py-6">
      {[1, 2].map(i => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-100 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  );

  if (!items.length) return (
    <div className="px-8 py-12 text-center text-sm text-gray-400">No announcements yet.</div>
  );

  return (
    <div className="px-8 py-6 space-y-6 max-w-3xl">
      {items.map((a, i) => (
        <div key={a.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-[#0822C0]/10 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="h-4 w-4 text-[#0822C0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-gray-900">{a.title}</h3>
                {i === 0 && (
                  <span className="text-[10px] font-semibold text-[#0822C0] bg-[#0822C0]/8 px-2 py-0.5 rounded-full">Latest</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{timeAgo(a.created_at)}</p>
              <div
                className="mt-3 prose prose-sm max-w-none prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-2 prose-strong:text-gray-900 prose-a:text-[#0822C0] prose-a:no-underline hover:prose-a:underline prose-headings:text-gray-900 prose-headings:font-semibold prose-li:text-gray-700"
                dangerouslySetInnerHTML={{ __html: a.body }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Reviews Tab ─────────────────────────────────────────────────────────────
function ReviewsTab({ courseId }: { courseId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [myReview, setMyReview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const supabase = createClient();
      const [reviewsRes, userRes] = await Promise.all([
        fetch(`/api/courses/${courseId}/reviews`).then(r => r.json()),
        supabase.auth.getUser(),
      ]);
      const all: any[] = Array.isArray(reviewsRes) ? reviewsRes : [];
      const uid = userRes.data?.user?.id;
      const mine = uid ? (all.find((r: any) => r.user_id === uid) ?? null) : null;
      setReviews(all);
      setMyReview(mine);
      if (mine) { setRating(mine.rating); setComment(mine.comment ?? ""); }
    } catch {
      // silently fail — no reviews yet or table missing
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [courseId]);

  async function submit() {
    if (!rating) return;
    setSubmitting(true); setError("");
    const r = await fetch(`/api/courses/${courseId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    if (!r.ok) { const d = await r.json(); setError(d.error ?? "Failed"); }
    else { await load(); }
    setSubmitting(false);
  }

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const dist = [5, 4, 3, 2, 1].map(n => ({
    n, count: reviews.filter(r => r.rating === n).length,
  }));

  if (loading) return (
    <div className="px-8 py-6 space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse h-4 bg-gray-100 rounded w-full" />
      ))}
    </div>
  );

  return (
    <div className="px-8 py-6 space-y-8 max-w-3xl">
      {/* Submit / your review */}
      <div className="rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          {myReview ? "Your review" : "Leave a review"}
        </h3>
        <Stars rating={rating} onChange={myReview ? undefined : setRating} />
        <textarea
          value={comment}
          onChange={e => !myReview && setComment(e.target.value)}
          readOnly={!!myReview}
          placeholder="Share your experience with this course…"
          rows={3}
          className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0822C0]/20 resize-none read-only:bg-gray-50 read-only:cursor-default"
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        {!myReview && (
          <button
            onClick={submit}
            disabled={submitting || !rating}
            className="mt-3 rounded-lg bg-[#0822C0] text-white text-sm font-semibold px-5 py-2 hover:bg-[#061aa0] transition-colors disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        )}
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-start gap-8">
          <div className="text-center shrink-0">
            <p className="text-5xl font-extrabold text-gray-900">{avg}</p>
            <Stars rating={Math.round(Number(avg))} />
            <p className="text-xs text-gray-400 mt-1">{reviews.length} rating{reviews.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {dist.map(d => (
              <div key={d.n} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-3">{d.n}</span>
                <svg className="h-3 w-3 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: reviews.length > 0 ? `${(d.count / reviews.length) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-4 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review list */}
      {reviews.length > 0 && (
        <div className="space-y-5">
          {reviews.map(r => {
            const name = r.profile?.full_name ?? "Student";
            const initials = name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
            return (
              <div key={r.id} className="flex gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                <div className="h-9 w-9 rounded-full bg-[#0822C0]/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#0822C0]">
                  {r.profile?.avatar_url
                    ? <img src={r.profile.avatar_url} className="h-9 w-9 rounded-full object-cover" />
                    : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-800">{name}</p>
                    <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
                  </div>
                  <Stars rating={r.rating} />
                  {r.comment && <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviews.length === 0 && !myReview && (
        <p className="text-sm text-gray-400 text-center">No reviews yet. Be the first!</p>
      )}
    </div>
  );
}

// ─── Support Tab ─────────────────────────────────────────────────────────────
function SupportTab({ courseId }: { courseId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function load() {
    try {
      const r = await fetch(`/api/courses/${courseId}/support`);
      const d = await r.json();
      setMessages(Array.isArray(d) ? d : (d.messages ?? []));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [courseId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const msg = text.trim();
    if (!msg || sending) return;
    setSending(true);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await fetch(`/api/courses/${courseId}/support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    await load();
    setSending(false);
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  return (
    <div className="flex flex-col" style={{ height: 560 }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-[#0822C0]/8 flex items-center justify-center shrink-0">
          <svg className="h-4.5 w-4.5 text-[#0822C0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Q&amp;A / Support</p>
          <p className="text-xs text-gray-400 mt-0.5">Ask the instructor. Replies usually within 24h</p>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-8 py-5 space-y-4">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className="animate-pulse h-10 w-48 bg-gray-100 rounded-2xl" />
              </div>
            ))}
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">No messages yet</p>
            <p className="text-xs text-gray-400">Send your first question below and the instructor will get back to you.</p>
          </div>
        )}
        {!loading && messages.map(m => (
          <div key={m.id} className={`flex items-end gap-2 ${m.is_admin ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mb-0.5 ${
              m.is_admin ? "bg-[#0822C0] text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {m.is_admin ? "A" : "Y"}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-1 max-w-[65%] ${m.is_admin ? "items-end" : "items-start"}`}>
              {m.is_admin && (
                <span className="text-[10px] font-medium text-gray-400 px-1">Instructor</span>
              )}
              <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                m.is_admin
                  ? "bg-[#0822C0] text-white rounded-2xl rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
              }`}>
                {m.message}
              </div>
              <span className="text-[10px] text-gray-400 px-1">{timeAgo(m.created_at)}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-8 py-4 border-t border-gray-100 shrink-0">
        <div className="flex items-end gap-2 rounded-2xl border border-gray-200 focus-within:border-[#0822C0]/50 focus-within:ring-3 focus-within:ring-[#0822C0]/10 transition-all bg-white px-4 py-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask a question…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-gray-700 placeholder-gray-300 focus:outline-none leading-relaxed"
            style={{ minHeight: 24, maxHeight: 120 }}
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="rounded-xl bg-[#0822C0] text-white p-2 hover:bg-[#061aa0] transition-colors disabled:opacity-30 shrink-0 self-end"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-300 mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

// ─── Resources Tab ───────────────────────────────────────────────────────────
function ResourcesTab({ courseId }: { courseId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${courseId}/resources`)
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); });
  }, [courseId]);

  const iconPath: Record<string, string> = {
    file: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    link: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    note: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  };
  const iconColor: Record<string, string> = {
    file: "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
    link: "bg-green-50 text-green-600 dark:bg-green-400/10 dark:text-green-400",
    note: "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  };

  if (loading) return (
    <div className="px-8 py-10 space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />)}
    </div>
  );

  if (!items.length) return (
    <div className="px-8 py-16 text-center text-sm text-gray-400 dark:text-white/30">No resources yet.</div>
  );

  return (
    <div className="px-8 py-6 max-w-3xl space-y-3">
      {items.map(r => (
        <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-white/3 px-5 py-4 hover:border-[#0822C0]/20 dark:hover:border-white/15 transition-colors group">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconColor[r.type] ?? iconColor.file}`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={iconPath[r.type] ?? iconPath.file} />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.title}</p>
            {r.url && <p className="text-xs text-gray-400 dark:text-white/30 truncate mt-0.5">{r.url}</p>}
            {r.content && <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 line-clamp-2">{r.content}</p>}
          </div>
          {(r.type === "file" || r.type === "link") && r.url && (
            <a href={r.url} target="_blank" rel="noopener noreferrer"
              className="shrink-0 h-8 w-8 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-white/30 hover:text-[#0822C0] dark:hover:text-white hover:border-[#0822C0]/30 dark:hover:border-white/30 transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Notes Tab ────────────────────────────────────────────────────────────────
function NotesTab({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    setSaved(true);
    fetch(`/api/courses/${courseId}/notes?lesson_id=${lessonId}`)
      .then(r => r.json())
      .then(d => setContent(d.content ?? ""));
  }, [courseId, lessonId]);

  function handleChange(val: string) {
    setContent(val);
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await fetch(`/api/courses/${courseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, content: val }),
      });
      setSaving(false);
      setSaved(true);
    }, 800);
  }

  return (
    <div className="px-8 py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wide">My Notes</p>
        <span className="text-xs text-gray-400 dark:text-white/25">
          {saving ? "Saving…" : saved ? "Saved" : "Unsaved"}
        </span>
      </div>
      <textarea
        value={content}
        onChange={e => handleChange(e.target.value)}
        placeholder="Jot down your notes for this lesson…"
        className="w-full min-h-[320px] rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/3 px-5 py-4 text-sm text-gray-800 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#0822C0]/20 resize-none leading-relaxed"
      />
      <p className="text-xs text-gray-300 dark:text-white/20 mt-2">Notes auto-save as you type. Private to you.</p>
    </div>
  );
}

// ─── Quiz Tab ────────────────────────────────────────────────────────────────
interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correct: number;
}

function QuizTab({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setAnswers({});
    setResult(null);
    fetch(`/api/courses/${courseId}/quizzes`)
      .then(r => r.json())
      .then((quizzes: any[]) => {
        const quiz = quizzes.find(q => q.lesson_id === lessonId);
        setQuestions(quiz?.questions ?? []);
        setLoading(false);
      });
  }, [courseId, lessonId]);

  async function handleSubmit() {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitting(true);
    const res = await fetch(`/api/courses/${courseId}/quiz-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: lessonId, answers }),
    });
    const data = await res.json();
    setResult({ score: data.score, total: data.total, passed: data.passed });
    setSubmitting(false);
  }

  if (loading) return (
    <div className="px-8 py-10 space-y-4">
      {[1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />)}
    </div>
  );

  if (!questions.length) return (
    <div className="px-8 py-16 text-center text-sm text-gray-400 dark:text-white/30">No quiz for this lesson.</div>
  );

  if (result) return (
    <div className="px-8 py-12 max-w-2xl">
      <div className={`rounded-3xl border p-8 text-center ${result.passed ? "border-green-200 dark:border-green-400/20 bg-green-50 dark:bg-green-400/5" : "border-red-200 dark:border-red-400/20 bg-red-50 dark:bg-red-400/5"}`}>
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full mb-5 ${result.passed ? "bg-green-100 dark:bg-green-400/15" : "bg-red-100 dark:bg-red-400/15"}`}>
          <svg className={`h-8 w-8 ${result.passed ? "text-green-500" : "text-red-500"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {result.passed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
          </svg>
        </div>
        <p className={`text-2xl font-bold mb-1 ${result.passed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
          {result.score} / {result.total}
        </p>
        <p className={`text-sm font-semibold mb-2 ${result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {result.passed ? "You passed! 🎉" : "Not quite. Keep studying!"}
        </p>
        <p className="text-xs text-gray-400 dark:text-white/30 mb-6">
          {Math.round((result.score / result.total) * 100)}% score. 70% required to pass
        </p>
        <button
          onClick={() => { setResult(null); setAnswers({}); }}
          className="rounded-xl border border-gray-300 dark:border-white/15 text-sm font-medium px-5 py-2 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );

  return (
    <div className="px-8 py-6 max-w-3xl space-y-6">
      {questions.map((q, qi) => (
        <div key={qi} className="space-y-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white/85">
            <span className="text-gray-400 dark:text-white/30 font-normal mr-2">{qi + 1}.</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[String(qi)] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers(prev => ({ ...prev, [String(qi)]: oi }))}
                  className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                    selected
                      ? "border-[#0822C0] bg-[#0822C0]/5 dark:bg-[#0822C0]/15 text-[#0822C0] dark:text-blue-300 font-medium"
                      : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/3"
                  }`}
                >
                  <span className={`mr-3 font-medium ${selected ? "text-[#0822C0] dark:text-blue-300" : "text-gray-400 dark:text-white/25"}`}>
                    {["A", "B", "C", "D"][oi]}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={submitting || Object.keys(answers).length < questions.length}
        className="rounded-xl bg-[#0822C0] text-white text-sm font-semibold px-6 py-2.5 hover:bg-[#0a2fd4] transition-colors disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit answers"}
      </button>
      {Object.keys(answers).length < questions.length && (
        <p className="text-xs text-gray-400 dark:text-white/25">Answer all {questions.length} questions to submit.</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CoursePlayer({
  courseId,
  courseTitle,
  thumbnailUrl,
  curriculum,
  initialLessonId,
  completedLessonIds: initial,
  backHref = "/account/courses",
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const allLessons = curriculum.flatMap((s) => s.lessons ?? []);
  const [activeLessonId, setActiveLessonId] = useState(initialLessonId ?? allLessons[0]?.id ?? null);
  const [completed, setCompleted] = useState<Set<string>>(new Set(initial));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const activeLesson = allLessons.find((l) => l.id === activeLessonId) ?? null;

  function selectLesson(lessonId: string) {
    setActiveLessonId(lessonId);
    setActiveTab("overview");
    router.replace(`/learn/${courseId}?lesson=${lessonId}`, { scroll: false });
  }

  function toggleSection(sectionId: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
      return next;
    });
  }

  async function markComplete() {
    if (!activeLesson || completed.has(activeLesson.id)) return;
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("lesson_progress").upsert({
        user_id: user?.id,
        course_id: courseId,
        lesson_id: activeLesson.id,
        completed_at: new Date().toISOString(),
      });
      const newCompleted = new Set([...completed, activeLesson.id]);
      setCompleted(newCompleted);
      const idx = allLessons.findIndex((l) => l.id === activeLesson.id);
      const isLastLesson = idx === allLessons.length - 1;
      const allDone = allLessons.every(l => newCompleted.has(l.id));
      if (isLastLesson && allDone) {
        // Issue certificate
        await supabase.from("course_certificates").upsert({ user_id: user?.id, course_id: courseId });
        setShowCompletion(true);
      } else if (idx !== -1 && idx < allLessons.length - 1) {
        selectLesson(allLessons[idx + 1].id);
      }
    });
  }

  const totalLessons = allLessons.length;
  const doneCount = allLessons.filter((l) => completed.has(l.id)).length;
  const progress = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

  const idx = allLessons.findIndex((l) => l.id === activeLessonId);
  const prevLesson = idx > 0 ? allLessons[idx - 1] : null;
  const nextLesson = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  // Lesson position label e.g. "2.1"
  let lessonLabel = "";
  outer: for (let si = 0; si < curriculum.length; si++) {
    const sec = curriculum[si];
    for (let li = 0; li < (sec.lessons ?? []).length; li++) {
      if (sec.lessons[li].id === activeLessonId) {
        lessonLabel = `${si + 1}.${li + 1}`;
        break outer;
      }
    }
  }

  const [showCompletion, setShowCompletion] = useState(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "quiz", label: "Quiz" },
    { key: "notes", label: "Notes" },
    { key: "resources", label: "Resources" },
    { key: "announcements", label: "Announcements" },
    { key: "reviews", label: "Reviews" },
    { key: "support", label: "Q&A / Support" },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* ── Top bar ── */}
      <header className="flex items-center gap-3 h-16 px-6 border-b border-gray-100 bg-white shrink-0 z-10">
        <a
          href={backHref}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </a>
        <a href="/" className="shrink-0">
          <img src="/fwa-dark.svg" alt="Finance with Anne" className="h-6 w-auto" />
        </a>
        <div className="h-4 w-px bg-gray-200 shrink-0" />
        <span className="text-xs font-semibold text-gray-700 truncate flex-1">{courseTitle}</span>
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <div className="w-32 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-[#0822C0] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-gray-400">{doneCount}/{totalLessons}</span>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ── */}
        <aside
          className={`${sidebarOpen ? "w-[340px]" : "w-0"} shrink-0 border-r border-gray-100 bg-white flex flex-col transition-all duration-300 overflow-hidden`}
        >
          <div className="px-4 py-4 border-b border-gray-100 space-y-1 shrink-0">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Course</p>
            <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{courseTitle}</p>
            <div className="pt-1 space-y-1">
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#0822C0] transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[10px] text-gray-400">{doneCount}/{totalLessons} lessons · {progress}%</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {curriculum.map((section, si) => {
              const isCollapsed = collapsedSections.has(section.id);
              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {si + 1}. {section.title}
                    </span>
                    <svg className={`h-3.5 w-3.5 text-gray-400 transition-transform shrink-0 ${isCollapsed ? "-rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {!isCollapsed && (
                    <ul>
                      {(section.lessons ?? []).map((lesson, li) => {
                        const isActive = lesson.id === activeLessonId;
                        const isDone = completed.has(lesson.id);
                        return (
                          <li key={lesson.id}>
                            <button
                              onClick={() => selectLesson(lesson.id)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive ? "bg-[#0822C0]/5 text-[#0822C0]" : "hover:bg-gray-50 text-gray-700"}`}
                            >
                              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isDone ? "border-green-500 bg-green-500" : isActive ? "border-[#0822C0]" : "border-gray-200"}`}>
                                {isDone && (
                                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                {!isDone && isActive && <div className="h-1.5 w-1.5 rounded-full bg-[#0822C0]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-medium leading-snug block truncate">
                                  {si + 1}.{li + 1} {lesson.title}
                                </span>
                                {lesson.duration && (
                                  <span className="text-[10px] text-gray-400">{lesson.duration} min</span>
                                )}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Toggle sidebar + lesson title bar */}
          <div className="flex items-center gap-3 px-4 h-10 border-b border-gray-100 bg-white shrink-0">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              title="Toggle curriculum"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-xs font-semibold text-gray-600 truncate flex-1">
              {activeLesson?.title ?? courseTitle}
            </span>
            {/* Prev / Next in top bar */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => prevLesson && selectLesson(prevLesson.id)}
                disabled={!prevLesson}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors disabled:opacity-30"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => nextLesson && selectLesson(nextLesson.id)}
                disabled={!nextLesson}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors disabled:opacity-30"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable area: video + tabs */}
          <div className="flex-1 overflow-y-auto">
            {!activeLesson ? (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                Select a lesson to begin.
              </div>
            ) : (
              <>
                {/* ── Video area — edge to edge, black bg ── */}
                <div className="w-full bg-black shrink-0">
                  {activeLesson.video_url ? (() => {
                    const ytId = getYoutubeId(activeLesson.video_url);
                    const embedUrl = getEmbedUrl(activeLesson.video_url);
                    if (embedUrl) {
                      if (ytId) {
                        return <YoutubeEmbed embedUrl={embedUrl} videoId={ytId} lessonId={activeLesson.id} />;
                      }
                      return (
                        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                          <iframe
                            key={activeLesson.id}
                            src={embedUrl}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    if (isDirectVideo(activeLesson.video_url)) {
                      return <video key={activeLesson.id} src={activeLesson.video_url} controls className="w-full" style={{ maxHeight: "56.25vw" }} />;
                    }
                    return (
                      <div className="flex items-center justify-center py-8 text-white/60 text-sm">
                        <a href={activeLesson.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white hover:underline">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open video resource
                        </a>
                      </div>
                    );
                  })() : (
                    // No video — show a placeholder bar so the black area isn't huge
                    <div className="h-2" />
                  )}
                </div>

                {/* ── Tab bar ── */}
                <div className="flex border-b border-gray-100 bg-white px-6 shrink-0">
                  {tabs.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                        activeTab === t.key
                          ? "border-[#0822C0] text-[#0822C0]"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* ── Tab content ── */}
                <div className="min-h-screen">

                  {activeTab === "overview" && (
                    <div className="bg-white dark:bg-[#0D0F1C] min-h-full pl-6 pr-10 py-12">
                      <div className="max-w-5xl flex gap-10 items-start">

                        {/* LEFT: square image */}
                        <div className="w-64 shrink-0">
                          <div className="w-64 h-64 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#1a2040] flex items-center justify-center">
                            {thumbnailUrl ? (
                              <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <svg className="h-14 w-14 text-gray-300 dark:text-white/10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* RIGHT: all content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#0822C0] dark:text-[#5b7cff] uppercase tracking-widest mb-3">
                            Lesson {lessonLabel}
                          </p>
                          <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                            {activeLesson.title}
                          </h1>
                          {!!activeLesson.duration && (
                            <p className="text-sm text-gray-400 dark:text-white/40 mb-6">{activeLesson.duration} min read</p>
                          )}

                          <hr className="border-gray-200 dark:border-white/10 mb-8" />

                          {/* PDF download */}
                          {activeLesson.type === "pdf" && activeLesson.content && (
                            <a href={activeLesson.content} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 mb-8 hover:border-[#0822C0]/30 dark:hover:bg-white/10 transition-all group">
                              <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                                <svg className="h-4 w-4 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-white">{activeLesson.title}.pdf</p>
                                <p className="text-xs text-gray-400 dark:text-white/40">Click to download</p>
                              </div>
                              <svg className="h-4 w-4 text-gray-300 dark:text-white/20 group-hover:text-[#0822C0] dark:group-hover:text-white/60 transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          )}

                          {/* Body prose */}
                          {activeLesson.content && activeLesson.type !== "pdf" ? (
                            <div
                              className="prose prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:leading-relaxed prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-a:text-[#0822C0] dark:prose-a:text-[#7c9dff] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-[#0822C0]/30 dark:prose-blockquote:border-white/20 prose-img:rounded-xl prose-img:shadow-sm prose-code:text-[#0822C0] dark:prose-code:text-[#7c9dff] prose-code:bg-blue-50 dark:prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 dark:prose-pre:bg-black/40 prose-pre:rounded-xl"
                              dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                            />
                          ) : activeLesson.type !== "pdf" ? (
                            <p className="text-sm text-gray-400 dark:text-white/30 py-4">No notes for this lesson.</p>
                          ) : null}

                          {/* Mark complete / prev+next */}
                          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => prevLesson && selectLesson(prevLesson.id)} disabled={!prevLesson}
                                className="h-9 w-9 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30 transition-colors disabled:opacity-30">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                              </button>
                              <button onClick={() => nextLesson && selectLesson(nextLesson.id)} disabled={!nextLesson}
                                className="h-9 w-9 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30 transition-colors disabled:opacity-30">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                              </button>
                            </div>
                            {completed.has(activeLesson.id) ? (
                              <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-400/10 border border-green-100 dark:border-green-400/20 rounded-xl px-5 py-2.5">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                Completed
                              </span>
                            ) : (
                              <button onClick={markComplete} disabled={isPending}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#0822C0] text-white text-sm font-semibold px-6 py-2.5 hover:bg-[#0a2fd4] transition-colors disabled:opacity-50">
                                {isPending ? "Saving…" : "Mark as complete"}
                                {!isPending && <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {activeTab === "quiz" && activeLesson && <QuizTab courseId={courseId} lessonId={activeLesson.id} />}
                  {activeTab === "notes" && activeLesson && <NotesTab courseId={courseId} lessonId={activeLesson.id} />}
                  {activeTab === "resources" && <ResourcesTab courseId={courseId} />}
                  {activeTab === "announcements" && <AnnouncementsTab courseId={courseId} />}
                  {activeTab === "reviews" && <ReviewsTab courseId={courseId} />}
                  {activeTab === "support" && <SupportTab courseId={courseId} />}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Course completion modal ── */}
      {showCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCompletion(false)} />
          <div className="relative bg-white dark:bg-[#0D0F1C] rounded-3xl shadow-2xl max-w-md w-full p-10 text-center border border-gray-100 dark:border-white/10">
            {/* Confetti-style icon */}
            <div className="h-20 w-20 rounded-full bg-[#0822C0]/8 flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-[#0822C0]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course Complete!</h2>
            <p className="text-sm text-gray-500 dark:text-white/50 mb-8 leading-relaxed">
              You've finished <span className="font-semibold text-gray-800 dark:text-white">{courseTitle}</span>. Your certificate is ready.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={`/certificate/${courseId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0822C0] text-white font-semibold px-6 py-3 hover:bg-[#0a2fd4] transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                View Certificate
              </a>
              <button
                onClick={() => setShowCompletion(false)}
                className="rounded-2xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 font-medium px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
