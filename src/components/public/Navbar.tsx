"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { usePublicTheme } from "@/components/public/PublicThemeProvider";

type Post = { id: string; title: string; slug: string; excerpt: string | null; cover_image: string | null; published_at: string | null };

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconCourses() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function IconCommunity() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}
function IconTemplate() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function IconCalculator() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M9 7H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4 0V5a2 2 0 10-4 0v2m4 0H9m0 4h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
function IconContact() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function IconTelegram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}
function IconPolicy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
function IconNewsletter() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Mega menu data ────────────────────────────────────────────────────────────
const col1Links = [
  { label: "Courses", href: "/courses", desc: "Learn at your own pace", icon: <IconCourses />, bg: "bg-purple-100 text-purple-600" },
  { label: "Book a Session", href: "/booking", desc: "Schedule time with Anne", icon: <IconCalendar />, bg: "bg-indigo-100 text-indigo-600" },
  { label: "Communities", href: "/communities", desc: "Join the conversation", icon: <IconCommunity />, bg: "bg-green-100 text-green-600" },
  { label: "YouTube", href: "https://youtube.com/@financewithanne", desc: "Watch free content", icon: <IconYouTube />, bg: "bg-red-100 text-red-600" },
];

const col2Links = [
  { label: "Products & Services", href: "/products-services", desc: "Work with Anne", icon: <IconLayers />, bg: "bg-rose-100 text-rose-600" },
  { label: "Templates", href: "/shop?type=templates", desc: "Ready made templates", icon: <IconTemplate />, bg: "bg-orange-100 text-orange-600" },
  { label: "Calculators", href: "/calculators", desc: "Free financial calculators", icon: <IconCalculator />, bg: "bg-teal-100 text-teal-600" },
  { label: "Testimonials", href: "/testimonials", desc: "What my clients say", icon: <IconStar />, bg: "bg-yellow-100 text-yellow-600" },
];

const col3Links = [
  { label: "Contact", href: "/contact", desc: "Get in touch", icon: <IconContact />, bg: "bg-blue-100 text-blue-600" },
  { label: "Telegram", href: "https://t.me/financewithanne", desc: "Join the Telegram group", icon: <IconTelegram />, bg: "bg-sky-100 text-sky-600" },
  { label: "Privacy Policy", href: "/policy", desc: "Legal policies and terms", icon: <IconPolicy />, bg: "bg-gray-100 text-gray-600" },
  { label: "Newsletter", href: "/newsletter", desc: "Get updates in your inbox", icon: <IconNewsletter />, bg: "bg-pink-100 text-pink-600" },
];

// ── Top-level simple links (everything except Resources) ──────────────────────
const topLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Money-Talks", href: "/blog" },
  { label: "Shop", href: "/shop" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const { dark, toggle } = usePublicTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/blog?limit=2")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setLatestPosts(d))
      .catch(() => {});
  }, []);

  function openMega() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }
  function closeMega() {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  }

  return (
    <header className="relative w-full border-b border-gray-200 dark:border-white/5 bg-white/95 dark:bg-[#050910]/95 backdrop-blur transition-colors duration-200">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/fwa-light.svg" alt="Finance with Anne" className="h-8 w-8" />
          <span className="text-sm font-bold tracking-wide dark:text-white" style={{ color: dark ? undefined : "#0822C0" }}>FINANCE WITH ANNE</span>
        </Link>

        {/* Desktop nav — centred */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden items-center gap-6 lg:flex">
          {topLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-black dark:hover:text-white ${pathname === link.href ? "text-black dark:text-white" : "text-gray-500 dark:text-white/50"}`}
            >
              {link.label}
            </Link>
          ))}

          {/* Resources trigger */}
          <div className="relative" onMouseEnter={openMega} onMouseLeave={closeMega}>
            <button
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-black dark:hover:text-white ${megaOpen ? "text-black dark:text-white" : "text-gray-500 dark:text-white/50"}`}
            >
              Resources
              <IconChevron open={megaOpen} />
            </button>

            {/* Mega menu panel */}
            {megaOpen && (
              <div
                className="absolute left-1/2 top-full mt-3 -translate-x-1/2 w-[1080px] rounded-2xl border border-gray-100 bg-white p-6 shadow-xl"
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                {/* Triangle pointer */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 rounded-sm border-l border-t border-gray-100 bg-white" />

                <div className="grid grid-cols-4 gap-6">
                  {/* Column 1 — Content */}
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Content</p>
                    <ul className="space-y-1">
                      {col1Links.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50"
                            onClick={() => setMegaOpen(false)}
                          >
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                              {item.icon}
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-gray-900">{item.label}</span>
                              <span className="block text-xs text-gray-500 leading-snug mt-0.5">{item.desc}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 2 — Buy */}
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Buy</p>
                    <ul className="space-y-1">
                      {col2Links.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50"
                            onClick={() => setMegaOpen(false)}
                          >
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                              {item.icon}
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-gray-900">{item.label}</span>
                              <span className="block text-xs text-gray-500 leading-snug mt-0.5">{item.desc}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 3 — Quick Links */}
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Quick Links</p>
                    <ul className="space-y-1">
                      {col3Links.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50"
                            onClick={() => setMegaOpen(false)}
                          >
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                              {item.icon}
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-gray-900">{item.label}</span>
                              <span className="block text-xs text-gray-500 leading-snug mt-0.5">{item.desc}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 4 — Latest posts */}
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Latest Posts</p>
                    {latestPosts.length === 0 ? (
                      <p className="text-xs text-gray-400">No posts yet.</p>
                    ) : (
                      <ul className="space-y-4">
                        {latestPosts.map((post) => (
                          <li key={post.id}>
                            <Link
                              href={`/blog/${post.slug}`}
                              className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
                              onClick={() => setMegaOpen(false)}
                            >
                              {post.cover_image ? (
                                <img
                                  src={post.cover_image}
                                  alt={post.title}
                                  className="h-16 w-20 shrink-0 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-16 w-20 shrink-0 rounded-lg bg-gray-100" />
                              )}
                              <div>
                                <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-black">
                                  {post.title}
                                </p>
                                <p className="mt-1 text-xs text-blue-600 font-medium">Read More</p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      href="/blog"
                      className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-black transition-colors"
                      onClick={() => setMegaOpen(false)}
                    >
                      View all posts
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
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

          <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />

          {/* Cart icon */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#0822C0]" />
          </button>

          <div className="mx-1 h-5 w-px bg-gray-200" />

          {/* Login */}
          <Link
            href="/auth"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Login
          </Link>

          {/* Book a Session */}
          <Link
            href="/booking"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "#0822C0" }}
          >
            Book a Session
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-gray-600"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-6 bg-current transition-all ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-current transition-all ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-current transition-all ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#050910] px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {topLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-black ${pathname === link.href ? "text-black" : "text-gray-500"}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Resources accordion */}
            <button
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black"
              onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
            >
              Resources
              <IconChevron open={mobileResourcesOpen} />
            </button>

            {mobileResourcesOpen && (
              <div className="ml-3 border-l-2 border-gray-100 pl-3">
                <p className="py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">Content</p>
                {col1Links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { setMobileOpen(false); setMobileResourcesOpen(false); }}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.bg}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
                <p className="mt-2 py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">Buy</p>
                {col2Links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { setMobileOpen(false); setMobileResourcesOpen(false); }}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.bg}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
                <p className="mt-2 py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">Quick Links</p>
                {col3Links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { setMobileOpen(false); setMobileResourcesOpen(false); }}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.bg}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mt-2">
              <Link
                href="/booking"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-md bg-black dark:bg-white dark:text-black px-4 py-2.5 text-center text-sm font-medium text-white"
              >
                Book a Session
              </Link>
              <button
                onClick={toggle}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
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
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
