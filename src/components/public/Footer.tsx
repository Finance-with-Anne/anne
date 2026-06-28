"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const EXPLORE = [
  { label: "Blog",               href: "/blog" },
  { label: "Testimonials",       href: "/testimonials" },
  { label: "About Anne",         href: "/about" },
  { label: "FAQ",                href: "/faq" },
  { label: "Resources",          href: "/resources" },
];

const SERVICES = [
  { label: "Book a Session",     href: "/booking" },
  { label: "Shop",               href: "/shop" },
  { label: "Courses",            href: "/courses" },
  { label: "Products & Services",href: "/products-services" },
  { label: "Community",          href: "/legacy-builders-network" },
];

const LEGAL = [
  { label: "Privacy Policy",    href: "/policy" },
  { label: "Terms of Service",  href: "/terms" },
  { label: "Contact",           href: "/contact" },
];

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/financewithanne",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
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
    label: "Instagram",
    href: "https://instagram.com/financewithanne",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me/+SNSQzX94_Gk1M2M0",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.857l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.978.702z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubStatus("loading");
    try {
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubStatus(res.ok ? "done" : "error");
    } catch {
      setSubStatus("error");
    }
  }

  return (
    <footer className="bg-white px-4 pb-6 pt-2">
      <div
        className="w-full rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(140deg, #0822C0 0%, #1535d4 50%, #0f28b8 100%)" }}
      >
        {/* ── Main body ── */}
        <div className="px-5 sm:px-8 lg:px-14 pt-10 sm:pt-12 pb-8 sm:pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_2.8fr] gap-10 lg:gap-16">

            {/* Left — brand */}
            <div className="flex flex-col gap-6">
              <Link href="/" className="flex items-center gap-2.5">
                <Image src="/fwa-light.svg" alt="Finance with Anne" width={34} height={34} className="rounded-lg" />
                <div>
                  <p className="text-sm font-bold text-white leading-none">Finance with Anne</p>
                </div>
              </Link>

              <p className="text-sm text-white/60 leading-relaxed max-w-[220px]">
                Building financial confidence across Africa and beyond — one conversation at a time.
              </p>

              <Link
                href="/booking"
                className="self-start rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                Book a Session
              </Link>

              <div className="flex items-center gap-2">
                {SOCIALS.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Right — nav + newsletter */}
            <div className="flex flex-col gap-10">

              {/* Nav columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Explore</p>
                  <ul className="space-y-2.5">
                    {EXPLORE.map(l => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Services</p>
                  <ul className="space-y-2.5">
                    {SERVICES.map(l => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Company</p>
                  <ul className="space-y-2.5">
                    {LEGAL.map(l => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <p className="text-sm font-semibold text-white mb-3">Subscribe to our Newsletter</p>
                {subStatus === "done" ? (
                  <p className="text-sm text-white/70">You&apos;re subscribed! Check your inbox.</p>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch gap-2 max-w-sm">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={subStatus === "loading"}
                      className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#0822C0] hover:bg-white/90 transition-all disabled:opacity-60 shrink-0"
                    >
                      {subStatus === "loading" ? "…" : "Subscribe"}
                    </button>
                  </form>
                )}
                {subStatus === "error" && (
                  <p className="mt-2 text-xs text-red-300">Something went wrong. Try again.</p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
          <div className="px-5 sm:px-8 lg:px-14 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} Finance with Anne. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/policy" className="text-xs text-white/40 hover:text-white/70 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
