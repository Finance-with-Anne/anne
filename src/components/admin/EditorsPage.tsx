"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";

type Editor = {
  id: string;
  user_id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  verified: boolean;
  last_sign_in_at: string | null;
  post_count: number;
  created_at: string;
};

const PERMISSIONS = [
  { color: "green", label: "Write & publish blog posts", path: "M12 4v16m8-8H4" },
  { color: "green", label: "Manage categories", path: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" },
  { color: "green", label: "View blog analytics", path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

function initials(editor: Editor) {
  const fn = editor.first_name ?? editor.name.split(" ")[0] ?? "";
  const ln = editor.last_name ?? editor.name.split(" ")[1] ?? "";
  return (fn[0] ?? "") + (ln[0] ?? "");
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function timeAgo(d: string | null) {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
}

export default function EditorsPage({ initialEditors }: { initialEditors: Editor[] }) {
  const { dark } = useAdminTheme();
  const router = useRouter();

  const [editors, setEditors] = useState<Editor[]>(initialEditors);
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ editor: Editor; tempPassword: string } | null>(null);

  // Drawer: email compose
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showEmailCompose, setShowEmailCompose] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<Editor | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Close drawer on outside click
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedEditor(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function resetForm() {
    setFirstName(""); setLastName(""); setEmail(""); setBio("");
    setFormError("");
  }

  async function handleAdd() {
    if (!firstName.trim() || !email.trim()) return setFormError("First name and email are required.");
    setSaving(true); setFormError("");
    const res = await fetch("/api/editors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, bio }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFormError(data.error ?? "Failed to create editor.");
    } else {
      setEditors(prev => [data.editor, ...prev]);
      setSuccessInfo(data);
      resetForm();
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    await fetch(`/api/editors/${deleteConfirm.id}`, { method: "DELETE" });
    setEditors(prev => prev.filter(e => e.id !== deleteConfirm.id));
    if (selectedEditor?.id === deleteConfirm.id) setSelectedEditor(null);
    setDeleteConfirm(null);
    setDeleting(false);
    router.refresh();
  }

  async function handleSendEmail() {
    if (!selectedEditor || !emailSubject.trim() || !emailBody.trim()) return;
    setSendingEmail(true); setEmailError("");
    const res = await fetch(`/api/editors/${selectedEditor.id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: selectedEditor.email, subject: emailSubject, body: emailBody }),
    });
    if (res.ok) {
      setEmailSent(true);
      setEmailSubject(""); setEmailBody("");
      setTimeout(() => { setEmailSent(false); setShowEmailCompose(false); }, 2500);
    } else {
      const d = await res.json();
      setEmailError(d.error ?? "Failed to send.");
    }
    setSendingEmail(false);
  }

  // ─── Theme tokens ───────────────────────────────────────────
  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const drawerBg = dark ? "bg-[#111318] border-white/8" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-500";
  const inputCls = dark
    ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const rowHover = dark ? "hover:bg-white/3" : "hover:bg-gray-50";

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* ══ LEFT: Add form + permissions ══════════════════════════════════════ */}
      <div className="w-72 flex-none space-y-5 self-start sticky top-0">
        {/* Form card */}
        <div className={`rounded-2xl border p-5 space-y-4 ${card}`}>
          <div>
            <p className={`text-sm font-bold ${heading}`}>Add Editor</p>
            <p className={`text-xs mt-0.5 ${sub}`}>They'll receive login credentials by email.</p>
          </div>

          {formError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-xs text-red-400">
              {formError}
            </div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className={`text-xs font-medium ${sub}`}>First Name *</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Amaka"
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputCls}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-xs font-medium ${sub}`}>Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Okafor"
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputCls}`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-medium ${sub}`}>Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="amaka@example.com"
                className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputCls}`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-medium ${sub}`}>Bio <span className={sub}>(optional)</span></label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                placeholder="Short bio shown on published articles…"
                className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors resize-none ${inputCls}`}
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={saving}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-brand hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Creating…" : "Invite Editor →"}
          </button>
        </div>

        {/* Permissions card */}
        <div className={`rounded-2xl border p-5 space-y-3 ${card}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${sub}`}>Editor Permissions</p>
          {PERMISSIONS.map(p => (
            <div key={p.label} className="flex items-center gap-2.5">
              <div className="h-5 w-5 rounded-md bg-green-500/15 flex items-center justify-center flex-none">
                <svg className="h-2.5 w-2.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className={`text-xs ${dark ? "text-white/60" : "text-gray-600"}`}>{p.label}</p>
            </div>
          ))}
          <p className={`text-[11px] pt-1 ${dark ? "text-white/20" : "text-gray-400"}`}>
            Editors cannot access Bookings, Clients, Products, Courses, Email, or YouTube.
          </p>
        </div>
      </div>

      {/* ══ RIGHT: Editors list ══════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0">
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
            <div>
              <p className={`text-sm font-bold ${heading}`}>All Editors</p>
              <p className={`text-xs mt-0.5 ${sub}`}>{editors.length} editor{editors.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {editors.length === 0 ? (
            <div className={`py-20 text-center text-sm ${sub}`}>
              No editors yet. Add your first editor on the left.
            </div>
          ) : (
            <div>
              {editors.map((editor, i) => (
                <button
                  key={editor.id}
                  onClick={() => {
                    setSelectedEditor(editor);
                    setShowEmailCompose(false);
                    setEmailSent(false);
                    setEmailSubject("");
                    setEmailBody("");
                  }}
                  className={`w-full text-left flex items-center gap-4 px-5 py-4 border-b last:border-0 transition-colors ${divider} ${rowHover} ${selectedEditor?.id === editor.id ? dark ? "bg-white/5" : "bg-blue-50/60" : ""}`}
                >
                  {/* Avatar */}
                  {editor.avatar_url ? (
                    <img
                      src={editor.avatar_url}
                      alt={editor.name}
                      className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                    />
                  ) : (
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold uppercase ${dark ? "bg-white/10 text-white/70" : "bg-brand/10 text-brand"}`}>
                      {initials(editor) || editor.name[0]}
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${heading}`}>{editor.name}</p>
                      {editor.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${sub}`}>{editor.email}</p>
                  </div>

                  {/* Date */}
                  <div className={`text-xs text-right shrink-0 hidden sm:block ${sub}`}>
                    <p>Added {fmtDate(editor.created_at)}</p>
                    {editor.last_sign_in_at && (
                      <p className="mt-0.5">Last seen {timeAgo(editor.last_sign_in_at)}</p>
                    )}
                  </div>

                  {/* Chevron */}
                  <svg className={`h-4 w-4 shrink-0 ${sub}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ DRAWER ══════════════════════════════════════════════════════════ */}
      {/* Overlay */}
      {selectedEditor && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setSelectedEditor(null)}
        />
      )}

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full z-50 w-96 border-l shadow-2xl flex flex-col transition-transform duration-300 ease-out ${drawerBg} ${selectedEditor ? "translate-x-0" : "translate-x-full"}`}
      >
        {selectedEditor && (
          <>
            {/* Drawer header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
              <p className={`text-sm font-bold ${heading}`}>Editor Profile</p>
              <button
                onClick={() => setSelectedEditor(null)}
                className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/30 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

              {/* Profile */}
              <div className={`rounded-xl border p-4 ${dark ? "bg-white/3 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-start gap-4">
                  {selectedEditor.avatar_url ? (
                    <img src={selectedEditor.avatar_url} alt={selectedEditor.name}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10 shrink-0" />
                  ) : (
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold uppercase shrink-0 ${dark ? "bg-white/10 text-white/70" : "bg-brand/10 text-brand"}`}>
                      {initials(selectedEditor) || selectedEditor.name[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-base font-bold leading-tight ${heading}`}>{selectedEditor.name}</p>
                    <p className={`text-xs mt-0.5 truncate ${sub}`}>{selectedEditor.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedEditor.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
                          Pending login
                        </span>
                      )}
                      <span className={`text-[10px] ${sub}`}>Joined {fmtDate(selectedEditor.created_at)}</span>
                    </div>
                  </div>
                </div>
                {selectedEditor.bio && (
                  <p className={`mt-3 text-xs leading-relaxed ${dark ? "text-white/50" : "text-gray-500"}`}>
                    {selectedEditor.bio}
                  </p>
                )}
              </div>

              {/* Analytics */}
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${sub}`}>Analytics</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-xl border p-3 text-center ${dark ? "bg-white/3 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                    <p className={`text-2xl font-bold ${heading}`}>{selectedEditor.post_count}</p>
                    <p className={`text-[11px] mt-0.5 ${sub}`}>Posts written</p>
                  </div>
                  <div className={`rounded-xl border p-3 text-center ${dark ? "bg-white/3 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                    <p className={`text-sm font-bold ${heading}`}>{timeAgo(selectedEditor.last_sign_in_at)}</p>
                    <p className={`text-[11px] mt-0.5 ${sub}`}>Last active</p>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${sub}`}>Actions</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowEmailCompose(v => !v); setEmailSent(false); setEmailError(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5 hover:text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Email
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedEditor.email)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5 hover:text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Email
                  </button>
                </div>
              </div>

              {/* Email compose */}
              {showEmailCompose && (
                <div className={`rounded-xl border p-4 space-y-3 ${dark ? "bg-white/3 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                  <p className={`text-xs font-semibold ${heading}`}>Compose email to {selectedEditor.first_name ?? selectedEditor.name.split(" ")[0]}</p>

                  {emailSent && (
                    <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2.5 text-xs text-green-500 flex items-center gap-2">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Email sent!
                    </div>
                  )}
                  {emailError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-xs text-red-400">{emailError}</div>
                  )}

                  <div className="space-y-1">
                    <label className={`text-[11px] font-medium ${sub}`}>Subject</label>
                    <input
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder="e.g. Welcome to Finance with Anne"
                      className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputCls}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[11px] font-medium ${sub}`}>Message</label>
                    <textarea
                      value={emailBody}
                      onChange={e => setEmailBody(e.target.value)}
                      rows={5}
                      placeholder="Write your message here…"
                      className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors resize-none ${inputCls}`}
                    />
                  </div>
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-brand hover:bg-brand-hover transition-colors disabled:opacity-50"
                  >
                    {sendingEmail ? "Sending…" : "Send Email"}
                  </button>
                </div>
              )}

              {/* Danger zone */}
              <div className={`rounded-xl border p-4 ${dark ? "border-red-500/10 bg-red-500/5" : "border-red-100 bg-red-50/50"}`}>
                <p className={`text-xs font-semibold mb-2 ${dark ? "text-red-400" : "text-red-700"}`}>Danger Zone</p>
                <p className={`text-[11px] mb-3 ${dark ? "text-red-400/60" : "text-red-600/70"}`}>
                  Removing this editor will delete their account and revoke all access.
                </p>
                <button
                  onClick={() => setDeleteConfirm(selectedEditor)}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-red-500 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                >
                  Remove Editor
                </button>
              </div>

            </div>
          </>
        )}
      </div>

      {/* ══ SUCCESS MODAL ══════════════════════════════════════════════════ */}
      {successInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-5 ${dark ? "bg-[#1c1f27] border-white/10" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/15 flex items-center justify-center flex-none">
                <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className={`text-base font-bold ${heading}`}>Editor Created!</p>
                <p className={`text-xs mt-0.5 ${sub}`}>{successInfo.editor.name} can now log in.</p>
              </div>
            </div>

            <div className={`rounded-xl p-4 space-y-3 ${dark ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-gray-100"}`}>
              <div>
                <p className={`text-xs font-medium ${sub}`}>Login Email</p>
                <p className={`text-sm font-semibold mt-0.5 ${heading}`}>{successInfo.editor.email}</p>
              </div>
              <div>
                <p className={`text-xs font-medium ${sub}`}>Temporary Password</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className={`flex-1 text-sm font-mono px-2.5 py-1.5 rounded-lg ${dark ? "bg-white/10 text-white" : "bg-gray-200 text-gray-900"}`}>
                    {successInfo.tempPassword}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(successInfo.tempPassword)}
                    className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${dark ? "border-white/10 text-white/50 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <p className={`text-xs ${dark ? "text-amber-400/70" : "text-amber-600"}`}>
                Share these credentials with the editor. They should change their password after first login.
              </p>
            </div>

            <button
              onClick={() => setSuccessInfo(null)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM MODAL ═══════════════════════════════════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 space-y-4 ${dark ? "bg-[#1c1f27] border-white/10" : "bg-white border-gray-200"}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-red-500/15 flex items-center justify-center flex-none">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-bold ${heading}`}>Remove Editor?</p>
                <p className={`text-xs mt-0.5 ${sub}`}>{deleteConfirm.name}</p>
              </div>
            </div>
            <p className={`text-sm ${dark ? "text-white/50" : "text-gray-500"}`}>
              This will permanently delete their account. This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setDeleteConfirm(null)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
