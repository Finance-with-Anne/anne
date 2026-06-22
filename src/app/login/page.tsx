"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const highlights = [
  { icon: "🎓", label: "Expert-led courses", desc: "Practical financial education from Anne herself" },
  { icon: "📈", label: "Track your progress", desc: "Pick up exactly where you left off, every time" },
  { icon: "🔒", label: "Lifetime access", desc: "Once enrolled, the course is yours to keep" },
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // animate left panel dots
  const [activeDot, setActiveDot] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveDot(d => (d + 1) % highlights.length), 3000);
    return () => clearInterval(t);
  }, []);

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

  const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0822C0]/20 focus:border-[#0822C0]/40 transition-all";

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col w-[46%] xl:w-[44%] relative bg-[#0822C0] overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 w-fit">
            <img src="/fwa-light.svg" alt="Finance with Anne" className="h-9 w-auto" />
            <span className="text-white/90 text-base font-semibold tracking-tight">Finance with Anne</span>
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Student Portal</p>
            <h2 className="text-white text-3xl xl:text-4xl font-black leading-tight tracking-tight">
              Take control<br />of your finances.
            </h2>
            <p className="mt-4 text-white/60 text-sm leading-relaxed max-w-xs">
              Practical financial education that meets you where you are — and takes you where you want to go.
            </p>

            {/* Highlights */}
            <div className="mt-10 space-y-4">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 rounded-2xl px-4 py-3.5 transition-all duration-500 ${
                    activeDot === i ? "bg-white/15 -mx-1 px-5" : "bg-transparent"
                  }`}
                >
                  <span className="text-xl mt-0.5">{h.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold transition-colors ${activeDot === i ? "text-white" : "text-white/70"}`}>{h.label}</p>
                    <p className={`text-xs mt-0.5 transition-colors ${activeDot === i ? "text-white/70" : "text-white/40"}`}>{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex items-center gap-1.5 mt-8">
              {highlights.map((_, i) => (
                <button key={i} onClick={() => setActiveDot(i)} className={`h-1 rounded-full transition-all duration-300 ${i === activeDot ? "w-6 bg-white" : "w-1.5 bg-white/25"}`} />
              ))}
            </div>
          </div>

          {/* Anne quote */}
          <div className="mt-auto pt-8 border-t border-white/10">
            <p className="text-white/60 text-sm italic leading-relaxed">
              &ldquo;Your money is a reflection of your beliefs. Change how you think about wealth, and you&apos;ll change what&apos;s possible.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <img src="/anne-profile.png" alt="Anne" onError={e => { (e.target as HTMLImageElement).src = "/fwa-light.svg"; }} className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20" />
              <div>
                <p className="text-white text-xs font-semibold">Finance with Anne</p>
                <p className="text-white/40 text-[11px]">@financewithanne</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <img src="/fwa-dark.svg" alt="Finance with Anne" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-gray-800">Finance with Anne</span>
          </Link>
          <Link href="/courses" className="text-xs text-[#0822C0] font-medium hover:underline">Browse courses</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[380px]">

            {/* ── Sign in ── */}
            {view === "signin" && (
              <div>
                <div className="mb-7">
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back</h1>
                  <p className="text-sm text-gray-400 mt-1.5">Sign in to continue learning.</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" autoFocus placeholder="you@example.com" className={inputCls} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-500">Password</label>
                      <button type="button" onClick={() => { reset(); setEmail(email); setView("forgot"); }} className="text-xs text-[#0822C0] hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••••••" className={inputCls + " pr-16"} />
                      <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                      <svg className="h-4 w-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#0822C0] text-white py-3.5 text-sm font-bold hover:bg-[#061aa0] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                    {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Signing in…</span> : "Sign in"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                  Don&apos;t have an account?{" "}
                  <button onClick={() => { reset(); setView("signup"); }} className="text-[#0822C0] font-semibold hover:underline">Sign up free</button>
                </p>
              </div>
            )}

            {/* ── Sign up ── */}
            {view === "signup" && !signupSuccess && (
              <div>
                <div className="mb-7">
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create your account</h1>
                  <p className="text-sm text-gray-400 mt-1.5">Join thousands learning with Finance with Anne.</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Full name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required autoFocus placeholder="Anne Okafor" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" placeholder="At least 8 characters" minLength={8} className={inputCls + " pr-16"} />
                      <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                      <svg className="h-4 w-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#0822C0] text-white py-3.5 text-sm font-bold hover:bg-[#061aa0] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                    {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Creating account…</span> : "Create account"}
                  </button>

                  <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                    By signing up you agree to our{" "}
                    <Link href="/terms" className="text-[#0822C0] hover:underline">Terms of Service</Link>{" "}and{" "}
                    <Link href="/policy" className="text-[#0822C0] hover:underline">Privacy Policy</Link>.
                  </p>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <button onClick={() => { reset(); setView("signin"); }} className="text-[#0822C0] font-semibold hover:underline">Sign in</button>
                </p>
              </div>
            )}

            {/* ── Sign up success ── */}
            {view === "signup" && signupSuccess && (
              <div className="text-center">
                <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-xl font-black text-gray-900">Check your inbox</h2>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  We&apos;ve sent a confirmation link to <span className="font-semibold text-gray-600">{email}</span>. Click it to activate your account.
                </p>
                <button onClick={() => { reset(); setSignupSuccess(false); setView("signin"); }} className="mt-6 text-sm text-[#0822C0] font-semibold hover:underline">
                  Back to sign in
                </button>
              </div>
            )}

            {/* ── Forgot password ── */}
            {view === "forgot" && (
              <div>
                <button onClick={() => { reset(); setView("signin"); }} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-6 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Back to sign in
                </button>
                <div className="mb-7">
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">Forgot password?</h1>
                  <p className="text-sm text-gray-400 mt-1.5">Enter your email and we&apos;ll send a reset link.</p>
                </div>
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus placeholder="you@example.com" className={inputCls} />
                  </div>
                  {error && (
                    <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                      <svg className="h-4 w-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#0822C0] text-white py-3.5 text-sm font-bold hover:bg-[#061aa0] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                    {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Sending…</span> : "Send reset link"}
                  </button>
                </form>
              </div>
            )}

            {/* ── Reset sent ── */}
            {view === "forgot-sent" && (
              <div className="text-center">
                <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-[#0822C0]/10 flex items-center justify-center">
                  <svg className="h-8 w-8 text-[#0822C0]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-xl font-black text-gray-900">Link sent!</h2>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Check your inbox at <span className="font-semibold text-gray-600">{email}</span> for a password reset link.
                </p>
                <button onClick={() => { reset(); setView("signin"); }} className="mt-6 text-sm text-[#0822C0] font-semibold hover:underline">
                  Back to sign in
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="py-5 text-center">
          <p className="text-[11px] text-gray-300">
            &copy; {new Date().getFullYear()} Finance with Anne &middot;{" "}
            <Link href="/policy" className="hover:text-gray-400 transition-colors">Privacy</Link>
            {" "}&middot;{" "}
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
