"use client";

import { useState } from "react";

export default function HomeNewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="bg-white px-4 py-6 lg:py-8">
      <div
        className="w-full rounded-3xl px-6 sm:px-12 lg:px-20 py-16 lg:py-20 flex flex-col items-center text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0822C0 0%, #1a3fd4 40%, #3b5fe8 75%, #0f1fa8 100%)",
        }}
      >
        {/* Soft blobs for depth */}
        <div
          className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: "#6b8eff" }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: "#a78bfa" }}
        />

        <div className="relative z-10 max-w-xl">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5 text-white/70 border border-white/20">
            Newsletter
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Take control of your money, starting today.
          </h2>

          <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-10">
            Get free tips on budgeting, investing, and building wealth delivered straight to your inbox every week.
          </p>

          {status === "done" ? (
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-6 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-white font-semibold text-sm">You&apos;re subscribed! Check your inbox.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-full px-5 py-3.5 text-sm text-gray-900 placeholder-gray-400 bg-white outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 rounded-full px-6 py-3.5 text-sm font-bold text-[#0822C0] bg-white hover:bg-white/90 transition-all disabled:opacity-60 flex items-center gap-2 justify-center"
              >
                {status === "loading" ? "Subscribing…" : (
                  <>
                    Subscribe
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-3 text-sm text-red-300">Something went wrong. Please try again.</p>
          )}

          <p className="mt-5 text-white/40 text-xs">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
