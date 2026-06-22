"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    quote: "Financial freedom is not a destination. It's a daily practice of intentional decisions that compound into a life of abundance.",
    time: "9:00 AM · Jan 12, 2025",
    replies: "1.2K",
    likes: "8.4K",
  },
  {
    quote: "Your money is a reflection of your beliefs. Change how you think about wealth, and you'll change what's possible for your future.",
    time: "11:30 AM · Feb 3, 2025",
    replies: "980",
    likes: "6.1K",
  },
  {
    quote: "Budgeting isn't about restriction — it's about giving every pound a purpose so you can live the life you actually want.",
    time: "2:15 PM · Mar 7, 2025",
    replies: "1.5K",
    likes: "9.2K",
  },
  {
    quote: "The best investment you'll ever make is in understanding your own finances. Knowledge is the foundation of every wealthy life.",
    time: "8:45 AM · Apr 1, 2025",
    replies: "743",
    likes: "5.7K",
  },
  {
    quote: "You don't have to earn more to build wealth. You have to be intentional with what you already have.",
    time: "6:00 PM · May 15, 2025",
    replies: "2.1K",
    likes: "11.3K",
  },
];

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fading, setFading] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setFading(false);
    }, 300);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, goToSlide]);

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

  const right = darkMode
    ? "bg-brand text-white"
    : "bg-white text-gray-900";

  const inputClass = darkMode
    ? "bg-white/5 border-white/10 text-white placeholder-zinc-600 focus:border-white/30"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400";

  const labelClass = darkMode ? "text-zinc-400" : "text-gray-500";
  const subTextClass = darkMode ? "text-zinc-400" : "text-gray-500";
  const footerClass = darkMode ? "text-zinc-600" : "text-gray-400";

  return (
    <div className="min-h-screen flex">
      {/* Left panel — full bleed image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="/img1.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-brand/60" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo + name */}
          <div className="flex items-center gap-3">
            <img src="/fwa-light.svg" alt="Finance with Anne" className="h-10 w-auto" />
            <span className="text-white text-lg font-semibold tracking-tight">Finance with Anne</span>
          </div>

          {/* Tweet card carousel */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div
              className="transition-opacity duration-300"
              style={{ opacity: fading ? 0 : 1 }}
            >
              {/* Tweet header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/anne-profile.png"
                    alt="Finance with Anne"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/fwa-dark.svg"; }}
                    className="h-11 w-11 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">Finance with Anne</p>
                    <p className="text-sm text-gray-400 leading-tight">@financewithanne</p>
                  </div>
                </div>
                {/* X / Twitter icon */}
                <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>

              {/* Tweet body */}
              <p className="mt-4 text-gray-900 text-[15px] leading-relaxed">
                {slides[currentSlide].quote}
              </p>

              {/* Timestamp */}
              <p className="mt-3 text-gray-400 text-sm border-t border-gray-100 pt-3">
                {slides[currentSlide].time} &middot; Finance with Anne
              </p>

              {/* Stats */}
              <div className="mt-2 flex items-center gap-5 text-sm border-t border-gray-100 pt-3">
                <span>
                  <strong className="text-gray-900">{slides[currentSlide].replies}</strong>
                  <span className="text-gray-400 ml-1">replies</span>
                </span>
                <span>
                  <strong className="text-gray-900">{slides[currentSlide].likes}</strong>
                  <span className="text-gray-400 ml-1">likes</span>
                </span>
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2 mt-5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide ? "w-6 bg-brand" : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={`flex-1 flex flex-col ${right} transition-colors duration-300`}>
        {/* Top bar with dark mode toggle */}
        <div className="flex justify-end p-5">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium border transition-all ${
              darkMode
                ? "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                : "border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {darkMode ? (
              <>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                Light mode
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                Dark mode
              </>
            )}
          </button>
        </div>

        {/* Form centred */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="lg:hidden mb-10 text-center">
              <img
                src={darkMode ? "/fwa-light.svg" : "/fwa-dark.svg"}
                alt="Finance with Anne"
                className="h-8 w-auto mx-auto"
              />
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">Admin sign in</h1>
              <p className={`mt-2 text-sm ${subTextClass}`}>
                Enter your credentials to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-2 ${labelClass}`}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className={`w-full rounded-lg border px-4 py-3 pr-16 text-sm focus:outline-none transition-colors ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors ${
                      darkMode ? "text-zinc-500 hover:text-zinc-300" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                  <span className="text-red-400 text-xs">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2 ${
                  darkMode
                    ? "bg-white text-brand hover:bg-gray-100"
                    : "bg-brand text-white hover:bg-brand-hover"
                }`}
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
                  "Sign in"
                )}
              </button>
            </form>

            <p className={`mt-8 text-center text-xs ${footerClass}`}>
              ANNE Admin Panel &mdash; Authorised access only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
