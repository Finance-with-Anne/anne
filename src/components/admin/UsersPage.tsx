"use client";

import { useState, useMemo } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  enrollments: number;
  bookings: number;
};

type Filter = "all" | "student" | "editor" | "admin";

const ROLE_STYLE: Record<string, { dark: string; light: string; label: string }> = {
  admin:   { dark: "bg-purple-400/15 text-purple-300 border-purple-400/20",  light: "bg-purple-50 text-purple-700 border-purple-200",  label: "Admin" },
  editor:  { dark: "bg-blue-400/15 text-blue-300 border-blue-400/20",        light: "bg-blue-50 text-blue-700 border-blue-200",        label: "Editor" },
  student: { dark: "bg-green-400/15 text-green-300 border-green-400/20",     light: "bg-green-50 text-green-700 border-green-200",     label: "Student" },
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function timeAgo(d: string | null) {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
}

function initials(u: User) {
  const name = u.full_name ?? u.email;
  const parts = name.split(/[\s@]/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function UsersPage({ users }: { users: User[] }) {
  const { dark } = useAdminTheme();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);

  const card    = dark ? "bg-[#111318] border-white/6" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub     = dark ? "text-white/35" : "text-gray-400";
  const divider = dark ? "divide-white/5 border-white/5" : "divide-gray-100 border-gray-100";
  const rowHover = dark ? "hover:bg-white/3" : "hover:bg-gray-50";
  const inputCls = dark
    ? "bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-white/25"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";

  const counts = useMemo(() => ({
    all: users.length,
    student: users.filter(u => u.role === "student" || !ROLE_STYLE[u.role]).length,
    editor: users.filter(u => u.role === "editor").length,
    admin: users.filter(u => u.role === "admin").length,
  }), [users]);

  const filtered = useMemo(() => {
    let list = filter === "all" ? users : users.filter(u => u.role === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.email.toLowerCase().includes(q) ||
        (u.full_name ?? "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [users, filter, search]);

  const roleStyle = (role: string) => ROLE_STYLE[role] ?? ROLE_STYLE.student;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-lg font-bold ${heading}`}>All Users</h1>
          <p className={`text-xs mt-0.5 ${sub}`}>{users.length} total across all roles</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["all", "student", "editor", "admin"] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-xl border p-4 text-left transition-all ${card} ${filter === f ? dark ? "ring-1 ring-white/20" : "ring-1 ring-gray-300" : ""}`}>
            <p className={`text-2xl font-bold ${heading}`}>{counts[f]}</p>
            <p className={`text-xs mt-0.5 capitalize ${sub}`}>{f === "all" ? "Total Users" : `${f}s`}</p>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {/* Toolbar */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${divider}`}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${inputCls}`}
          />
          <div className={`flex rounded-lg border overflow-hidden text-xs font-medium ${dark ? "border-white/10" : "border-gray-200"}`}>
            {(["all", "student", "editor", "admin"] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 capitalize transition-colors ${filter === f ? dark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-900" : dark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-700"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className={`py-20 text-center text-sm ${sub}`}>No users found.</div>
        ) : (
          <div>
            {/* Header row */}
            <div className={`hidden sm:grid grid-cols-[1fr_100px_80px_80px_120px_100px] gap-4 px-5 py-2.5 border-b text-xs font-semibold uppercase tracking-widest ${sub} ${divider}`}>
              <span>User</span><span>Role</span><span className="text-center">Courses</span><span className="text-center">Bookings</span><span>Joined</span><span>Last seen</span>
            </div>
            {filtered.map(u => (
              <button key={u.id} onClick={() => setSelected(u)}
                className={`w-full text-left grid grid-cols-1 sm:grid-cols-[1fr_100px_80px_80px_120px_100px] gap-4 items-center px-5 py-3.5 border-b last:border-0 transition-colors ${divider} ${rowHover} ${selected?.id === u.id ? dark ? "bg-white/5" : "bg-blue-50/50" : ""}`}>
                {/* User */}
                <div className="flex items-center gap-3 min-w-0">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-white/10" />
                  ) : (
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${dark ? "bg-white/8 text-white/60" : "bg-gray-100 text-gray-600"}`}>
                      {initials(u)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${heading}`}>{u.full_name ?? u.email.split("@")[0]}</p>
                    <p className={`text-xs truncate ${sub}`}>{u.email}</p>
                  </div>
                </div>
                {/* Role */}
                <div>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${dark ? roleStyle(u.role).dark : roleStyle(u.role).light}`}>
                    {roleStyle(u.role).label}
                  </span>
                </div>
                {/* Courses */}
                <p className={`text-sm font-semibold text-center ${u.enrollments > 0 ? heading : sub}`}>{u.enrollments || "—"}</p>
                {/* Bookings */}
                <p className={`text-sm font-semibold text-center ${u.bookings > 0 ? heading : sub}`}>{u.bookings || "—"}</p>
                {/* Joined */}
                <p className={`text-xs ${sub}`}>{fmtDate(u.created_at)}</p>
                {/* Last seen */}
                <p className={`text-xs ${sub}`}>{timeAgo(u.last_sign_in_at)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Drawer overlay */}
      {selected && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full z-50 w-96 border-l shadow-2xl flex flex-col transition-transform duration-300 ease-out ${dark ? "bg-[#111318] border-white/8" : "bg-white border-gray-200"} ${selected ? "translate-x-0" : "translate-x-full"}`}>
        {selected && (
          <>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
              <p className={`text-sm font-bold ${heading}`}>User Profile</p>
              <button onClick={() => setSelected(null)}
                className={`h-7 w-7 rounded-lg flex items-center justify-center ${dark ? "text-white/30 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Profile */}
              <div className={`rounded-xl border p-4 ${dark ? "bg-white/3 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-start gap-4">
                  {selected.avatar_url ? (
                    <img src={selected.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10 shrink-0" />
                  ) : (
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${dark ? "bg-white/10 text-white/60" : "bg-gray-200 text-gray-600"}`}>
                      {initials(selected)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-base font-bold ${heading}`}>{selected.full_name ?? selected.email.split("@")[0]}</p>
                    <p className={`text-xs mt-0.5 truncate ${sub}`}>{selected.email}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${dark ? roleStyle(selected.role).dark : roleStyle(selected.role).light}`}>
                        {roleStyle(selected.role).label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-xl border p-3 text-center ${dark ? "bg-white/3 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                  <p className={`text-2xl font-bold ${heading}`}>{selected.enrollments}</p>
                  <p className={`text-[11px] mt-0.5 ${sub}`}>Courses enrolled</p>
                </div>
                <div className={`rounded-xl border p-3 text-center ${dark ? "bg-white/3 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                  <p className={`text-2xl font-bold ${heading}`}>{selected.bookings}</p>
                  <p className={`text-[11px] mt-0.5 ${sub}`}>Bookings made</p>
                </div>
              </div>

              {/* Details */}
              <div className={`rounded-xl border divide-y ${dark ? "border-white/5 divide-white/5" : "border-gray-100 divide-gray-100"}`}>
                {[
                  { label: "User ID", value: selected.id.slice(0, 8) + "…" },
                  { label: "Joined", value: fmtDate(selected.created_at) },
                  { label: "Last seen", value: timeAgo(selected.last_sign_in_at) },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between px-4 py-3">
                    <span className={`text-xs ${sub}`}>{r.label}</span>
                    <span className={`text-xs font-semibold ${heading}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
