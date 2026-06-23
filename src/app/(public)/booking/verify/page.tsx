"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyContent() {
  const params = useSearchParams();
  const bookingId = params.get("booking_id");
  const transactionId = params.get("transaction_id");
  const flwStatus = params.get("status");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!bookingId || !transactionId) { setStatus("error"); setMessage("Missing payment reference."); return; }
    if (flwStatus === "cancelled") { setStatus("error"); setMessage("Payment was cancelled."); return; }

    fetch("/api/bookings/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId, transaction_id: transactionId }),
    })
      .then(r => r.json())
      .then(j => {
        if (j.success) { setStatus("success"); }
        else { setStatus("error"); setMessage(j.error ?? "Verification failed."); }
      })
      .catch(() => { setStatus("error"); setMessage("Network error."); });
  }, [bookingId, transactionId, flwStatus]);

  if (status === "loading") {
    return (
      <div className="text-center py-20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent mb-4" />
        <p className="text-gray-500 dark:text-white/40">Verifying your payment…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-50 dark:bg-green-400/10 mb-2">
          <svg className="h-7 w-7 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Confirmed!</h1>
        <p className="text-sm text-gray-500 dark:text-white/40 max-w-xs mx-auto">
          Check your email — we&apos;ve sent your booking confirmation with the Google Meet link.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-20 space-y-4">
      <p className="text-red-400 font-medium">Something went wrong</p>
      <p className="text-sm text-gray-400">{message}</p>
      <p className="text-sm text-gray-400">Please contact us if you were charged.</p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading…</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
