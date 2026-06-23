"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

interface Download { name: string; download_url: string | null; qty: number }

function VerifyContent() {
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const transactionId = params.get("transaction_id");
  const flwStatus = params.get("status");
  const { clearCart } = useCart();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [downloads, setDownloads] = useState<Download[]>([]);

  useEffect(() => {
    if (!orderId || !transactionId) { setStatus("error"); setMessage("Missing payment reference."); return; }
    if (flwStatus === "cancelled") { setStatus("error"); setMessage("Payment was cancelled."); return; }

    fetch("/api/shop/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, transaction_id: transactionId }),
    })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          clearCart();
          setDownloads(j.downloads ?? []);
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(j.error ?? "Verification failed.");
        }
      })
      .catch(() => { setStatus("error"); setMessage("Network error."); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, transactionId, flwStatus]);

  if (status === "loading") {
    return (
      <div className="text-center py-24">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#0822C0] border-t-transparent mb-4" />
        <p className="text-gray-500 dark:text-white/40 text-sm">Verifying your payment…</p>
      </div>
    );
  }

  if (status === "success") {
    const withDownloads = downloads.filter(d => d.download_url);
    return (
      <div className="text-center py-16 space-y-5">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-50 dark:bg-green-400/10 mb-2">
          <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Confirmed!</h1>
        <p className="text-sm text-gray-500 dark:text-white/40 max-w-xs mx-auto">
          Thank you for your purchase. A confirmation email is on its way.
        </p>

        {withDownloads.length > 0 && (
          <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#0d1220] p-5 text-left max-w-sm mx-auto mt-4">
            <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mb-3">Your Downloads</p>
            <ul className="space-y-2.5">
              {withDownloads.map((d, i) => (
                <li key={i}>
                  <a
                    href={d.download_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-[#0822C0] dark:text-blue-400 hover:underline"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {d.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 mt-4 rounded-xl bg-[#0822C0] text-white text-sm font-semibold px-6 py-3 hover:bg-[#061aa0] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-24 space-y-4">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-red-50 dark:bg-red-400/10 mb-2">
        <svg className="h-7 w-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment failed</h2>
      <p className="text-sm text-gray-400">{message}</p>
      <p className="text-xs text-gray-400">Please contact us if you were charged.</p>
      <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-[#0822C0] dark:text-blue-400 font-semibold">
        ← Back to Shop
      </Link>
    </div>
  );
}

export default function ShopVerifyPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading…</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
