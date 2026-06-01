"use client";

import { useState, useEffect, useRef } from "react";

function getFingerprint(): string {
  const key = "fwa_fp";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem(key, fp);
  }
  return fp;
}

export default function PostLike({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fp = useRef<string>("");

  useEffect(() => {
    fp.current = getFingerprint();
    fetch(`/api/blog-likes?post_id=${postId}&fingerprint=${fp.current}`)
      .then(r => r.json())
      .then(d => { setLiked(d.liked); setCount(d.count); })
      .catch(() => {});
  }, [postId]);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const prev = { liked, count };
    setLiked(!liked);
    setCount(c => liked ? c - 1 : c + 1);
    try {
      const res = await fetch("/api/blog-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, fingerprint: fp.current }),
      });
      const d = await res.json();
      setLiked(d.liked);
      setCount(d.count);
    } catch {
      setLiked(prev.liked);
      setCount(prev.count);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        liked
          ? "bg-red-50 border-red-200 text-red-500"
          : "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400"
      }`}
    >
      <svg
        className={`h-4 w-4 transition-transform ${liked ? "scale-110" : ""}`}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {count > 0 ? count : ""} {liked ? "Liked" : "Like"}
    </button>
  );
}
