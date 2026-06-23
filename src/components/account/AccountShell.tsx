"use client";

import { useState, useEffect } from "react";
import AccountSidebar from "./AccountSidebar";
import AccountHeader from "./AccountHeader";

function ForceLightMode() {
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    html.classList.remove("dark");
    return () => { if (wasDark) html.classList.add("dark"); };
  }, []);
  return null;
}

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

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ForceLightMode />
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
        />
        <main className="flex-1 overflow-y-auto px-6 py-5 lg:px-8 lg:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
