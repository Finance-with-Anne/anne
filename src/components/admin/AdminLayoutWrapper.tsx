"use client";

import { useAdminTheme } from "@/lib/admin-theme";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { dark } = useAdminTheme();
  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${dark ? "bg-[#0d0f14]" : "bg-[#f0f2f5]"}`}>
      {children}
    </div>
  );
}
