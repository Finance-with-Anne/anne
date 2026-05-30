"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type Post = { id: string; title: string; slug: string; excerpt: string | null; cover_image: string | null; published_at: string | null };

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function IconMoney() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconQuestion() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
function IconBag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Mega menu data ────────────────────────────────────────────────────────────
const leftLinks = [
  { label: "Blog", href: "/blog", desc: "Insights, tips and strategies", icon: <IconBook />, bg: "bg-purple-100 text-purple-600" },
  { label: "Money Talks", href: "/money-talks", desc: "Financial conversations and advice", icon: <IconMoney />, bg: "bg-green-100 text-green-600" },
  { label: "FAQ", href: "/faq", desc: "Common questions answered", icon: <IconQuestion />, bg: "bg-blue-100 text-blue-600" },
  { label: "Testimonials", href: "/testimonials", desc: "What my clients say", icon: <IconStar />, bg: "bg-yellow-100 text-yellow-600" },
];

const rightLinks = [
  { label: "Shop", href: "/shop", desc: "Books, tools and resources", icon: <IconBag />, bg: "bg-orange-100 text-orange-600" },
  { label: "Products & Services", href: "/products-services", desc: "Work with Anne", icon: <IconLayers />, bg: "bg-rose-100 text-rose-600" },
  { label: "Book a Session", href: "/booking", desc: "Schedule time with Anne", icon: <IconCalendar />, bg: "bg-indigo-100 text-indigo-600" },
  { label: "Privacy & Terms", href: "/policy", desc: "Legal policies and terms", icon: <IconPolicy />, bg: "bg-gray-100 text-gray-600" },
];

// ── Top-level simple links (everything except Resources) ──────────────────────
const topLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Money Talks", href: "/money-talks" },
  { label: "Contact", href: "/contact" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          ANNE
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {topLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-black ${pathname === link.href ? "text-black" : "text-gray-500"}`}
            >
              {link.label}
            </Link>
          ))}

          {/* Resources trigger */}
          <div className="relative" onMouseEnter={openMega} onMouseLeave={closeMega}>
            <button
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-black ${megaOpen ? "text-black" : "text-gray-500"}`}
            >
              Resources
              <IconChevron open={megaOpen} />
            </button>

            {/* Mega menu panel */}
            {megaOpen && (
              <div
                className="absolute left-1/2 top-full mt-3 -translate-x-1/2 w-[860px] rounded-2xl border border-gray-100 bg-white p-6 shadow-xl"
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                {/* Triangle pointer */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 rounded-sm border-l border-t border-gray-100 bg-white" />

                <div className="grid grid-cols-3 gap-6">
                  {/* Left column */}
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Content</p>
                    <ul className="space-y-1">
                      {leftLinks.map((item) => (
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

                  {/* Middle column */}
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Explore</p>
                    <ul className="space-y-1">
                      {rightLinks.map((item) => (
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

                  {/* Right column — Latest posts */}
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

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/booking"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
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
        <div className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
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
                {leftLinks.map((item) => (
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
                <p className="mt-2 py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">Explore</p>
                {rightLinks.map((item) => (
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

            <Link
              href="/booking"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-md bg-black px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              Book a Session
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
