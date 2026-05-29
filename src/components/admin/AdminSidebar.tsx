"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminTheme } from "@/lib/admin-theme";

const mainNav = [
  { label: "Dashboard", href: "/admin", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  { label: "Blog", href: "/admin/blog", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
  { label: "Products", href: "/admin/products", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> },
  { label: "Booking", href: "/admin/booking", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  { label: "Courses", href: "/admin/courses", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /> },
  { label: "Clients", href: "/admin/clients", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
];

const otherNav = [
  { label: "Community", href: "/admin/community", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /> },
  { label: "Email", href: "/admin/email", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  { label: "YouTube", href: "/admin/youtube", icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></> },
  { label: "Calculators", href: "/admin/calculators", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { dark } = useAdminTheme();
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const allNav = [...mainNav, ...otherNav];
  const filtered = search ? allNav.filter((i) => i.label.toLowerCase().includes(search.toLowerCase())) : null;

  const bg = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const searchBg = dark ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20 focus:border-white/20" : "bg-gray-100 border-gray-200 text-gray-700 placeholder-gray-400 focus:border-gray-300";
  const sectionLabel = dark ? "text-white/20" : "text-gray-400";
  const divider = dark ? "border-white/5" : "border-gray-200";

  return (
    <aside className={`flex h-full flex-col border-r transition-all duration-300 ${bg} ${collapsed ? "w-14" : "w-64"}`}>
      {/* Header */}
      <div className={`flex h-14 items-center justify-between px-4 border-b ${divider}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <img src="/fwa-light.svg" alt="FWA" className="h-7 w-7" />
            <span className={`text-sm font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>Finance with Anne</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`ml-auto rounded-md p-1.5 transition-colors ${dark ? "text-white/30 hover:text-white/70 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto py-3 px-2 gap-0.5">
        {/* Search */}
        {!collapsed && (
          <div className="relative mb-2 px-1">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${dark ? "text-white/30" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-lg border pl-8 pr-8 py-2 text-xs focus:outline-none transition-colors ${searchBg}`}
            />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono ${dark ? "text-white/20" : "text-gray-400"}`}>⌘K</span>
          </div>
        )}

        {(filtered ?? mainNav).map((item) => !filtered || filtered.includes(item) ? (
          <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} dark={dark} />
        ) : null)}

        {!filtered && (
          <>
            <div className={`my-2 border-t mx-1 ${divider}`} />
            {!collapsed && <p className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${sectionLabel}`}>Other</p>}
            {otherNav.map((item) => (
              <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} dark={dark} />
            ))}
          </>
        )}

        {filtered?.length === 0 && (
          <p className={`px-3 py-4 text-xs text-center ${dark ? "text-white/30" : "text-gray-400"}`}>No results</p>
        )}
      </div>

      {/* Bottom */}
      <div className={`border-t p-2 space-y-1 ${divider}`}>
        <Link
          href="/"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors ${dark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {!collapsed && <span>View Site</span>}
        </Link>

        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors group ${dark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}
        >
          <img src="/anne-profile.png" alt="Admin" className="h-7 w-7 rounded-full object-cover shrink-0 ring-1 ring-white/10" />
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className={`text-xs font-medium truncate ${dark ? "text-white/80" : "text-gray-800"}`}>Finance with Anne</p>
              <p className={`text-[10px] truncate ${dark ? "text-white/30" : "text-gray-400"}`}>webtech.fwa@gmail.com</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

function NavItem({ item, active, collapsed, dark }: { item: (typeof mainNav)[0]; active: boolean; collapsed: boolean; dark: boolean }) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
        active
          ? dark ? "text-white" : "text-brand"
          : dark ? "text-white/40 hover:text-white/70 hover:bg-white/5" : "text-gray-400 hover:text-brand hover:bg-brand/5"
      }`}
    >
      {active && (
        <span className={`absolute inset-0 rounded-lg ${
          dark
            ? "bg-gradient-to-r from-blue-600/30 to-brand/40 border border-white/10"
            : "bg-gradient-to-r from-blue-100/80 to-brand/10 border border-brand/20"
        }`} />
      )}
      <span className={`relative shrink-0 ${active ? dark ? "text-blue-400" : "text-brand" : ""}`}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          {item.icon}
        </svg>
      </span>
      {!collapsed && <span className="relative text-xs font-medium">{item.label}</span>}
    </Link>
  );
}
