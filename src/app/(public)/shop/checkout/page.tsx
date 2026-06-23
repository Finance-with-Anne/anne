"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function currencySym(cur: string) {
  if (cur === "GBP") return "£";
  if (cur === "USD") return "$";
  return "₦";
}

export default function CheckoutPage() {
  const { items, total, currency, clearCart } = useCart();
  const router = useRouter();
  const s = currencySym(currency);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile?.full_name) setName(profile.full_name);
    });
  }, []);

  useEffect(() => {
    if (items.length === 0) router.replace("/shop");
  }, [items.length, router]);

  async function handleCheckout() {
    if (!name.trim() || !email.trim()) { setError("Please fill in your name and email."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/shop/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, currency, name: name.trim(), email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Checkout failed."); return; }
      window.location.href = json.payment_url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors mb-8"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Continue Shopping
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Order summary */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#0d1220] overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Order Summary</h2>
          </div>
          <ul className="divide-y divide-gray-50 dark:divide-white/5">
            {items.map(item => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-4">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-[#0822C0]/8 dark:bg-[#0822C0]/20 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Qty: {item.qty}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                  {s}{(item.price * item.qty).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
          <div className="px-5 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-white/40">Total</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">{s}{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Contact + pay */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#0d1220] p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Your details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-white/40 mb-1">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-[#0822C0]/50 dark:focus:border-[#0822C0]/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-white/40 mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-[#0822C0]/50 dark:focus:border-[#0822C0]/50"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="w-full rounded-xl bg-[#0822C0] text-white text-sm font-bold py-3.5 hover:bg-[#061aa0] disabled:opacity-50 transition-colors"
          >
            {submitting ? "Redirecting…" : `Pay ${s}${total.toLocaleString()} with Flutterwave`}
          </button>
          <p className="text-[10px] text-center text-gray-400 dark:text-white/25">
            Your payment is secured by Flutterwave
          </p>
        </div>
      </div>
    </div>
  );
}
