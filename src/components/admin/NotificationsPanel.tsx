"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type NotifItem = {
  id: string;
  type: "booking" | "enrollment" | "subscriber";
  title: string;
  description: string;
  time: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const TypeIcon = ({ type }: { type: NotifItem["type"] }) => {
  if (type === "booking")
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-400/15">
        <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  if (type === "enrollment")
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-400/15">
        <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
    );
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-400/15">
      <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
  );
};

export default function NotificationsPanel({
  dark,
  open,
  onClose,
  lastSeenKey,
}: {
  dark: boolean;
  open: boolean;
  onClose: () => void;
  lastSeenKey: string;
}) {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSeen, setLastSeen] = useState<number>(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(lastSeenKey);
    setLastSeen(stored ? parseInt(stored) : 0);
  }, [lastSeenKey]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/admin/notifications")
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  function markAllRead() {
    const now = Date.now();
    localStorage.setItem(lastSeenKey, String(now));
    setLastSeen(now);
  }

  const unreadCount = items.filter(i => new Date(i.time).getTime() > lastSeen).length;

  const bg = dark ? "bg-[#111318] border-white/8" : "bg-white border-gray-200";
  const hdr = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/35" : "text-gray-400";
  const itemTitle = dark ? "text-white/80" : "text-gray-800";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const hover = dark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50";

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className={`absolute right-10 top-full mt-2 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${bg} ${dark ? "shadow-black/30" : ""}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${divider}`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${hdr}`}>Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-400 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className={`text-xs font-medium ${dark ? "text-blue-400 hover:text-blue-300" : "text-brand hover:text-brand-hover"}`}>
            Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[360px] overflow-y-auto">
        {loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 ${divider}`}>
                <div className={`h-8 w-8 rounded-full shrink-0 animate-pulse ${dark ? "bg-white/8" : "bg-gray-100"}`} />
                <div className="flex-1 space-y-1.5 pt-0.5">
                  <div className={`h-3 w-3/4 rounded animate-pulse ${dark ? "bg-white/8" : "bg-gray-100"}`} />
                  <div className={`h-2.5 w-1/2 rounded animate-pulse ${dark ? "bg-white/5" : "bg-gray-100"}`} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className={`px-4 py-10 text-center text-sm ${sub}`}>No notifications yet</p>
        ) : (
          items.map(item => {
            const isUnread = new Date(item.time).getTime() > lastSeen;
            return (
              <div key={item.id} className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 transition-colors ${hover} ${divider} ${isUnread ? dark ? "bg-white/[0.02]" : "bg-blue-50/40" : ""}`}>
                <TypeIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-snug truncate ${itemTitle}`}>{item.title}</p>
                  <p className={`text-xs truncate mt-0.5 ${sub}`}>{item.description}</p>
                  <p className={`text-[10px] mt-1 ${sub}`}>{timeAgo(item.time)}</p>
                </div>
                {isUnread && <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className={`border-t px-4 py-2.5 ${divider}`}>
        <Link
          href="/admin/activity"
          onClick={onClose}
          className={`block text-center text-xs font-medium ${dark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-700"}`}
        >
          View all activity
        </Link>
      </div>
    </div>
  );
}
