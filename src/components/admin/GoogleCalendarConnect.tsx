"use client";

import { useSearchParams } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import { Suspense } from "react";

function ConnectContent({ isConnected, connectedAt }: { isConnected: boolean; connectedAt: string | null }) {
  const { dark } = useAdminTheme();
  const searchParams = useSearchParams();
  const justConnected = searchParams.get("connected") === "1";
  const error = searchParams.get("error");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-500";

  return (
    <div className={`rounded-xl border ${card} p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Google icon */}
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${dark ? "bg-white/5" : "bg-gray-100"}`}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div>
            <p className={`font-semibold text-sm ${heading}`}>Google Calendar</p>
            <p className={`text-xs mt-0.5 ${sub}`}>
              Auto-creates a Google Meet link for every confirmed booking
            </p>
          </div>
        </div>

        {isConnected ? (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600"}`}>
            Connected
          </span>
        ) : (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${dark ? "bg-white/8 text-white/30" : "bg-gray-100 text-gray-400"}`}>
            Not connected
          </span>
        )}
      </div>

      {(justConnected || isConnected) && connectedAt && (
        <p className={`text-xs mt-4 ${sub}`}>
          Last authorized: {new Date(connectedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-3">Connection failed. Please try again.</p>
      )}

      {justConnected && (
        <p className={`text-xs mt-3 ${dark ? "text-green-400" : "text-green-600"}`}>
          Google Calendar connected. Meet links will now be created automatically.
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <a
          href="/api/auth/google-calendar"
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            isConnected
              ? dark ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              : "bg-brand text-white hover:opacity-90"
          }`}
        >
          {isConnected ? "Reconnect" : "Connect Google Calendar"}
        </a>
        {!isConnected && (
          <p className={`text-xs ${sub}`}>You&apos;ll be redirected to Google to authorise access.</p>
        )}
      </div>

      <div className={`mt-5 rounded-lg p-3 text-xs space-y-1 ${dark ? "bg-white/3 text-white/30" : "bg-gray-50 text-gray-400"}`}>
        <p className="font-semibold">Setup required in Google Cloud Console:</p>
        <p>1. Create a project → enable <strong>Google Calendar API</strong></p>
        <p>2. Create OAuth 2.0 credentials (Web application)</p>
        <p>3. Add <code className="font-mono">{process.env.NEXT_PUBLIC_SITE_URL ?? "https://yoursite.com"}/api/auth/google-calendar/callback</code> as an authorised redirect URI</p>
        <p>4. Add <strong>GOOGLE_CLIENT_ID</strong> and <strong>GOOGLE_CLIENT_SECRET</strong> to your environment variables</p>
      </div>
    </div>
  );
}

export default function GoogleCalendarConnect({ isConnected, connectedAt }: { isConnected: boolean; connectedAt: string | null }) {
  return (
    <Suspense fallback={null}>
      <ConnectContent isConnected={isConnected} connectedAt={connectedAt} />
    </Suspense>
  );
}
