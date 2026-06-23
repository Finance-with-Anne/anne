"use client";

import { useState, useEffect } from "react";
import AccountSidebar from "./AccountSidebar";
import AccountHeader from "./AccountHeader";

export default function AccountShell({
  userName,
  userEmail,
  userAvatar,
  children,
}: {
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const publicTheme = localStorage.getItem("fwa-theme");
    const accountDark = localStorage.getItem("fwa-account-dark") === "1";
    if (accountDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    setIsDark(accountDark);
    return () => {
      if (publicTheme === "dark") html.classList.add("dark");
      else html.classList.remove("dark");
    };
  }, []);

  function toggleDark() {
    const html = document.documentElement;
    const next = !isDark;
    setIsDark(next);
    if (next) {
      html.classList.add("dark");
      localStorage.setItem("fwa-account-dark", "1");
    } else {
      html.classList.remove("dark");
      localStorage.removeItem("fwa-account-dark");
    }
  }

  return (
    <div className="min-h-screen flex dark:bg-[#08090c]" style={{ backgroundColor: "var(--background)" }}>
      <AccountSidebar
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AccountHeader
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          onMenuToggle={() => setMobileOpen((v) => !v)}
          isDark={isDark}
          onToggleDark={toggleDark}
        />
        <main className="flex-1 overflow-y-auto px-6 py-5 lg:px-8 lg:py-5 bg-[#f0f2f7] dark:bg-[#08090c]">
          {children}
        </main>
      </div>
    </div>
  );
}
