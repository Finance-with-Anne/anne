"use client";

import Link from "next/link";
import { useState } from "react";

const EXPLORE = [
  { label: "Blog",              href: "/blog" },
  { label: "Money Talks",       href: "/money-talks" },
  { label: "Testimonials",      href: "/testimonials" },
  { label: "About Anne",        href: "/about" },
  { label: "FAQ",               href: "/faq" },
];

const SERVICES = [
  { label: "Products & Services", href: "/products-services" },
  { label: "Shop",                href: "/shop" },
  { label: "Resources",           href: "/resources" },
  { label: "Book a Session",      href: "/booking" },
];

const LEGAL = [
  { label: "Privacy Policy",    href: "/policy" },
  { label: "Terms of Service",  href: "/terms" },
  { label: "Cookie Policy",     href: "/policy#cookies" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com/financewithanne",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com/financewithanne",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@financewithanne",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/financewithanne",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "loading" | "done" | "err">("idle");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubState("loading");
    const res = await fetch("/api/email/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubState(res.ok ? "done" : "err");
  }

  return (
    <footer className="bg-[#040d1a] text-white">

      {/* ── Top contact band ─────────────────────────────────────── */}
      <div className="border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                label: "Email",
                desc: "Send us a message anytime",
                value: "hello@financewithanne.co",
                href: "mailto:hello@financewithanne.co",
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />,
                label: "Community",
                desc: "Join Money Talks",
                value: "money-talks.financewithanne.co",
                href: "/money-talks",
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
                label: "Book a Session",
                desc: "Schedule time with Anne",
                value: "Book now →",
                href: "/booking",
              },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/10 p-5 transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-[#0822C0]/20 border border-[#0822C0]/30 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-[#4d7fff]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                  <p className="text-xs text-[#4d7fff] mt-1.5 group-hover:underline">{item.value}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main footer body ─────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12">

          {/* Brand + subscribe */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <img src="/fwa-light.svg" alt="Finance with Anne" className="h-9 w-9" />
              <span className="text-base font-bold tracking-wide text-white">Finance with Anne</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Building financial confidence across Africa and beyond — one conversation, one lesson, one decision at a time.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">Stay in the loop</p>
              {subState === "done" ? (
                <p className="text-sm text-green-400 font-medium">You're subscribed! ✓</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="flex-1 min-w-0 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={subState === "loading"}
                    className="rounded-xl bg-[#0822C0] hover:bg-[#0a2fd4] px-4 py-2.5 text-sm font-semibold text-white transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {subState === "loading" ? "…" : "Subscribe"}
                  </button>
                </form>
              )}
              {subState === "err" && <p className="text-xs text-red-400 mt-1.5">Something went wrong. Try again.</p>}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Explore</p>
            <ul className="space-y-3">
              {EXPLORE.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Services</p>
            <ul className="space-y-3">
              {SERVICES.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Legal</p>
            <ul className="space-y-3">
              {LEGAL.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} Finance with Anne. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {LEGAL.map(l => (
              <Link key={l.href} href={l.href} className="text-xs text-white/25 hover:text-white/60 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
