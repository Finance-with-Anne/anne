"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  full_name: string;
  bio: string;
  phone: string;
  location: string;
  website: string;
  avatar_url: string | null;
};

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [hasEmailProvider, setHasEmailProvider] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Profile>({
    full_name: "", bio: "", phone: "", location: "", website: "", avatar_url: null,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState("");

  const [savingBio, setSavingBio] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");
      setMemberSince(new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
      setHasEmailProvider(user.identities?.some(i => i.provider === "email") ?? false);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (p) setProfile({ full_name: p.full_name ?? "", bio: p.bio ?? "", phone: p.phone ?? "", location: p.location ?? "", website: p.website ?? "", avatar_url: p.avatar_url ?? null });
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setAvatarError("Image must be under 3 MB."); return; }
    setAvatarError("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleAvatarSave() {
    if (!avatarFile || !userId) return;
    setAvatarUploading(true);
    const ext = avatarFile.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
    if (error) { setAvatarError(error.message); setAvatarUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq("id", userId);
    setProfile(p => ({ ...p, avatar_url: publicUrl }));
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarUploading(false);
  }

  async function handleSaveInfo() {
    setSavingInfo(true); setInfoSuccess(false); setInfoError("");
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, phone: profile.phone,
      location: profile.location, website: profile.website,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);
    setSavingInfo(false);
    if (error) setInfoError(error.message);
    else { setInfoSuccess(true); setTimeout(() => setInfoSuccess(false), 3000); }
  }

  async function handleSaveBio() {
    setSavingBio(true); setBioSuccess(false);
    await supabase.from("profiles").update({ bio: profile.bio, updated_at: new Date().toISOString() }).eq("id", userId);
    setSavingBio(false); setBioSuccess(true);
    setTimeout(() => setBioSuccess(false), 3000);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(""); setPasswordSuccess(false);
    if (newPassword !== confirmPassword) { setPasswordError("New passwords do not match."); return; }
    if (newPassword.length < 8) { setPasswordError("Password must be at least 8 characters."); return; }
    setSavingPassword(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (authError) { setSavingPassword(false); setPasswordError("Current password is incorrect."); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) setPasswordError(error.message);
    else {
      setPasswordSuccess(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    }
  }

  const initials = profile.full_name
    ? profile.full_name.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : email[0]?.toUpperCase() ?? "?";
  const avatarSrc = avatarPreview ?? profile.avatar_url;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin h-5 w-5 text-gray-300" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your personal information and account settings.</p>
      </div>

      {/* ── Avatar card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-white/10">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[#0822C0] flex items-center justify-center text-white text-2xl font-bold select-none">
                  {initials}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Change photo"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white dark:bg-[#10141c] border border-gray-200 dark:border-white/10 shadow flex items-center justify-center text-gray-500 hover:text-[#0822C0] transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900">{profile.full_name || "Your Name"}</p>
            <p className="text-sm text-gray-400">{email}</p>
            <p className="text-xs text-gray-400 mt-0.5">Member since {memberSince}</p>
          </div>

          {/* Avatar actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {avatarFile ? (
              <>
                <button onClick={() => { setAvatarFile(null); setAvatarPreview(null); }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                <button onClick={handleAvatarSave} disabled={avatarUploading} className="rounded-lg bg-[#0822C0] text-white text-xs font-semibold px-4 py-2 hover:bg-[#061aa0] disabled:opacity-50 transition-colors">
                  {avatarUploading ? "Uploading…" : "Save photo"}
                </button>
              </>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 px-4 py-2 hover:border-[#0822C0]/40 hover:text-[#0822C0] transition-colors">
                Change photo
              </button>
            )}
          </div>
        </div>
        {avatarError && <p className="text-xs text-red-500 mt-3">{avatarError}</p>}
        <p className="text-[11px] text-gray-400 mt-3">JPG, PNG or WebP · Max 3 MB</p>
      </div>

      {/* ── Personal info ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Personal Information</h2>
          <p className="text-xs text-gray-400 mt-0.5">Your name, contact details and links</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" value={profile.full_name} onChange={v => setProfile(p => ({ ...p, full_name: v }))} placeholder="Your full name" />
            <Field label="Phone" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} placeholder="+234 800 000 0000" type="tel" />
            <Field label="Location" value={profile.location} onChange={v => setProfile(p => ({ ...p, location: v }))} placeholder="Lagos, Nigeria" />
            <Field label="Website" value={profile.website} onChange={v => setProfile(p => ({ ...p, website: v }))} placeholder="https://yoursite.com" type="url" />
          </div>

          {/* Email — read-only */}
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Email address</p>
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5">
              <svg className="h-4 w-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <span className="text-sm text-gray-400 flex-1">{email}</span>
              <span className="text-[10px] font-semibold text-gray-300 bg-gray-100 rounded-full px-2 py-0.5">Read-only</span>
            </div>
          </div>

          {infoError && <p className="text-xs text-red-500">{infoError}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button onClick={handleSaveInfo} disabled={savingInfo} className="rounded-lg bg-[#0822C0] text-white text-xs font-semibold px-5 py-2.5 hover:bg-[#061aa0] disabled:opacity-50 transition-colors">
              {savingInfo ? "Saving…" : "Save changes"}
            </button>
            {infoSuccess && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Saved</span>}
          </div>
        </div>
      </div>

      {/* ── About / Bio ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">About Me</h2>
          <p className="text-xs text-gray-400 mt-0.5">A short bio others can see on your profile</p>
        </div>
        <div className="p-6 space-y-3">
          <textarea
            value={profile.bio}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value.slice(0, 500) }))}
            rows={5}
            placeholder="Tell us a bit about yourself — your background, interests, and what brings you to Finance with Anne…"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#0822C0]/40 transition-colors resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleSaveBio} disabled={savingBio} className="rounded-lg bg-[#0822C0] text-white text-xs font-semibold px-5 py-2.5 hover:bg-[#061aa0] disabled:opacity-50 transition-colors">
                {savingBio ? "Saving…" : "Save bio"}
              </button>
              {bioSuccess && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Saved</span>}
            </div>
            <span className={`text-[11px] tabular-nums ${profile.bio.length > 450 ? "text-orange-500" : "text-gray-400"}`}>{profile.bio.length}/500</span>
          </div>
        </div>
      </div>

      {/* ── Security ─────────────────────────────────────────────────────── */}
      {hasEmailProvider ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Security</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update your account password</p>
          </div>
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            <PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordField label="New password" value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew(v => !v)} hint="At least 8 characters" />
              <PasswordField label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} show={showNew} />
            </div>

            {passwordError && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                <svg className="h-4 w-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-xs text-red-600">{passwordError}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword} className="rounded-lg bg-[#0822C0] text-white text-xs font-semibold px-5 py-2.5 hover:bg-[#061aa0] disabled:opacity-50 transition-colors">
                {savingPassword ? "Updating…" : "Update password"}
              </button>
              {passwordSuccess && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Password updated</span>}
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Password managed externally</p>
            <p className="text-xs text-gray-400 mt-1">Your account uses a third-party sign-in provider. Manage your password through that service.</p>
          </div>
        </div>
      )}

      {/* ── Account summary ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Account</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { label: "Email", value: email },
            { label: "Member since", value: memberSince },
            { label: "Sign-in method", value: hasEmailProvider ? "Email & password" : "Social / OAuth" },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-6 py-3.5">
              <span className="text-xs text-gray-400">{row.label}</span>
              <span className="text-xs font-medium text-gray-700">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#0822C0]/40 transition-colors"
      />
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle?: () => void; hint?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete="off"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:border-[#0822C0]/40 transition-colors"
        />
        {onToggle && (
          <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {show ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
