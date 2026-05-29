"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left panel — full bleed image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background image */}
        <img
          src="/img1.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content on top of image */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo top-left */}
          <div>
            <img src="/FWA%20light.svg" alt="Finance with Anne" className="h-10 w-auto" />
          </div>

          {/* Bottom card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <blockquote className="text-white text-base leading-relaxed font-light">
              &ldquo;Financial freedom is not a destination. It&apos;s a daily practice of intentional decisions.&rdquo;
            </blockquote>
            <p className="mt-3 text-white/50 text-sm">— Finance with Anne</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-zinc-950">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <img src="/FWA%20light.svg" alt="Finance with Anne" className="h-8 w-auto mx-auto" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Admin sign in</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-white/30 focus:outline-none focus:ring-0 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 pr-10 text-sm text-white placeholder-zinc-600 focus:border-white/30 focus:outline-none focus:ring-0 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <span className="text-red-400 text-xs leading-relaxed">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in to Dashboard"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-600">
            ANNE Admin Panel &mdash; Authorised access only
          </p>
        </div>
      </div>
    </div>
  );
}
