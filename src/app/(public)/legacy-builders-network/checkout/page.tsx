"use client";

import { useState } from "react";
import Link from "next/link";

const PRICE_NGN = 150000;

export default function LBNCheckout() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalPrice = PRICE_NGN - discount;

  async function applyCoupon() {
    if (!coupon.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/products/legacy-builders-network/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.trim().toUpperCase() }),
      });
      const json = await res.json();
      if (!res.ok || !json.valid) {
        setCouponError(json.error ?? "Invalid coupon code.");
        setCouponApplied(false);
        setDiscount(0);
      } else {
        setCouponApplied(true);
        setDiscount(json.discount ?? 0);
      }
    } catch {
      setCouponError("Could not validate coupon. Try again.");
    }
    setApplyingCoupon(false);
  }

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
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          coupon: couponApplied ? coupon.trim().toUpperCase() : undefined,
        }),
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">

        {/* Blue header */}
        <div className="bg-blue-600 rounded-t-2xl px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-white">Complete Your Subscription</h1>
          <p className="text-blue-100 mt-1 text-sm">Get instant access to the Premium Community!</p>
        </div>

        {/* Form card */}
        <form onSubmit={handlePay} className="bg-white rounded-b-2xl px-8 py-8 shadow-lg space-y-5">

          {/* Price */}
          <div className="text-center pb-2">
            <p className="text-4xl font-extrabold text-green-600">
              ₦{finalPrice.toLocaleString()} <span className="text-3xl">NGN</span>
            </p>
            {discount > 0 && (
              <p className="text-sm text-gray-400 line-through mt-0.5">₦{PRICE_NGN.toLocaleString()} NGN</p>
            )}
            <p className="text-xs text-gray-400 mt-1.5">≈ $100 USD · ≈ £80 GBP</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Phone Number</label>
            <input
              type="tel"
              required
              placeholder="+1234567890"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Coupon */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Coupon Code (optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={e => {
                  setCoupon(e.target.value);
                  setCouponApplied(false);
                  setCouponError("");
                  setDiscount(0);
                }}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={applyingCoupon || !coupon.trim()}
                className="px-5 py-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {applyingCoupon ? "…" : "Apply"}
              </button>
            </div>
            {couponApplied && (
              <p className="text-xs text-green-600 mt-1.5">✓ Coupon applied — ₦{discount.toLocaleString()} off</p>
            )}
            {couponError && (
              <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white font-bold py-4 text-base hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? "Processing…" : "Proceed to Payment"}
            {!loading && (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            After payment, you&apos;ll be redirected to WhatsApp to confirm your subscription and get your access details.
          </p>
        </form>

        <div className="text-center mt-4">
          <Link href="/legacy-builders-network" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Back to sales page
          </Link>
        </div>

      </div>
    </div>
  );
}
