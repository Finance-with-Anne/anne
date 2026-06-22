"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

type View = "signin" | "signup" | "forgot" | "forgot-sent";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const next = searchParams.get("next") ?? "/account";

  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const urlError = searchParams.get("error");
  const [error, setError] = useState(urlError === "confirmation_failed" ? "Confirmation link expired or invalid. Please try again." : "");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
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

  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, goToSlide]);

  function reset() { setError(""); setEmail(""); setPassword(""); setFullName(""); setShowPassword(false); }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Invalid email or password. Please try again."); setLoading(false); }
    else { router.push(next); router.refresh(); }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setLoading(false); setSignupSuccess(true); }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/account/reset-password`,
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setLoading(false); setView("forgot-sent"); }
  }

  const rightBg = darkMode ? "bg-[#0822C0] text-white" : "bg-white text-gray-900";
  const inputCls = darkMode
    ? "bg-white/5 border-white/10 text-white placeholder-[#0822C0]/40 focus:border-white/30"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400";
  const labelCls = darkMode ? "text-white/50" : "text-gray-500";
  const subCls = darkMode ? "text-white/50" : "text-gray-500";
  const footerCls = darkMode ? "text-white/25" : "text-gray-400";

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="/img1.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#0822C0]/60" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/fwa-light.svg" alt="Finance with Anne" className="h-10 w-auto" />
            <span className="text-white text-lg font-semibold tracking-tight">Finance with Anne</span>
          </div>

          {/* Tweet carousel */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="transition-opacity duration-300" style={{ opacity: fading ? 0 : 1 }}>
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
                <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <p className="mt-4 text-gray-900 text-[15px] leading-relaxed">{slides[currentSlide].quote}</p>
              <p className="mt-3 text-gray-400 text-sm border-t border-gray-100 pt-3">
                {slides[currentSlide].time} &middot; Finance with Anne
              </p>
              <div className="mt-2 flex items-center gap-5 text-sm border-t border-gray-100 pt-3">
                <span><strong className="text-gray-900">{slides[currentSlide].replies}</strong><span className="text-gray-400 ml-1">replies</span></span>
                <span><strong className="text-gray-900">{slides[currentSlide].likes}</strong><span className="text-gray-400 ml-1">likes</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 bg-[#0822C0]" : "w-1.5 bg-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className={`flex-1 flex flex-col ${rightBg} transition-colors duration-300`}>
        {/* Dark mode toggle */}
        <div className="flex justify-end p-5">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium border transition-all ${
              darkMode
                ? "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
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

        {/* Form */}
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

            {/* ── Sign in ── */}
            {view === "signin" && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                  <p className={`mt-2 text-sm ${subCls}`}>Sign in to your student portal.</p>
                </div>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${labelCls}`}>Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" autoFocus placeholder="you@example.com" className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none transition-colors ${inputCls}`} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-xs font-medium ${labelCls}`}>Password</label>
                      <button type="button" onClick={() => { reset(); setEmail(email); setView("forgot"); }} className={`text-xs transition-colors ${darkMode ? "text-white/40 hover:text-white/70" : "text-[#0822C0] hover:underline"}`}>Forgot password?</button>
                    </div>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••••••" className={`w-full rounded-lg border px-4 py-3 pr-16 text-sm focus:outline-none transition-colors ${inputCls}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors ${darkMode ? "text-white/30 hover:text-white/60" : "text-gray-400 hover:text-gray-600"}`}>
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                      <span className="text-red-400 text-xs">{error}</span>
                    </div>
                  )}
                  <button type="submit" disabled={loading} className={`w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2 ${darkMode ? "bg-white text-[#0822C0] hover:bg-gray-100" : "bg-[#0822C0] text-white hover:bg-[#061aa0]"}`}>
                    {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Signing in…</span> : "Sign in"}
                  </button>
                </form>
                <p className={`mt-6 text-center text-sm ${subCls}`}>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => { reset(); setView("signup"); }} className={`font-semibold ${darkMode ? "text-white hover:text-white/80" : "text-[#0822C0] hover:underline"}`}>Sign up free</button>
                </p>
              </>
            )}

            {/* ── Sign up ── */}
            {view === "signup" && !signupSuccess && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
                  <p className={`mt-2 text-sm ${subCls}`}>Join thousands learning with Finance with Anne.</p>
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${labelCls}`}>Full name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required autoFocus placeholder="Anne Okafor" className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none transition-colors ${inputCls}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${labelCls}`}>Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none transition-colors ${inputCls}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${labelCls}`}>Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" placeholder="At least 8 characters" minLength={8} className={`w-full rounded-lg border px-4 py-3 pr-16 text-sm focus:outline-none transition-colors ${inputCls}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors ${darkMode ? "text-white/30 hover:text-white/60" : "text-gray-400 hover:text-gray-600"}`}>
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                      <span className="text-red-400 text-xs">{error}</span>
                    </div>
                  )}
                  <button type="submit" disabled={loading} className={`w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2 ${darkMode ? "bg-white text-[#0822C0] hover:bg-gray-100" : "bg-[#0822C0] text-white hover:bg-[#061aa0]"}`}>
                    {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Creating account…</span> : "Create account"}
                  </button>
                </form>
                <p className={`mt-6 text-center text-sm ${subCls}`}>
                  Already have an account?{" "}
                  <button onClick={() => { reset(); setView("signin"); }} className={`font-semibold ${darkMode ? "text-white hover:text-white/80" : "text-[#0822C0] hover:underline"}`}>Sign in</button>
                </p>
              </>
            )}

            {/* ── Sign up success ── */}
            {view === "signup" && signupSuccess && (
              <div className="text-center">
                <div className={`mx-auto mb-5 h-16 w-16 rounded-full flex items-center justify-center ${darkMode ? "bg-white/10" : "bg-green-50"}`}>
                  <svg className={`h-8 w-8 ${darkMode ? "text-white" : "text-green-500"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-xl font-semibold">Check your inbox</h2>
                <p className={`text-sm mt-2 leading-relaxed ${subCls}`}>
                  We&apos;ve sent a confirmation link to <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-700"}`}>{email}</span>.
                </p>
                <button onClick={() => { reset(); setSignupSuccess(false); setView("signin"); }} className={`mt-6 text-sm font-semibold ${darkMode ? "text-white/70 hover:text-white" : "text-[#0822C0] hover:underline"}`}>
                  Back to sign in
                </button>
              </div>
            )}

            {/* ── Forgot password ── */}
            {view === "forgot" && (
              <>
                <button onClick={() => { reset(); setView("signin"); }} className={`flex items-center gap-1.5 text-xs mb-8 transition-colors ${darkMode ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-600"}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Back to sign in
                </button>
                <div className="mb-8">
                  <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
                  <p className={`mt-2 text-sm ${subCls}`}>Enter your email and we&apos;ll send a reset link.</p>
                </div>
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${labelCls}`}>Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus placeholder="you@example.com" className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none transition-colors ${inputCls}`} />
                  </div>
                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                      <span className="text-red-400 text-xs">{error}</span>
                    </div>
                  )}
                  <button type="submit" disabled={loading} className={`w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2 ${darkMode ? "bg-white text-[#0822C0] hover:bg-gray-100" : "bg-[#0822C0] text-white hover:bg-[#061aa0]"}`}>
                    {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Sending…</span> : "Send reset link"}
                  </button>
                </form>
              </>
            )}

            {/* ── Reset sent ── */}
            {view === "forgot-sent" && (
              <div className="text-center">
                <div className={`mx-auto mb-5 h-16 w-16 rounded-full flex items-center justify-center ${darkMode ? "bg-white/10" : "bg-[#0822C0]/10"}`}>
                  <svg className={`h-8 w-8 ${darkMode ? "text-white" : "text-[#0822C0]"}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-xl font-semibold">Link sent!</h2>
                <p className={`text-sm mt-2 leading-relaxed ${subCls}`}>
                  Check your inbox at <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-700"}`}>{email}</span> for a password reset link.
                </p>
                <button onClick={() => { reset(); setView("signin"); }} className={`mt-6 text-sm font-semibold ${darkMode ? "text-white/70 hover:text-white" : "text-[#0822C0] hover:underline"}`}>
                  Back to sign in
                </button>
              </div>
            )}

            <p className={`mt-10 text-center text-xs ${footerCls}`}>
              Finance with Anne &mdash; Student Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
