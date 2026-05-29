import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: blogCount },
    { count: bookingCount },
    { count: clientCount },
    { count: productCount },
  ] = await Promise.all([
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Blog Posts", value: blogCount ?? 0, href: "/admin/blog" },
    { label: "Pending Bookings", value: bookingCount ?? 0, href: "/admin/booking" },
    { label: "Clients", value: clientCount ?? 0, href: "/admin/clients" },
    { label: "Products", value: productCount ?? 0, href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Welcome back. Here&apos;s what&apos;s happening.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-sm transition-all"
          >
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "New Blog Post", href: "/admin/blog", desc: "Write and publish a new article." },
          { label: "View Bookings", href: "/admin/booking", desc: "Manage incoming booking requests." },
          { label: "Add Product", href: "/admin/products", desc: "List a new product or digital resource." },
          { label: "Upload Course", href: "/admin/courses", desc: "Create a new course and add lessons." },
          { label: "Send Email", href: "/admin/email", desc: "Send a broadcast to your subscribers." },
          { label: "Manage Clients", href: "/admin/clients", desc: "View and update client records." },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-400 hover:shadow-sm transition-all"
          >
            <p className="text-sm font-semibold text-gray-900">{action.label} →</p>
            <p className="mt-1 text-xs text-gray-500">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
