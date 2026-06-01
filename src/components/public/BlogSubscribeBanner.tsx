"use client";

import { useState } from "react";

export default function BlogSubscribeBanner() {
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
    <div className="rounded-2xl bg-[#070F1E] p-6 text-white">
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
        Newsletter
      </div>
      <h3 className="text-base font-bold leading-snug mb-1">
        Subscribe to our blog
      </h3>
      <p className="text-xs text-white/50 mb-4 leading-relaxed">
        Get the latest articles on personal finance, investing, and money management delivered to your inbox.
      </p>

      {status === "done" ? (
        <p className="text-sm font-medium text-green-400">You&apos;re subscribed!</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg bg-white text-[#070F1E] py-2.5 text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-60"
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
          {status === "error" && (
            <p className="text-xs text-red-400">Something went wrong. Try again.</p>
          )}
        </form>
      )}
    </div>
  );
}
