"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme";

type Comment = {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  approved: boolean;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  blog_posts: { title: string; slug: string } | null;
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminCommentsClient({ initialComments }: { initialComments: Comment[] }) {
  const { dark } = useAdminTheme();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-500";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const inputCls = dark
    ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";

  const pending = comments.filter(c => !c.approved).length;
  const displayed = comments.filter(c =>
    filter === "all" ? true : filter === "pending" ? !c.approved : c.approved
  );

  async function approve(id: string, approved: boolean) {
    setSaving(id);
    const res = await fetch(`/api/blog-comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    if (res.ok) {
      setComments(prev => prev.map(c => c.id === id ? { ...c, approved } : c));
    }
    setSaving(null);
  }

  async function submitReply(id: string) {
    setSaving(id);
    const res = await fetch(`/api/blog-comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_reply: replyText }),
    });
    if (res.ok) {
      const updated = await res.json();
      setComments(prev => prev.map(c => c.id === id ? { ...c, admin_reply: updated.admin_reply, replied_at: updated.replied_at } : c));
      setReplyingId(null);
      setReplyText("");
    }
    setSaving(null);
  }

  async function deleteComment(id: string) {
    setSaving(id);
    await fetch(`/api/blog-comments/${id}`, { method: "DELETE" });
    setComments(prev => prev.filter(c => c.id !== id));
    setSaving(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Comments</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{comments.length} total · {pending} pending review</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {(["all", "pending", "approved"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? dark ? "bg-white text-[#111318]" : "bg-gray-900 text-white"
                : dark ? "text-white/40 hover:text-white/70 hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {f} {f === "pending" && pending > 0 && <span className="ml-1 font-bold text-amber-400">{pending}</span>}
          </button>
        ))}
      </div>

      {/* Comments list */}
      {displayed.length === 0 ? (
        <div className={`rounded-2xl border py-16 text-center text-sm ${card} ${sub}`}>
          No {filter === "all" ? "" : filter} comments yet.
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(comment => (
            <div key={comment.id} className={`rounded-2xl border overflow-hidden ${card}`}>
              {/* Header */}
              <div className={`flex items-start justify-between px-5 py-3.5 border-b ${divider}`}>
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold uppercase shrink-0 ${dark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-500"}`}>
                    {comment.author_name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${heading}`}>{comment.author_name}</p>
                      {comment.author_email && (
                        <p className={`text-xs ${sub}`}>{comment.author_email}</p>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${comment.approved ? dark ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
                        {comment.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={`text-xs ${sub}`}>{fmtDate(comment.created_at)}</p>
                      {comment.blog_posts && (
                        <>
                          <span className={`text-xs ${sub}`}>·</span>
                          <Link href={`/blog/${comment.blog_posts.slug}`} target="_blank"
                            className={`text-xs hover:underline ${dark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-600"}`}>
                            {comment.blog_posts.title}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!comment.approved ? (
                    <button
                      onClick={() => approve(comment.id, true)}
                      disabled={saving === comment.id}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${dark ? "bg-green-500/15 text-green-400 hover:bg-green-500/25" : "bg-green-50 text-green-600 hover:bg-green-100"} disabled:opacity-50`}
                    >
                      {saving === comment.id ? "…" : "Approve"}
                    </button>
                  ) : (
                    <button
                      onClick={() => approve(comment.id, false)}
                      disabled={saving === comment.id}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${dark ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:bg-gray-200"} disabled:opacity-50`}
                    >
                      Unapprove
                    </button>
                  )}
                  <button
                    onClick={() => { setReplyingId(replyingId === comment.id ? null : comment.id); setReplyText(comment.admin_reply ?? ""); }}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${dark ? "bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                  >
                    {comment.admin_reply ? "Edit reply" : "Reply"}
                  </button>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    disabled={saving === comment.id}
                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"} disabled:opacity-50`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Comment body */}
              <div className="px-5 py-4 space-y-3">
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${dark ? "text-white/70" : "text-gray-700"}`}>
                  {comment.content}
                </p>

                {/* Existing reply */}
                {comment.admin_reply && replyingId !== comment.id && (
                  <div className={`ml-4 pl-4 border-l-2 border-brand/40 rounded-r-lg py-2.5 pr-3 ${dark ? "bg-blue-500/5" : "bg-blue-50/50"}`}>
                    <p className={`text-xs font-semibold mb-1 ${dark ? "text-blue-400" : "text-brand"}`}>
                      Your reply · {comment.replied_at ? fmtDate(comment.replied_at) : ""}
                    </p>
                    <p className={`text-sm whitespace-pre-wrap ${dark ? "text-white/60" : "text-gray-600"}`}>{comment.admin_reply}</p>
                  </div>
                )}

                {/* Reply box */}
                {replyingId === comment.id && (
                  <div className="space-y-2">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={3}
                      placeholder="Write your reply…"
                      autoFocus
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none transition-colors resize-none ${inputCls}`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitReply(comment.id)}
                        disabled={saving === comment.id || !replyText.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand hover:bg-brand-hover transition-colors disabled:opacity-50"
                      >
                        {saving === comment.id ? "Saving…" : "Post Reply"}
                      </button>
                      {comment.admin_reply && (
                        <button
                          onClick={() => { setReplyText(""); submitReply(comment.id); }}
                          disabled={saving === comment.id}
                          className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${dark ? "border-white/10 text-white/40 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"} disabled:opacity-50`}
                        >
                          Remove Reply
                        </button>
                      )}
                      <button
                        onClick={() => { setReplyingId(null); setReplyText(""); }}
                        className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${dark ? "border-white/10 text-white/40 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
