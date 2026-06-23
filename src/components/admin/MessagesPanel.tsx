"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type Booking = {
  id: string;
  client_name: string;
  client_email: string;
  service: string | null;
  date: string | null;
  time: string | null;
  status: string | null;
  answers: Record<string, string> | null;
  created_at: string;
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

function Initials({ name, dark }: { name: string; dark: boolean }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${dark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-600"}`}>
      {initials}
    </div>
  );
}

function previewText(booking: Booking) {
  if (booking.answers) {
    const vals = Object.values(booking.answers).filter(Boolean);
    if (vals.length > 0) return vals[0].slice(0, 60);
  }
  return booking.service ?? "Booking inquiry";
}

export default function MessagesPanel({
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
  const [items, setItems] = useState<Booking[]>([]);
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
    fetch("/api/admin/messages")
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

  const unreadCount = items.filter(i => new Date(i.created_at).getTime() > lastSeen).length;

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
      className={`absolute right-16 top-full mt-2 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${bg} ${dark ? "shadow-black/30" : ""}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${divider}`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${hdr}`}>Messages</span>
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-400 px-1 text-[10px] font-bold text-white">
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 ${divider}`}>
                <div className={`h-9 w-9 rounded-full shrink-0 animate-pulse ${dark ? "bg-white/8" : "bg-gray-100"}`} />
                <div className="flex-1 space-y-1.5 pt-1">
                  <div className={`h-3 w-2/3 rounded animate-pulse ${dark ? "bg-white/8" : "bg-gray-100"}`} />
                  <div className={`h-2.5 w-3/4 rounded animate-pulse ${dark ? "bg-white/5" : "bg-gray-100"}`} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className={`px-4 py-10 text-center text-sm ${sub}`}>No messages yet</p>
        ) : (
          items.map(item => {
            const isUnread = new Date(item.created_at).getTime() > lastSeen;
            const preview = previewText(item);
            return (
              <Link
                key={item.id}
                href={`/admin/bookings?id=${item.id}`}
                onClick={onClose}
                className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 transition-colors ${hover} ${divider} ${isUnread ? dark ? "bg-white/[0.02]" : "bg-blue-50/40" : ""}`}
              >
                <Initials name={item.client_name} dark={dark} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`text-xs font-semibold truncate ${itemTitle}`}>{item.client_name}</p>
                    <span className={`text-[10px] shrink-0 ${sub}`}>{timeAgo(item.created_at)}</span>
                  </div>
                  <p className={`text-xs font-medium mt-0.5 truncate ${dark ? "text-white/50" : "text-gray-600"}`}>{item.service ?? "Booking"}</p>
                  <p className={`text-xs mt-0.5 truncate ${sub}`}>{preview}</p>
                </div>
                {isUnread && <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />}
              </Link>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className={`border-t px-4 py-2.5 ${divider}`}>
        <Link
          href="/admin/bookings"
          onClick={onClose}
          className={`block text-center text-xs font-medium ${dark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-700"}`}
        >
          View all bookings
        </Link>
      </div>
    </div>
  );
}
