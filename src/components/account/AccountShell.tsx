"use client";

import { useState } from "react";
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

  return (
    <div className="min-h-screen flex bg-gray-50">
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
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
