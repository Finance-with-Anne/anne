"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";

const tabs = [
  { label: "All Products", href: "/admin/products/all" },
  { label: "Categories", href: "/admin/products/categories" },
  { label: "Add New", href: "/admin/products/new" },
];

export default function ProductsSubNav() {
  const pathname = usePathname();
  const { dark } = useAdminTheme();

  return (
    <div className={`flex items-center gap-1 border-b pb-4 mb-6 ${dark ? "border-white/5" : "border-gray-200"}`}>
      {tabs.map(tab => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? dark ? "bg-white/10 text-white" : "bg-[#0822C0] text-white"
                : dark ? "text-white/40 hover:text-white/70 hover:bg-white/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
