"use client";

import { useState } from "react";
import Link from "next/link";

const PRICE = 150000;
const PRODUCT_NAME = "Legacy Builders Network — Annual Membership";

const ICO = "h-4 w-4 text-[#0822C0] dark:text-blue-400";

const WHAT_YOU_GET = [
  {
    label: "Stock Signals",
    desc: "Monthly stock recommendations — what to buy, when to buy, when to take profit",
    Icon: () => (
      <svg className={ICO} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    label: "Smart Money Moves",
    desc: "Timely breakdowns on where to put your money and where to pull out",
    Icon: () => (
      <svg className={ICO} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Monthly Webinars with Anne",
    desc: "Live sessions with Anne and guest industry experts",
    Icon: () => (
      <svg className={ICO} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" />
      </svg>
    ),
  },
  {
    label: "Exclusive Market Analysis",
    desc: "Insider-level analysis on stocks, bonds, T-bills and real estate",
    Icon: () => (
      <svg className={ICO} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Beginners Investment Course",
    desc: "Step-by-step foundation for those just starting their investment journey",
    Icon: () => (
      <svg className={ICO} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      </svg>
    ),
  },
  {
    label: "Private Community Access",
    desc: "Join a vetted circle of like-minded investors and get direct Q&A support",
    Icon: () => (
      <svg className={ICO} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function LBNCheckout() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/products/legacy-builders-network/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.payment_url) {
        setError(json.error ?? "Could not initialise payment. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = json.payment_url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05090f] py-12 px-4">
      <div className="mx-auto max-w-5xl">

        <Link href="/legacy-builders-network" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/70 transition-colors mb-8">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to sales page
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Left — What you get */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{PRODUCT_NAME}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-white/45">Annual membership · Access via private WhatsApp group</p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/3 p-6 space-y-4">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-widest">What you&apos;ll receive</h2>
              <div className="space-y-3">
                {WHAT_YOU_GET.map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="h-8 w-8 rounded-lg bg-[#0822C0]/8 dark:bg-[#0822C0]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <item.Icon />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-400 dark:text-white/35 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-green-200 dark:border-green-400/20 bg-green-50 dark:bg-green-400/5 p-4 flex items-start gap-3">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Secure one-time payment</p>
                <p className="text-xs text-green-700 dark:text-green-400/70 mt-0.5">Your info is encrypted. We never store card details.</p>
              </div>
            </div>
          </div>

          {/* Right — Checkout form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePay} className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-[#0e1117] p-6 shadow-lg space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Complete your subscription</h2>
                <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">You&apos;ll be added to the community after payment</p>
              </div>

              <div className="rounded-xl bg-[#0822C0]/6 dark:bg-[#0822C0]/15 border border-[#0822C0]/15 dark:border-[#0822C0]/25 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-white/70">Annual membership</span>
                <span className="text-xl font-extrabold text-[#0822C0] dark:text-blue-400">₦{PRICE.toLocaleString()}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/50 mb-1.5">Full name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Okonkwo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:border-[#0822C0] dark:focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/50 mb-1.5">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:border-[#0822C0] dark:focus:border-blue-400 transition-colors"
                  />
                  <p className="text-[11px] text-gray-400 dark:text-white/25 mt-1">Your confirmation and access details will be sent here</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-white/50 mb-1.5">Phone number</label>
                  <input
                    type="tel"
                    required
                    placeholder="08012345678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:border-[#0822C0] dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#0822C0] text-white font-bold py-4 text-sm hover:bg-[#0618a0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Processing…" : `Pay ₦${PRICE.toLocaleString()} securely`}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-white/25">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Secured by Flutterwave
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
