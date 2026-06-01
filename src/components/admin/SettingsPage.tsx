"use client";

import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme";

export default function SettingsPageClient({ role, email }: { role: string; email: string }) {
  const { dark, toggle } = useAdminTheme();
  const isEditor = role === "editor";

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-500";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const rowHover = dark ? "hover:bg-white/3" : "hover:bg-gray-50";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className={`text-xl font-bold ${heading}`}>Settings</h1>
        <p className={`text-sm mt-0.5 ${sub}`}>Manage your preferences.</p>
      </div>

      {/* Appearance */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className={`px-5 py-4 border-b ${divider}`}>
          <p className={`text-sm font-semibold ${heading}`}>Appearance</p>
          <p className={`text-xs mt-0.5 ${sub}`}>Choose how the dashboard looks.</p>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: "Light Mode", desc: "Clean white interface", value: false },
            { label: "Dark Mode",  desc: "Easier on the eyes at night", value: true  },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={() => { if (dark !== opt.value) toggle(); }}
              className={`w-full flex items-center justify-between rounded-xl border px-4 py-3.5 transition-all ${
                dark === opt.value
                  ? dark ? "border-brand/50 bg-brand/10" : "border-brand/40 bg-brand/5"
                  : dark ? "border-white/5 hover:border-white/10" : `border-gray-100 ${rowHover}`
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${dark === opt.value ? "bg-brand/20" : dark ? "bg-white/5" : "bg-gray-100"}`}>
                  {opt.value ? (
                    <svg className={`h-4 w-4 ${dark === opt.value ? "text-brand" : sub}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg className={`h-4 w-4 ${dark === opt.value ? "text-brand" : sub}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${dark === opt.value ? heading : sub}`}>{opt.label}</p>
                  <p className={`text-xs mt-0.5 ${sub}`}>{opt.desc}</p>
                </div>
              </div>
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${dark === opt.value ? "border-brand" : dark ? "border-white/20" : "border-gray-300"}`}>
                {dark === opt.value && <div className="h-2 w-2 rounded-full bg-brand" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className={`px-5 py-4 border-b ${divider}`}>
          <p className={`text-sm font-semibold ${heading}`}>Account</p>
        </div>
        <div className={`p-5 space-y-3`}>
          <div className={`flex items-center justify-between rounded-xl border px-4 py-3.5 ${dark ? "border-white/5" : "border-gray-100"}`}>
            <div>
              <p className={`text-sm font-medium ${heading}`}>Email Address</p>
              <p className={`text-xs mt-0.5 ${sub}`}>{email}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full ${dark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"}`}>Read-only</span>
          </div>

          <Link
            href="/admin/profile"
            className={`flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors group ${dark ? "border-white/5 hover:border-white/10 hover:bg-white/3" : `border-gray-100 ${rowHover}`}`}
          >
            <div>
              <p className={`text-sm font-medium ${heading}`}>Profile &amp; Password</p>
              <p className={`text-xs mt-0.5 ${sub}`}>Update your name, bio, and change your password.</p>
            </div>
            <svg className={`h-4 w-4 ${sub} group-hover:translate-x-0.5 transition-transform`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Admin-only: platform settings placeholder */}
      {!isEditor && (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <div className={`px-5 py-4 border-b ${divider}`}>
            <p className={`text-sm font-semibold ${heading}`}>Platform</p>
            <p className={`text-xs mt-0.5 ${sub}`}>Site-wide configuration.</p>
          </div>
          <div className={`px-5 py-10 text-center text-sm ${sub}`}>
            Platform settings coming soon.
          </div>
        </div>
      )}
    </div>
  );
}
