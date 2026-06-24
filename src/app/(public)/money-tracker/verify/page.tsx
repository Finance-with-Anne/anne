"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type State = "loading" | "success" | "already" | "error";

function VerifyInner() {
  const params        = useSearchParams();
  const [state, setState] = useState<State>("loading");
  const [isNew, setIsNew] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const order_id       = params.get("order_id");
    const transaction_id = params.get("transaction_id");

    if (!order_id || !transaction_id) {
      setState("error");
      setErrMsg("Missing order or transaction info. Please contact support.");
      return;
    }

    fetch("/api/products/money-tracker/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id, transaction_id }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setState(json.already_paid ? "already" : "success");
          setIsNew(!!json.is_new_user);
        } else {
          setState("error");
          setErrMsg(json.error ?? "Payment verification failed.");
        }
      })
      .catch(() => {
        setState("error");
        setErrMsg("Network error. Please contact support.");
      });
  }, [params]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">

        {state === "loading" && (
          <div className="space-y-4">
            <div className="mx-auto h-14 w-14 rounded-full bg-[#0822C0]/10 dark:bg-[#0822C0]/20 flex items-center justify-center">
              <svg className="h-7 w-7 text-[#0822C0] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Confirming your payment…</h1>
            <p className="text-sm text-gray-500 dark:text-white/40">This will only take a moment.</p>
          </div>
        )}

        {(state === "success" || state === "already") && (
          <div className="space-y-5">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-50 dark:bg-green-400/10 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {state === "already" ? "Already confirmed!" : "Payment confirmed! 🎉"}
              </h1>
              <p className="mt-2 text-gray-500 dark:text-white/50 text-sm leading-relaxed">
                {state === "already"
                  ? "This payment was already processed. Check your email for the download link."
                  : "Check your inbox — we've sent you the download link for your Budget & Money Tracker."}
              </p>
              {isNew && (
                <div className="mt-4 rounded-xl bg-[#0822C0]/5 dark:bg-[#0822C0]/10 border border-[#0822C0]/15 p-4 text-left">
                  <p className="text-sm font-semibold text-[#0822C0] dark:text-blue-400 mb-1">Account created</p>
                  <p className="text-xs text-gray-500 dark:text-white/40">We've set up your Finance with Anne account. Check your email for login details.</p>
                </div>
              )}
            </div>
            <div className="pt-2">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-xl bg-[#0822C0] text-white font-semibold text-sm px-6 py-3 hover:bg-[#0618a0] transition-colors"
              >
                Go to my account
              </Link>
              <p className="mt-3 text-xs text-gray-400 dark:text-white/25">
                Didn&apos;t receive the email?{" "}
                <a href="mailto:contact@financewithanne.com" className="text-[#0822C0] dark:text-blue-400 underline">
                  Contact us
                </a>
              </p>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-5">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-50 dark:bg-red-400/10 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-white/50">{errMsg}</p>
            </div>
            <a
              href="mailto:contact@financewithanne.com"
              className="inline-flex items-center justify-center rounded-xl bg-gray-900 dark:bg-white/10 text-white font-semibold text-sm px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Contact support
            </a>
          </div>
        )}

      </div>
    </div>
  );
}

export default function MoneyTrackerVerify() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-[#0822C0]/10 flex items-center justify-center">
            <svg className="h-7 w-7 text-[#0822C0] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-white/40">Confirming your payment…</p>
        </div>
      </div>
    }>
      <VerifyInner />
    </Suspense>
  );
}
