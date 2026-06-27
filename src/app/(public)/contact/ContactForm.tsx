"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Something went wrong. Please try again."); }
      else { setSent(true); }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  const inputClass = "w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:border-[#0822C0] dark:focus:border-blue-400 transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5";

  if (sent) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-green-50 dark:bg-green-400/10 flex items-center justify-center">
          <svg className="h-7 w-7 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Message sent!</h3>
        <p className="text-sm text-gray-500 dark:text-white/40 mt-1">We'll get back to you within 24 hours.</p>
        <button
          onClick={() => { setSent(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}
          className="mt-5 text-sm text-[#0822C0] dark:text-blue-400 font-semibold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
          <input type="text" required placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email <span className="text-red-400">*</span></label>
          <input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Subject</label>
        <input type="text" placeholder="What's this about?" value={subject} onChange={e => setSubject(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Message <span className="text-red-400">*</span></label>
        <textarea
          required
          rows={5}
          placeholder="Tell us how we can help..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#0822C0] text-white font-bold py-3.5 text-sm hover:bg-[#0618a0] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? "Sending…" : "Send Message"}
        {!loading && (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        )}
      </button>
    </form>
  );
}
