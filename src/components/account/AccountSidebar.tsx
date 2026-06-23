"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  {
    label: "Dashboard",
    href: "/account",
    exact: true,
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    label: "My Courses",
    href: "/account/courses",
    exact: false,
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />,
  },
  {
    label: "Bookings",
    href: "/account/bookings",
    exact: false,
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    children: [
      { label: "My Bookings", href: "/account/bookings", exact: true },
      { label: "Book a Session", href: "/account/bookings/book" },
    ],
  },
  {
    label: "Files",
    href: "/account/files",
    exact: false,
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
  },
  {
    label: "Profile",
    href: "/account/profile",
    exact: false,
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  },
];

export default function AccountSidebar({
  userName,
  userEmail,
  userAvatar,
  mobileOpen,
  setMobileOpen,
}: {
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const NavLinks = () => (
    <>
      {nav.map((item) => {
        const active = isActive(item.href, item.exact);
        const sectionActive = pathname.startsWith(item.href) && item.href !== "/account";
        const hasChildren = item.children && item.children.length > 0;
        const showChildren = hasChildren && sectionActive;

        return (
          <div key={item.href}>
            <Link
              href={hasChildren ? (item.children![0].href) : item.href}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                active && !hasChildren
                  ? "text-[#0822C0] dark:text-blue-400"
                  : sectionActive && hasChildren
                  ? "text-[#0822C0] dark:text-blue-400"
                  : "text-gray-400 dark:text-white/50 hover:text-[#0822C0] dark:hover:text-blue-400 hover:bg-[#0822C0]/5 dark:hover:bg-[#0822C0]/15"
              }`}
            >
              {(active || (sectionActive && hasChildren)) && (
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-50 to-[#0822C0]/10 dark:from-[#0822C0]/25 dark:to-transparent border border-[#0822C0]/20 dark:border-[#0822C0]/40" />
              )}
              <svg className="relative h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                {item.icon}
              </svg>
              <span className="relative">{item.label}</span>
            </Link>

            {/* Submenu */}
            {showChildren && (
              <div className="ml-7 mt-0.5 space-y-0.5">
                {item.children!.map((child) => {
                  const childActive = child.exact ? pathname === child.href : pathname.startsWith(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-all ${
                        childActive
                          ? "text-[#0822C0] dark:text-blue-400 font-semibold bg-[#0822C0]/5 dark:bg-[#0822C0]/15"
                          : "text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70"
                      }`}
                    >
                      <span className={`h-1 w-1 rounded-full shrink-0 ${childActive ? "bg-[#0822C0]" : "bg-gray-300 dark:bg-white/20"}`} />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className="pt-2 border-t border-gray-100 mt-2">
        <Link
          href="/courses"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 dark:text-white/50 hover:text-[#0822C0] dark:hover:text-blue-400 hover:bg-[#0822C0]/5 dark:hover:bg-[#0822C0]/15 transition-all"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Browse Courses
        </Link>
      </div>
    </>
  );

  const UserFooter = () => (
    <div className="border-t border-gray-100 p-3">
      <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-white/5 px-3 py-2.5">
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="h-8 w-8 rounded-full object-cover shrink-0" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-[#0822C0]/10 text-[#0822C0] flex items-center justify-center text-xs font-bold shrink-0 uppercase">
            {userName[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-800 dark:text-white/80 truncate">{userName}</p>
          <p className="text-[10px] text-gray-400 truncate">{userEmail}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-[#10141c] border-r border-gray-200 dark:border-white/10 min-h-screen">
        <div className="flex items-center gap-2.5 px-4 h-[68px] border-b border-gray-100">
          <img src="/fwa-dark.svg" alt="Finance with Anne" className="h-7 w-auto" />
          <span className="text-xs font-semibold text-gray-700 truncate">My Account</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          <NavLinks />
        </nav>
        <UserFooter />
      </aside>

      {/* Mobile drawer (controlled by AccountShell via props) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#10141c] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 px-4 h-[68px] border-b border-gray-100">
              <img src="/fwa-dark.svg" alt="Finance with Anne" className="h-7 w-auto" />
              <span className="text-xs font-semibold text-gray-700">My Account</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
              <NavLinks />
            </nav>
            <UserFooter />
          </div>
        </div>
      )}
    </>
  );
}
