"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAdminTheme } from "@/lib/admin-theme";
import NotificationsPanel from "./NotificationsPanel";
import MessagesPanel from "./MessagesPanel";

const NOTIF_KEY = "fwa_admin_notif_seen";
const MSG_KEY = "fwa_admin_msg_seen";

export default function AdminHeader({
  userName,
  userEmail,
  userRole,
  userAvatar,
}: {
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userAvatar?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { dark, toggle } = useAdminTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);

  // Track badge counts from localStorage
  const [notifSeen, setNotifSeen] = useState(true);
  const [msgSeen, setMsgSeen] = useState(true);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);

  const isEditor = userRole === "editor";
  const displayName = userName ?? (isEditor ? "Editor" : "Finance with Anne");
  const displayEmail = userEmail ?? "webtech.fwa@gmail.com";
  const firstName = displayName.split(" ")[0];

  // On mount, check if there might be unseen notifications (simple: just show badge until clicked)
  useEffect(() => {
    const notifTs = localStorage.getItem(NOTIF_KEY);
    const msgTs = localStorage.getItem(MSG_KEY);
    // No timestamp means never opened — show badge
    setNotifSeen(!!notifTs);
    setMsgSeen(!!msgTs);
  }, []);

  function openNotif() {
    setNotifOpen(true);
    setMsgOpen(false);
    setProfileOpen(false);
    setNotifSeen(true);
  }

  function openMsg() {
    setMsgOpen(true);
    setNotifOpen(false);
    setProfileOpen(false);
    setMsgSeen(true);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  const bg = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const iconBtn = dark
    ? "text-white/50 hover:text-white/80 hover:bg-white/5"
    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100";
  const dropdownBg = dark ? "bg-[#1c1f27] border-white/10" : "bg-white border-gray-200";
  const dropdownItem = dark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50";
  const dropdownLabel = dark ? "text-white" : "text-gray-900";
  const dropdownSub = dark ? "text-white/30" : "text-gray-400";
  const dividerColor = dark ? "border-white/5" : "border-gray-100";
  const chevronColor = dark ? "text-white/30" : "text-gray-400";

  const menuItems = isEditor
    ? [
        {
          label: "My Profile", href: "/admin/profile",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
        },
      ]
    : [
        {
          label: "Profile", href: "/admin/profile",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
        },
        {
          label: "Settings", href: "/admin/settings",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
        },
        {
          label: "Wallet", href: "/admin/wallet",
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
        },
      ];

  return (
    <header className={`relative flex h-14 items-center justify-between border-b px-6 transition-colors duration-300 ${bg}`}>
      {/* Left */}
      <p className={`text-sm font-semibold ${dark ? "text-white/80" : "text-gray-800"}`}>
        Welcome back, {firstName} 👋
      </p>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Messages */}
        <div ref={msgRef} className="relative">
          <button
            onClick={openMsg}
            className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${iconBtn} ${msgOpen ? dark ? "bg-white/8 text-white/70" : "bg-gray-100 text-gray-700" : ""}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {!msgSeen && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-400" />}
          </button>
          <MessagesPanel
            dark={dark}
            open={msgOpen}
            onClose={() => setMsgOpen(false)}
            lastSeenKey={MSG_KEY}
          />
        </div>

        {/* Dark / Light */}
        <button onClick={toggle} className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${iconBtn}`} title={dark ? "Light mode" : "Dark mode"}>
          {dark ? (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={openNotif}
            className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${iconBtn} ${notifOpen ? dark ? "bg-white/8 text-white/70" : "bg-gray-100 text-gray-700" : ""}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {!notifSeen && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-400" />}
          </button>
          <NotificationsPanel
            dark={dark}
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            lastSeenKey={NOTIF_KEY}
          />
        </div>

        <div className={`mx-2 h-5 w-px ${dark ? "bg-white/10" : "bg-gray-200"}`} />

        {/* Profile avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setMsgOpen(false); }}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${dark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}
          >
            {userAvatar ? (
              <img src={userAvatar} alt={displayName} className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10" />
            ) : isEditor ? (
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold uppercase ${dark ? "bg-white/10 text-white/70" : "bg-brand/10 text-brand"}`}>
                {displayName[0]}
              </div>
            ) : (
              <img src="/anne-profile.png" alt="Anne" className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10" />
            )}
            <svg className={`h-3 w-3 transition-transform ${profileOpen ? "rotate-180" : ""} ${chevronColor}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {profileOpen && (
            <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl border py-2 z-50 ${dark ? "shadow-[0_6px_16px_rgba(0,0,0,0.25)]" : ""} ${dropdownBg}`}>
              <div className={`flex items-center gap-3 px-4 py-3 border-b mb-1 ${dividerColor}`}>
                {userAvatar ? (
                  <img src={userAvatar} alt={displayName} className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10 shrink-0" />
                ) : isEditor ? (
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center text-lg font-bold uppercase shrink-0 ${dark ? "bg-white/10 text-white/70" : "bg-brand/10 text-brand"}`}>
                    {displayName[0]}
                  </div>
                ) : (
                  <img src="/anne-profile.png" alt="Anne" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${dropdownLabel}`}>{displayName}</p>
                  <p className={`text-xs truncate ${dropdownSub}`}>{displayEmail}</p>
                  {isEditor && (
                    <span className={`text-[10px] font-medium ${dark ? "text-blue-400" : "text-brand"}`}>Editor</span>
                  )}
                </div>
              </div>

              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setProfileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${dropdownItem}`}
                >
                  <svg className="h-[18px] w-[18px] shrink-0 opacity-60" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <svg className="h-3.5 w-3.5 opacity-30" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}

              <div className={`border-t my-1 mx-3 ${dividerColor}`} />

              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/5 transition-colors rounded-b-2xl"
              >
                <svg className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
