"use client";

import { useEffect, useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

type SupportMsg = {
  id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
  email?: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Initials({ name, dark }: { name: string; dark: boolean }) {
  const i = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${dark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-600"}`}>
      {i}
    </div>
  );
}

export default function CourseSupportTab({ courseId }: { courseId: string }) {
  const { dark } = useAdminTheme();
  const [messages, setMessages] = useState<SupportMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/35" : "text-gray-400";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const inputBg = dark
    ? "bg-white/5 border-white/8 text-white/80 placeholder-white/20"
    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400";

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/courses/${courseId}/support`, { headers: { "x-admin": "1" } });
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [courseId]);

  // Get unique students
  const studentMap: Record<string, { name: string; email: string; avatar: string | null; lastMsg: string }> = {};
  for (const m of messages) {
    if (!m.is_admin && !studentMap[m.user_id]) {
      studentMap[m.user_id] = {
        name: m.profile?.full_name ?? "Unknown",
        email: m.email ?? "",
        avatar: m.profile?.avatar_url ?? null,
        lastMsg: m.created_at,
      };
    }
  }
  const students = Object.entries(studentMap).sort((a, b) =>
    new Date(b[1].lastMsg).getTime() - new Date(a[1].lastMsg).getTime()
  );

  const thread = selectedUserId ? messages.filter(m => m.user_id === selectedUserId) : [];
  const selectedStudent = selectedUserId ? studentMap[selectedUserId] : null;

  async function handleReply() {
    if (!reply.trim() || !selectedUserId) return;
    setSending(true);
    await fetch(`/api/courses/${courseId}/support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply.trim(), is_admin: true, user_id: selectedUserId }),
    });
    setReply("");
    setSending(false);
    load();
  }

  if (loading) return <div className={`rounded-2xl border py-16 text-center text-sm ${card} ${tSub}`}>Loading…</div>;

  if (students.length === 0) {
    return (
      <div className={`rounded-2xl border py-16 text-center text-sm ${card} ${tSub}`}>
        No support messages yet. Students can send messages from the course player.
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${card}`} style={{ height: "520px", display: "flex" }}>
      {/* Student list */}
      <div className={`w-64 shrink-0 flex flex-col border-r ${divider}`}>
        <div className={`px-4 py-3 border-b ${divider}`}>
          <p className={`text-xs font-semibold ${tSub}`}>{students.length} student{students.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {students.map(([uid, s]) => (
            <button
              key={uid}
              onClick={() => setSelectedUserId(uid)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-left border-b last:border-b-0 transition-colors ${divider} ${
                selectedUserId === uid
                  ? dark ? "bg-white/6" : "bg-brand/5"
                  : dark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"
              }`}
            >
              <Initials name={s.name} dark={dark} />
              <div className="min-w-0">
                <p className={`text-xs font-medium truncate ${tText}`}>{s.name}</p>
                <p className={`text-[10px] truncate ${tSub}`}>{s.email || timeAgo(s.lastMsg)}</p>
              </div>
              {selectedUserId === uid && (
                <div className={`ml-auto h-1.5 w-1.5 rounded-full shrink-0 ${dark ? "bg-blue-400" : "bg-brand"}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      {selectedUserId ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread header */}
          <div className={`flex items-center gap-2 px-4 py-3 border-b ${divider}`}>
            <Initials name={selectedStudent?.name ?? ""} dark={dark} />
            <div>
              <p className={`text-sm font-semibold ${tText}`}>{selectedStudent?.name}</p>
              <p className={`text-xs ${tSub}`}>{selectedStudent?.email}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {thread.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.is_admin ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  m.is_admin
                    ? dark ? "bg-brand/20 text-blue-400" : "bg-brand/10 text-brand"
                    : dark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-600"
                }`}>
                  {m.is_admin ? "A" : (selectedStudent?.name?.[0] ?? "S")}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                  m.is_admin
                    ? dark ? "bg-brand/20 text-blue-100 rounded-tr-sm" : "bg-brand text-white rounded-tr-sm"
                    : dark ? "bg-white/6 text-white/80 rounded-tl-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}>
                  <p className="text-xs leading-relaxed">{m.message}</p>
                  <p className={`text-[10px] mt-1 ${m.is_admin ? "text-right opacity-60" : dark ? "text-white/30" : "text-gray-400"}`}>
                    {timeAgo(m.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <div className={`flex items-end gap-2 px-4 py-3 border-t ${divider}`}>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Reply to student…"
              rows={2}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
              className={`flex-1 resize-none rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand/30 ${inputBg}`}
            />
            <button
              onClick={handleReply}
              disabled={sending || !reply.trim()}
              className="shrink-0 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center text-sm ${tSub}`}>
          Select a student to view their messages
        </div>
      )}
    </div>
  );
}
