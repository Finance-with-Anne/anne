"use client";

import { useState } from "react";

const PRICE = 11999;

function GreenCheck() {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#22c55e" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function ImagePlaceholder({ src, alt, aspectRatio }: { src: string; alt: string; aspectRatio: string }) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio, backgroundColor: "#e5e7eb", borderRadius: "12px", overflow: "hidden", border: "1px solid #d1d5db" }}>
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    </div>
  );
}

export default function MoneyTrackerCheckout() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/products/money-tracker/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "14px",
    color: "#111827",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", color: "#111827", padding: "48px 16px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", alignItems: "start" }}>

          {/* ── Left: What You Will Get ── */}
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#0822C0", textAlign: "center", marginBottom: "24px" }}>
              What You Will Get
            </h2>

            {/* Tracker screenshot */}
            <ImagePlaceholder src="/tracker-screenshot.png" alt="Complete Money Tracker spreadsheet" aspectRatio="16/9" />

            {/* First 3 check items */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "Instant access to the Complete Money Tracker",
                "Fully customizable for your unique financial life",
                "Works with any currency, anywhere in the world",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <GreenCheck />
                  <span style={{ fontSize: "14px", color: "#374151" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* YouTube thumbnail */}
            <div style={{ marginTop: "24px" }}>
              <ImagePlaceholder src="/tracker-thumbnail.png" alt="YouTube tutorial — Complete Money Tracker walkthrough" aspectRatio="16/9" />
            </div>

            {/* Last 2 check items */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "Instant access to the YouTube tutorial",
                "Simple to use, takes just 10 minutes a day",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <GreenCheck />
                  <span style={{ fontSize: "14px", color: "#374151" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Form card ── */}
          <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "1px solid #e5e7eb" }}>

            {/* Blue header banner */}
            <div style={{ backgroundColor: "#0822C0", padding: "24px", textAlign: "center" }}>
              <p style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Complete Your Purchase</p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", marginTop: "6px" }}>
                Get instant access to the Money Tracker!
              </p>
            </div>

            {/* White body */}
            <div style={{ backgroundColor: "#ffffff", padding: "28px 24px" }}>

              {/* Price */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Price:</p>
                <p style={{ fontSize: "36px", fontWeight: 800, color: "#22c55e", lineHeight: 1.1, margin: 0 }}>
                  ₦{PRICE.toLocaleString()}{" "}
                  <span style={{ fontSize: "16px", fontWeight: 400, color: "#9ca3af" }}>NGN</span>
                </p>
              </div>

              {/* Your Details */}
              <p style={{ fontWeight: 700, fontSize: "15px", color: "#111827", marginBottom: "10px" }}>Your Details</p>
              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", marginBottom: "20px" }} />

              <form onSubmit={handlePay} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {error && (
                  <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "8px", padding: "12px 16px", fontSize: "13px" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    backgroundColor: loading ? "#6b7280" : "#0822C0",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "15px",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "background-color 0.15s",
                    marginTop: "4px",
                  }}
                >
                  {loading ? "Processing…" : "Proceed to Payment"}
                </button>

                <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                  Your payment will be securely processed.
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
