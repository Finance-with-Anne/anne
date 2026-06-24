"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type State = "loading" | "success" | "already" | "error";

function VerifyInner() {
  const params = useSearchParams();
  const [state, setState] = useState<State>("loading");
  const [whatsappUrl, setWhatsappUrl] = useState("");
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

    fetch("/api/products/legacy-builders-network/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id, transaction_id }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setWhatsappUrl(json.whatsapp_url ?? "");
          setState(json.already_paid ? "already" : "success");
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
                  ? "This payment was already processed. Check your email for your access details."
                  : "Welcome to Legacy Builders Network! Click below to join the WhatsApp community and get your access details."}
              </p>
            </div>
            <div className="pt-2 space-y-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white font-semibold text-sm px-6 py-3 hover:bg-[#1ebe5a] transition-colors w-full"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Join the WhatsApp Community
                </a>
              )}
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 font-semibold text-sm px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors w-full"
              >
                Back to home
              </Link>
            </div>
            <p className="text-xs text-gray-400 dark:text-white/25">
              Didn&apos;t receive an email?{" "}
              <a href="mailto:contact@financewithanne.com" className="text-[#0822C0] dark:text-blue-400 underline">
                Contact us
              </a>
            </p>
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

export default function LBNVerify() {
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
