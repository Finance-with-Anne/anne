"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAdminTheme } from "@/lib/admin-theme";

type Props = {
  userId: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: "admin" | "editor";
  editorId: string | null;
  bio: string | null;
};

export default function ProfilePageClient({ userId, email, name, firstName, lastName, role, editorId, bio: initialBio }: Props) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const supabase = createClient();
  const isEditor = role === "editor";

  // Profile fields
  const [fn, setFn] = useState(firstName || name.split(" ")[0] || "");
  const [ln, setLn] = useState(lastName || name.split(" ").slice(1).join(" ") || "");
  const [bio, setBio] = useState(initialBio ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Password fields
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Theme tokens
  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-500";
  const inputCls = dark
    ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const divider = dark ? "border-white/5" : "border-gray-100";

  async function handleProfileSave() {
    setProfileSaving(true);
    setProfileMsg(null);
    const fullName = [fn.trim(), ln.trim()].filter(Boolean).join(" ");

    // Update Supabase auth metadata
    const { error: authErr } = await supabase.auth.updateUser({
      data: { name: fullName, first_name: fn.trim(), last_name: ln.trim() },
    });

    if (authErr) {
      setProfileMsg({ type: "err", text: authErr.message });
      setProfileSaving(false);
      return;
    }

    // If editor, also update the editors table record
    if (isEditor && editorId) {
      await fetch(`/api/editors/${editorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, first_name: fn.trim(), last_name: ln.trim(), bio: bio.trim() || null }),
      });
    }

    setProfileMsg({ type: "ok", text: "Profile updated." });
    router.refresh();
    setProfileSaving(false);
  }

  async function handlePasswordChange() {
    if (!newPass) return setPassMsg({ type: "err", text: "Enter a new password." });
    if (newPass.length < 8) return setPassMsg({ type: "err", text: "Password must be at least 8 characters." });
    if (newPass !== confirmPass) return setPassMsg({ type: "err", text: "Passwords do not match." });

    setPassSaving(true);
    setPassMsg(null);

    const { error } = await supabase.auth.updateUser({ password: newPass });

    if (error) {
      setPassMsg({ type: "err", text: error.message });
    } else {
      setPassMsg({ type: "ok", text: "Password changed successfully." });
      setNewPass(""); setConfirmPass("");
    }
    setPassSaving(false);
  }

  const displayName = [fn, ln].filter(Boolean).join(" ") || "Editor";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className={`text-xl font-bold ${heading}`}>My Profile</h1>
        <p className={`text-sm mt-0.5 ${sub}`}>Manage your account details and password.</p>
      </div>

      {/* ── Identity card ─────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className={`px-5 py-4 border-b ${divider}`}>
          <p className={`text-sm font-semibold ${heading}`}>Profile</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar row */}
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold uppercase shrink-0 ${dark ? "bg-white/10 text-white/70" : "bg-brand/10 text-brand"}`}>
              {displayName[0] ?? "?"}
            </div>
            <div>
              <p className={`text-sm font-semibold ${heading}`}>{displayName}</p>
              <p className={`text-xs mt-0.5 ${sub}`}>{email}</p>
              <span className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${isEditor ? dark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600" : dark ? "bg-purple-500/15 text-purple-400" : "bg-purple-50 text-purple-600"}`}>
                {isEditor ? "Editor" : "Admin"}
              </span>
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={`text-xs font-medium ${sub}`}>First Name</label>
              <input
                value={fn}
                onChange={e => setFn(e.target.value)}
                placeholder="First name"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputCls}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-xs font-medium ${sub}`}>Last Name</label>
              <input
                value={ln}
                onChange={e => setLn(e.target.value)}
                placeholder="Last name"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputCls}`}
              />
            </div>
          </div>

          {/* Email — read only */}
          <div className="space-y-1.5">
            <label className={`text-xs font-medium ${sub}`}>Email Address</label>
            <input
              value={email}
              disabled
              className={`w-full rounded-lg border px-3 py-2.5 text-sm opacity-50 cursor-not-allowed ${inputCls}`}
            />
            <p className={`text-[11px] ${sub}`}>Email cannot be changed here. Contact the main admin if needed.</p>
          </div>

          {/* Bio — editors only */}
          {isEditor && (
            <div className="space-y-1.5">
              <label className={`text-xs font-medium ${sub}`}>Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                placeholder="Short bio shown on your published articles…"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors resize-none ${inputCls}`}
              />
            </div>
          )}

          {profileMsg && (
            <div className={`rounded-lg px-4 py-3 text-xs ${profileMsg.type === "ok" ? "bg-green-500/10 border border-green-500/20 text-green-500" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
              {profileMsg.text}
            </div>
          )}

          <button
            onClick={handleProfileSave}
            disabled={profileSaving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {profileSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ── Password card ─────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className={`px-5 py-4 border-b ${divider}`}>
          <p className={`text-sm font-semibold ${heading}`}>Change Password</p>
          <p className={`text-xs mt-0.5 ${sub}`}>Choose a strong password of at least 8 characters.</p>
        </div>

        <div className="p-5 space-y-4">
          {isEditor && (
            <div className={`rounded-xl px-4 py-3 text-xs flex items-start gap-2.5 ${dark ? "bg-amber-500/8 border border-amber-500/15 text-amber-400" : "bg-amber-50 border border-amber-100 text-amber-700"}`}>
              <svg className="h-3.5 w-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              You were given a temporary password. Change it now to secure your account.
            </div>
          )}

          <div className="space-y-1.5">
            <label className={`text-xs font-medium ${sub}`}>New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="At least 8 characters"
                className={`w-full rounded-lg border px-3 py-2.5 pr-16 text-sm focus:outline-none transition-colors ${inputCls}`}
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${sub} hover:opacity-70`}
              >
                {showNew ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-medium ${sub}`}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Repeat new password"
                className={`w-full rounded-lg border px-3 py-2.5 pr-16 text-sm focus:outline-none transition-colors ${inputCls}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${sub} hover:opacity-70`}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Strength indicator */}
          {newPass && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[8, 12, 16].map((len, i) => (
                  <div
                    key={len}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      newPass.length >= len
                        ? i === 0 ? "bg-red-400" : i === 1 ? "bg-amber-400" : "bg-green-400"
                        : dark ? "bg-white/10" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-[11px] ${sub}`}>
                {newPass.length < 8 ? "Too short" : newPass.length < 12 ? "Weak" : newPass.length < 16 ? "Good" : "Strong"}
              </p>
            </div>
          )}

          {passMsg && (
            <div className={`rounded-lg px-4 py-3 text-xs ${passMsg.type === "ok" ? "bg-green-500/10 border border-green-500/20 text-green-500" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
              {passMsg.text}
            </div>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={passSaving || !newPass || !confirmPass}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {passSaving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
