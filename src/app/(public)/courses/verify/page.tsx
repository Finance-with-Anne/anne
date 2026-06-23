"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const courseId = params.get("course_id");
  const transactionId = params.get("transaction_id");
  const flwStatus = params.get("status");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!courseId || !transactionId) { setStatus("error"); setMessage("Missing payment reference."); return; }
    if (flwStatus === "cancelled") { setStatus("error"); setMessage("Payment was cancelled."); return; }

    fetch("/api/courses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId, transaction_id: transactionId }),
    })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setStatus("success");
          setTimeout(() => router.push(`/learn/${courseId}`), 2500);
        } else {
          setStatus("error");
          setMessage(j.error ?? "Verification failed.");
        }
      })
      .catch(() => { setStatus("error"); setMessage("Network error."); });
  }, [courseId, transactionId, flwStatus, router]);

  if (status === "loading") {
    return (
      <div className="text-center py-24">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#0822C0] border-t-transparent mb-4" />
        <p className="text-gray-500 dark:text-white/40 text-sm">Setting up your course access…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-24 space-y-5">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-50 dark:bg-green-400/10 mb-2">
          <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">You&apos;re enrolled!</h1>
        <p className="text-sm text-gray-500 dark:text-white/40 max-w-xs mx-auto">
          Payment confirmed. Redirecting you to your course…
        </p>
        <div className="flex justify-center">
          <div className="h-1.5 w-36 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden mt-2">
            <div className="h-full w-full bg-[#0822C0] rounded-full animate-pulse" />
          </div>
        </div>
        <Link
          href={`/learn/${courseId}`}
          className="inline-flex items-center gap-2 mt-2 text-sm text-[#0822C0] dark:text-blue-400 font-semibold"
        >
          Go to course →
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
      <p className="text-sm text-gray-400 dark:text-white/40">{message}</p>
      <p className="text-sm text-gray-400 dark:text-white/30">Please contact us if you were charged.</p>
      <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-[#0822C0] dark:text-blue-400 font-semibold">
        ← Browse courses
      </Link>
    </div>
  );
}

export default function CourseVerifyPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading…</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
