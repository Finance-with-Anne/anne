"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const slides = [
  { quote: "Financial freedom is not a destination. It's a daily practice of intentional decisions that compound into a life of abundance.", time: "9:00 AM · Jan 12, 2025", replies: "1.2K", likes: "8.4K" },
  { quote: "Your money is a reflection of your beliefs. Change how you think about wealth, and you'll change what's possible for your future.", time: "11:30 AM · Feb 3, 2025", replies: "980", likes: "6.1K" },
  { quote: "Budgeting isn't about restriction — it's about giving every pound a purpose so you can live the life you actually want.", time: "2:15 PM · Mar 7, 2025", replies: "1.5K", likes: "9.2K" },
  { quote: "The best investment you'll ever make is in understanding your own finances. Knowledge is the foundation of every wealthy life.", time: "8:45 AM · Apr 1, 2025", replies: "743", likes: "5.7K" },
  { quote: "You don't have to earn more to build wealth. You have to be intentional with what you already have.", time: "6:00 PM · May 15, 2025", replies: "2.1K", likes: "11.3K" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const next = searchParams.get("next") ?? "/account";

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fading, setFading] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => { setCurrentSlide(index); setFading(false); }, 300);
  }, []);

  useEffect(() => {
    const t = setInterval(() => goToSlide((currentSlide + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [currentSlide, goToSlide]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Invalid email or password."); setLoading(false); }
    else { router.push(next); router.refresh(); }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) { setError(error.message); setLoading(false); }
    else {
      setSuccess("Account created! Check your email to confirm before signing in.");
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0822C0]/40 transition-colors";

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="/img1.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#0822C0]/60" />
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          <div className="flex items-center gap-3">
            <img src="/fwa-light.svg" alt="Finance with Anne" className="h-10 w-auto" />
            <span className="text-white text-lg font-semibold tracking-tight">Finance with Anne</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="transition-opacity duration-300" style={{ opacity: fading ? 0 : 1 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/anne-profile.png" alt="Finance with Anne" onError={(e) => { (e.target as HTMLImageElement).src = "/fwa-dark.svg"; }} className="h-11 w-11 rounded-full object-cover border border-gray-100" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Finance with Anne</p>
                    <p className="text-sm text-gray-400">@financewithanne</p>
                  </div>
                </div>
                <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <p className="mt-4 text-gray-900 text-[15px] leading-relaxed">{slides[currentSlide].quote}</p>
              <p className="mt-3 text-gray-400 text-sm border-t border-gray-100 pt-3">{slides[currentSlide].time} · Finance with Anne</p>
              <div className="mt-2 flex items-center gap-5 text-sm border-t border-gray-100 pt-3">
                <span><strong className="text-gray-900">{slides[currentSlide].replies}</strong><span className="text-gray-400 ml-1">replies</span></span>
                <span><strong className="text-gray-900">{slides[currentSlide].likes}</strong><span className="text-gray-400 ml-1">likes</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              {slides.map((_, i) => (
                <button key={i} onClick={() => goToSlide(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 bg-[#0822C0]" : "w-1.5 bg-gray-300"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="lg:hidden mb-10 text-center">
              <img src="/fwa-dark.svg" alt="Finance with Anne" className="h-8 w-auto mx-auto" />
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                {tab === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {tab === "signin" ? "Sign in to access your courses." : "Join Finance with Anne and start learning."}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
              {(["signin", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {t === "signin" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>

            {tab === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-2 text-gray-500">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" autoFocus placeholder="you@example.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2 text-gray-500">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••••••" className={inputClass + " pr-16"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3"><span className="text-red-600 text-xs">{error}</span></div>}
                <button type="submit" disabled={loading} className="w-full rounded-lg px-4 py-3 text-sm font-semibold bg-[#0822C0] text-white hover:bg-[#061aa0] disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2">
                  {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Signing in…</span> : "Sign in"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-2 text-gray-500">Full name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required autoFocus placeholder="Anne Okafor" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2 text-gray-500">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2 text-gray-500">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" placeholder="At least 8 characters" minLength={8} className={inputClass + " pr-16"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3"><span className="text-red-600 text-xs">{error}</span></div>}
                {success && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3"><span className="text-green-700 text-xs">{success}</span></div>}
                <button type="submit" disabled={loading} className="w-full rounded-lg px-4 py-3 text-sm font-semibold bg-[#0822C0] text-white hover:bg-[#061aa0] disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2">
                  {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Creating account…</span> : "Create account"}
                </button>
                <p className="text-center text-xs text-gray-400">
                  By signing up you agree to our{" "}
                  <a href="/terms" className="text-[#0822C0] hover:underline">Terms</a>{" "}and{" "}
                  <a href="/policy" className="text-[#0822C0] hover:underline">Privacy Policy</a>.
                </p>
              </form>
            )}

            <p className="mt-8 text-center text-xs text-gray-300">
              Finance with Anne &mdash; Student Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
