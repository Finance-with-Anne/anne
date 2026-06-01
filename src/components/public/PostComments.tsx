"use client";

import { useState, useEffect } from "react";

type Comment = {
  id: string;
  author_name: string;
  content: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PostComments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/blog-comments?post_id=${postId}`)
      .then(r => r.json())
      .then(d => setComments(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true); setError("");
    const res = await fetch("/api/blog-comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, author_name: name, author_email: email, content }),
    });
    if (res.ok) {
      setSubmitted(true);
      setName(""); setEmail(""); setContent("");
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to submit.");
    }
    setSubmitting(false);
  }

  return (
    <div className="mt-12 pt-10 border-t border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? "s" : ""}` : "Comments"}
      </h2>

      {/* Comment list */}
      {comments.length > 0 && (
        <div className="space-y-6 mb-10">
          {comments.map(c => (
            <div key={c.id} className="flex gap-4">
              <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0 uppercase">
                {c.author_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">{c.author_name}</p>
                  <p className="text-xs text-gray-400">{fmtDate(c.created_at)}</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{c.content}</p>

                {/* Admin reply */}
                {c.admin_reply && (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-brand/30 bg-blue-50/50 rounded-r-lg py-2.5 pr-3">
                    <p className="text-xs font-semibold text-brand mb-1">Finance with Anne · {c.replied_at ? fmtDate(c.replied_at) : ""}</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{c.admin_reply}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Leave a Comment</h3>
        {submitted ? (
          <div className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            Thanks for your comment! It will appear after review.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email <span className="text-gray-400">(optional, not published)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Comment *</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                rows={4}
                placeholder="Share your thoughts…"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 resize-none"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2.5 transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Post Comment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
