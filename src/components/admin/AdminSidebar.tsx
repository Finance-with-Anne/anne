"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: "▪" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog", href: "/admin/blog", icon: "▪" },
      { label: "YouTube", href: "/admin/youtube", icon: "▪" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Products", href: "/admin/products", icon: "▪" },
      { label: "Courses", href: "/admin/courses", icon: "▪" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Booking", href: "/admin/booking", icon: "▪" },
      { label: "Clients", href: "/admin/clients", icon: "▪" },
      { label: "Community", href: "/admin/community", icon: "▪" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Email", href: "/admin/email", icon: "▪" },
      { label: "Calculators", href: "/admin/calculators", icon: "▪" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/admin" className="text-lg font-bold tracking-tight text-gray-900">
          ANNE <span className="text-xs font-normal text-gray-400">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {sections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-6 py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-6 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-black" : "bg-gray-300"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <Link
          href="/"
          className="block w-full rounded-md border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          ← View Site
        </Link>
      </div>
    </aside>
  );
}
