"use client";

import { useState, useEffect, useRef } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

type Message = { id: string; course_id: string; user_id: string; message: string; is_admin: boolean; created_at: string };
type Thread = {
  key: string; courseId: string; userId: string;
  course: { id: string; title: string; thumbnail_url: string | null } | null;
  profile: { id: string; full_name: string | null; avatar_url: string | null } | null;
  email: string;
  lastMessage: string; lastTime: string;
  hasAdminReply: boolean; totalMessages: number;
  messages: Message[];
};

type Booking = {
  id: string; client_name: string; client_email: string; service: string;
  date: string; time: string; status: string; created_at: string;
  answers: Record<string, string> | null;
  questions: { id: string; question: string }[];
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Avatar({ name, url, size = 9 }: { name: string; url?: string | null; size?: number }) {
  const cls = `h-${size} w-${size} rounded-full object-cover`;
  if (url) return <img src={url} className={cls} alt={name} />;
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className={`h-${size} w-${size} rounded-full bg-[#0822C0]/10 flex items-center justify-center text-xs font-bold text-[#0822C0] shrink-0`}>
      {initials}
    </div>
  );
}

export default function ChatsPage({ bookings }: { bookings: Booking[] }) {
  const { dark } = useAdminTheme();
  const [tab, setTab] = useState<"courses" | "bookings">("courses");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/admin/chats")
      .then(r => r.json())
      .then(d => { setThreads(d.threads ?? []); setLoading(false); });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread]);

  async function sendReply() {
    if (!selectedThread || !replyText.trim() || sending) return;
    setSending(true);
    const msg = replyText.trim();
    setReplyText("");
    await fetch(`/api/courses/${selectedThread.courseId}/support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, is_admin: true, user_id: selectedThread.userId }),
    });
    // Refresh threads
    const d = await fetch("/api/admin/chats").then(r => r.json());
    const updated = (d.threads ?? []) as Thread[];
    setThreads(updated);
    const refreshed = updated.find(t => t.key === selectedThread.key) ?? null;
    setSelectedThread(refreshed);
    setSending(false);
  }

  const bg = dark ? "bg-[#0d0f14]" : "bg-gray-50";
  const panel = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const rowHover = dark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50";
  const inputBg = dark ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20" : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400";

  const filteredThreads = threads.filter(t => {
    if (!search) return true;
    const name = t.profile?.full_name ?? "";
    return name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.course?.title?.toLowerCase().includes(search.toLowerCase());
  });

  const filteredBookings = bookings.filter(b => {
    if (!search) return true;
    return b.client_name.toLowerCase().includes(search.toLowerCase()) ||
      b.client_email.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase());
  }).filter(b => b.answers && Object.keys(b.answers).length > 0);

  const tabActive = (t: boolean) =>
    t ? `border-b-2 border-[#0822C0] text-[#0822C0]` : `border-b-2 border-transparent ${sub} hover:${heading}`;

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] min-h-0 rounded-2xl border overflow-hidden ${panel}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${divider}`}>
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Chats</h1>
          <p className={`text-xs mt-0.5 ${sub}`}>Course Q&A threads · Booking messages</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* ── Left: thread list ── */}
        <div className={`w-80 shrink-0 flex flex-col border-r ${divider}`}>
          {/* Tabs */}
          <div className={`flex border-b shrink-0 ${divider}`}>
            <button onClick={() => { setTab("courses"); setSelectedThread(null); setSelectedBooking(null); }}
              className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${tabActive(tab === "courses")}`}>
              Course Q&amp;A
              {threads.length > 0 && <span className="ml-1.5 text-[10px] bg-[#0822C0]/10 text-[#0822C0] rounded-full px-1.5 py-0.5">{threads.length}</span>}
            </button>
            <button onClick={() => { setTab("bookings"); setSelectedThread(null); setSelectedBooking(null); }}
              className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${tabActive(tab === "bookings")}`}>
              Bookings
              {filteredBookings.length > 0 && <span className="ml-1.5 text-[10px] bg-[#0822C0]/10 text-[#0822C0] rounded-full px-1.5 py-0.5">{filteredBookings.length}</span>}
            </button>
          </div>

          {/* Search */}
          <div className={`px-3 py-2.5 border-b shrink-0 ${divider}`}>
            <div className="relative">
              <svg className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${sub}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                className={`w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs focus:outline-none ${inputBg}`} />
            </div>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto">
            {tab === "courses" && (
              loading ? (
                <div className="space-y-0">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`flex gap-3 px-4 py-3 border-b ${divider}`}>
                      <div className="animate-pulse h-9 w-9 rounded-full bg-gray-200 dark:bg-white/5 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="animate-pulse h-3 bg-gray-200 dark:bg-white/5 rounded w-24" />
                        <div className="animate-pulse h-2.5 bg-gray-100 dark:bg-white/[0.03] rounded w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className={`flex flex-col items-center justify-center py-16 gap-2 ${sub}`}>
                  <svg className="h-8 w-8 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-xs">No threads yet</p>
                </div>
              ) : filteredThreads.map(t => {
                const name = t.profile?.full_name ?? t.email.split("@")[0];
                const isSelected = selectedThread?.key === t.key;
                return (
                  <button key={t.key} onClick={() => setSelectedThread(t)}
                    className={`w-full flex gap-3 px-4 py-3 border-b text-left transition-colors ${divider} ${isSelected ? dark ? "bg-white/[0.06]" : "bg-[#0822C0]/5" : rowHover}`}>
                    <div className="shrink-0 mt-0.5">
                      <Avatar name={name} url={t.profile?.avatar_url} size={9} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-semibold truncate ${dark ? "text-white/80" : "text-gray-800"}`}>{name}</p>
                        <span className={`text-[10px] shrink-0 ${sub}`}>{timeAgo(t.lastTime)}</span>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${sub}`}>{t.course?.title ?? "Unknown course"}</p>
                      <p className={`text-xs truncate mt-1 ${dark ? "text-white/40" : "text-gray-500"}`}>{t.lastMessage}</p>
                      {!t.hasAdminReply && (
                        <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wide bg-amber-500/15 text-amber-500 rounded-full px-2 py-0.5">Needs reply</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}

            {tab === "bookings" && (
              filteredBookings.length === 0 ? (
                <div className={`flex flex-col items-center justify-center py-16 gap-2 ${sub}`}>
                  <svg className="h-8 w-8 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs">No booking messages</p>
                </div>
              ) : filteredBookings.map(b => {
                const isSelected = selectedBooking?.id === b.id;
                const firstAnswer = b.answers ? Object.values(b.answers)[0] : null;
                return (
                  <button key={b.id} onClick={() => setSelectedBooking(b)}
                    className={`w-full flex gap-3 px-4 py-3 border-b text-left transition-colors ${divider} ${isSelected ? dark ? "bg-white/[0.06]" : "bg-[#0822C0]/5" : rowHover}`}>
                    <div className="h-9 w-9 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-purple-500">
                      {b.client_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-semibold truncate ${dark ? "text-white/80" : "text-gray-800"}`}>{b.client_name}</p>
                        <span className={`text-[10px] shrink-0 ${sub}`}>{timeAgo(b.created_at)}</span>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${sub}`}>{b.service}</p>
                      {firstAnswer && <p className={`text-xs truncate mt-1 ${dark ? "text-white/40" : "text-gray-500"}`}>{firstAnswer}</p>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: conversation ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {!selectedThread && !selectedBooking ? (
            <div className={`flex flex-col items-center justify-center h-full gap-4 ${sub}`}>
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                <svg className="h-8 w-8 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs text-center max-w-xs">Choose a thread from the left to view and reply to messages.</p>
            </div>
          ) : selectedThread ? (
            <CourseThread thread={selectedThread} dark={dark} onReply={sendReply} replyText={replyText} setReplyText={setReplyText} sending={sending} textareaRef={textareaRef} bottomRef={bottomRef} sub={sub} divider={divider} heading={heading} />
          ) : selectedBooking ? (
            <BookingThread booking={selectedBooking} dark={dark} sub={sub} divider={divider} heading={heading} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Course thread view ──────────────────────────────────────────────────────
function CourseThread({ thread, dark, onReply, replyText, setReplyText, sending, textareaRef, bottomRef, sub, divider, heading }: {
  thread: Thread; dark: boolean; onReply: () => void;
  replyText: string; setReplyText: (v: string) => void; sending: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  sub: string; divider: string; heading: string;
}) {
  const name = thread.profile?.full_name ?? thread.email.split("@")[0];
  return (
    <>
      {/* Thread header */}
      <div className={`flex items-center gap-3 px-6 py-4 border-b shrink-0 ${divider}`}>
        <div className="h-9 w-9 rounded-full bg-[#0822C0]/10 flex items-center justify-center shrink-0 text-sm font-bold text-[#0822C0]">
          {name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${heading}`}>{name}</p>
          <p className={`text-xs truncate ${sub}`}>{thread.email} · {thread.course?.title}</p>
        </div>
        <a href={`/admin/courses/students`} className={`text-xs ${sub} hover:${heading} transition-colors`}>View student →</a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {thread.messages.map(m => (
          <div key={m.id} className={`flex items-end gap-2 ${m.is_admin ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mb-0.5 text-[10px] font-bold ${m.is_admin ? "bg-[#0822C0] text-white" : dark ? "bg-white/10 text-white/50" : "bg-gray-100 text-gray-500"}`}>
              {m.is_admin ? "A" : name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div className={`flex flex-col gap-0.5 max-w-[65%] ${m.is_admin ? "items-end" : "items-start"}`}>
              {m.is_admin && <span className={`text-[10px] font-medium px-1 ${sub}`}>You (Admin)</span>}
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.is_admin ? "bg-[#0822C0] text-white rounded-br-sm" : dark ? "bg-white/8 text-white/80 rounded-bl-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}>
                {m.message}
              </div>
              <span className={`text-[10px] px-1 ${sub}`}>{timeAgo(m.created_at)}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      <div className={`px-6 py-4 border-t shrink-0 ${divider}`}>
        <div className={`flex items-end gap-2 rounded-2xl border px-4 py-3 transition-all focus-within:border-[#0822C0]/40 focus-within:ring-2 focus-within:ring-[#0822C0]/10 ${dark ? "bg-white/[0.03] border-white/5" : "bg-white border-gray-200"}`}>
          <textarea
            ref={textareaRef}
            value={replyText}
            onChange={e => {
              setReplyText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onReply(); } }}
            placeholder="Reply to this student…"
            rows={1}
            className={`flex-1 resize-none bg-transparent text-sm focus:outline-none leading-relaxed ${dark ? "text-white/80 placeholder-white/20" : "text-gray-700 placeholder-gray-300"}`}
            style={{ minHeight: 24, maxHeight: 100 }}
          />
          <button onClick={onReply} disabled={!replyText.trim() || sending}
            className="rounded-xl bg-[#0822C0] text-white p-2 hover:bg-[#061aa0] transition-colors disabled:opacity-30 shrink-0">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className={`text-[10px] mt-1.5 ${sub}`}>Enter to send · Shift+Enter for new line</p>
      </div>
    </>
  );
}

// ── Booking thread view ─────────────────────────────────────────────────────
function BookingThread({ booking, dark, sub, divider, heading }: { booking: Booking; dark: boolean; sub: string; divider: string; heading: string }) {
  const statusColor: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500",
    confirmed: "bg-blue-500/10 text-blue-500",
    completed: "bg-green-500/10 text-green-500",
    cancelled: "bg-red-500/10 text-red-500",
  };

  return (
    <>
      <div className={`flex items-center gap-3 px-6 py-4 border-b shrink-0 ${divider}`}>
        <div className="h-9 w-9 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 text-sm font-bold text-purple-500">
          {booking.client_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${heading}`}>{booking.client_name}</p>
          <p className={`text-xs ${sub}`}>{booking.client_email}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor[booking.status] ?? "bg-gray-100 text-gray-500"}`}>
          {booking.status}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className={`rounded-xl border p-4 mb-5 ${dark ? "border-white/5 bg-white/[0.03]" : "border-gray-100 bg-gray-50"}`}>
          <p className={`text-xs font-semibold mb-1 ${sub}`}>Booking Details</p>
          <p className={`text-sm font-medium ${heading}`}>{booking.service}</p>
          <p className={`text-xs mt-0.5 ${sub}`}>{new Date(booking.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} at {booking.time}</p>
        </div>

        {booking.answers && Object.keys(booking.answers).length > 0 && (
          <div className="space-y-4">
            <p className={`text-xs font-semibold uppercase tracking-widest ${sub}`}>Client Responses</p>
            {booking.questions.map((q, i) => {
              const answer = booking.answers?.[q.id] ?? booking.answers?.[String(i)] ?? null;
              if (!answer) return null;
              return (
                <div key={q.id} className={`rounded-xl border p-4 ${dark ? "border-white/5 bg-white/[0.02]" : "border-gray-100"}`}>
                  <p className={`text-xs font-medium mb-1.5 ${sub}`}>{q.question}</p>
                  <p className={`text-sm leading-relaxed ${dark ? "text-white/80" : "text-gray-700"}`}>{answer}</p>
                </div>
              );
            })}
            {/* Fallback: show raw answers if question mapping fails */}
            {booking.questions.length === 0 && Object.entries(booking.answers).map(([k, v]) => (
              <div key={k} className={`rounded-xl border p-4 ${dark ? "border-white/5 bg-white/[0.02]" : "border-gray-100"}`}>
                <p className={`text-xs font-medium mb-1.5 ${sub}`}>{k}</p>
                <p className={`text-sm leading-relaxed ${dark ? "text-white/80" : "text-gray-700"}`}>{v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
