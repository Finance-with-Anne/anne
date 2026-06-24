"use client";

import Link from "next/link";
import Image from "next/image";

const EXPLORE = [
  { label: "Blog",              href: "/blog" },
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

const COMPANY = [
  { label: "About",           href: "/about" },
  { label: "Book a Session",  href: "/booking" },
  { label: "Blog",            href: "/blog" },
];

const LEGAL = [
  { label: "Privacy Policy",   href: "/policy" },
  { label: "Terms of Service", href: "/terms" },
];

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/financewithanne",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com/financewithanne",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/financewithanne",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#f0f2f7]">

      {/* ── Main body ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr_1fr_1fr] gap-10 lg:gap-8">

            {/* Brand */}
            <div className="space-y-5">
              <Link href="/" className="flex items-center gap-2.5">
                <Image src="/fwa-light.svg" alt="Finance with Anne" width={36} height={36} className="rounded-lg" />
                <span className="text-base font-bold text-gray-900 tracking-wide">Finance with Anne</span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Building financial confidence across Africa and beyond — one conversation, one lesson, one decision at a time.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {SOCIALS.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">Explore</p>
              <ul className="space-y-3.5">
                {EXPLORE.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">Services</p>
              <ul className="space-y-3.5">
                {SERVICES.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">Company</p>
              <ul className="space-y-3.5">
                {COMPANY.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-200 bg-[#e8eaef]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Finance with Anne. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {LEGAL.map((l, i) => (
              <span key={l.href} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-300">|</span>}
                <Link href={l.href} className="hover:text-gray-900 transition-colors">
                  {l.label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
