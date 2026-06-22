"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const nav = [
  {
    label: "My Courses",
    href: "/account",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />,
  },
  {
    label: "Profile",
    href: "/account/profile",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  },
];

export default function AccountSidebar({
  userName,
  userEmail,
  userAvatar,
}: {
  userName: string;
  userEmail: string;
  userAvatar: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  function isActive(href: string) {
    return href === "/account" ? pathname === "/account" : pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-100">
        <img src="/fwa-dark.svg" alt="Finance with Anne" className="h-7 w-auto" />
        <span className="text-xs font-semibold text-gray-700 truncate">Student Portal</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                active
                  ? "text-[#0822C0]"
                  : "text-gray-400 hover:text-[#0822C0] hover:bg-[#0822C0]/5"
              }`}
            >
              {active && (
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-50 to-[#0822C0]/10 border border-[#0822C0]/20" />
              )}
              <svg className="relative h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                {item.icon}
              </svg>
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-2 border-t border-gray-100 mt-2">
          <Link
            href="/courses"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 hover:text-[#0822C0] hover:bg-[#0822C0]/5 transition-all"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Browse Courses
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5 mb-2">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="h-8 w-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[#0822C0]/10 text-[#0822C0] flex items-center justify-center text-xs font-bold shrink-0">
              {userName[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{userName}</p>
            <p className="text-[10px] text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
