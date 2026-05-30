"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";

type Editor = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
};

const PERMISSIONS = [
  { icon: "M12 4v16m8-8H4", label: "Write & publish blog posts" },
  { icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z", label: "Manage categories" },
  { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", label: "View blog analytics" },
];

export default function EditorsPage({ initialEditors }: { initialEditors: Editor[] }) {
  const { dark } = useAdminTheme();
  const router   = useRouter();

  const [editors, setEditors] = useState<Editor[]>(initialEditors);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Editor | null>(null);
  const [error,  setError]    = useState("");
  const [success, setSuccess] = useState<{ editor: Editor; tempPassword: string } | null>(null);

  const [name,   setName]      = useState("");
  const [email,  setEmail]     = useState("");
  const [bio,    setBio]       = useState("");

  const card    = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const modal   = dark ? "bg-[#1c1f27] border-white/10" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub     = dark ? "text-white/40" : "text-gray-500";
  const inputCls = dark
    ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const divider = dark ? "border-white/5" : "border-gray-100";

  function resetForm() { setName(""); setEmail(""); setBio(""); setError(""); }

  async function handleAdd() {
    if (!name.trim() || !email.trim()) return setError("Name and email are required.");
    setSaving(true); setError("");
    const res  = await fetch("/api/editors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, bio }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create editor.");
    } else {
      setEditors(prev => [data.editor, ...prev]);
      setSuccess(data);
      setShowForm(false);
      resetForm();
    }
    setSaving(false);
  }

  async function handleDelete(editor: Editor) {
    setDeleting(editor.id);
    await fetch(`/api/editors/${editor.id}`, { method: "DELETE" });
    setEditors(prev => prev.filter(e => e.id !== editor.id));
    setDeleting(null);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <>
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Editors</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{editors.length} editor{editors.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setShowForm(true); resetForm(); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-brand transition-opacity hover:opacity-90">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Editor
        </button>
      </div>

      {/* Permission card */}
      <div className={`rounded-xl border p-5 ${card}`}>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${sub}`}>Editor Permissions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PERMISSIONS.map(p => (
            <div key={p.label} className={`flex items-center gap-3 rounded-lg p-3 ${dark ? "bg-white/3" : "bg-gray-50"}`}>
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-none ${dark ? "bg-green-500/15" : "bg-green-50"}`}>
                <svg className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={p.icon} />
                </svg>
              </div>
              <p className={`text-xs font-medium ${dark ? "text-white/60" : "text-gray-600"}`}>{p.label}</p>
            </div>
          ))}
        </div>
        <p className={`text-xs mt-3 ${dark ? "text-white/20" : "text-gray-400"}`}>
          Editors cannot access Bookings, Clients, Products, Courses, Email, YouTube, or admin settings.
        </p>
      </div>

      {/* Editors list */}
      {editors.length === 0 ? (
        <div className={`rounded-xl border py-16 text-center text-sm ${card} ${sub}`}>
          No editors yet. Add your first one above.
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${card}`}>
          <div className={`grid grid-cols-12 text-xs uppercase tracking-wide font-medium px-5 py-3 border-b ${dark ? "text-white/30 border-white/5" : "text-gray-400 border-gray-100 bg-gray-50"}`}>
            <div className="col-span-5">Editor</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Added</div>
            <div className="col-span-1" />
          </div>
          {editors.map(editor => (
            <div key={editor.id} className={`grid grid-cols-12 items-center px-5 py-4 border-b last:border-0 ${dark ? "border-white/5 hover:bg-white/2" : "border-gray-100 hover:bg-gray-50"} transition-colors`}>
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                {editor.avatar_url ? (
                  <img src={editor.avatar_url} alt={editor.name} className="h-9 w-9 rounded-full object-cover shrink-0 ring-1 ring-white/10" />
                ) : (
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${dark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-500"}`}>
                    {editor.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${heading}`}>{editor.name}</p>
                  {editor.bio && <p className={`text-xs truncate mt-0.5 ${sub}`}>{editor.bio}</p>}
                </div>
              </div>
              <div className={`col-span-4 text-sm truncate ${sub}`}>{editor.email}</div>
              <div className={`col-span-2 text-xs ${sub}`}>
                {new Date(editor.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => setDeleteTarget(editor)} disabled={deleting === editor.id}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* ══ ADD EDITOR MODAL ══ */}
    {showForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
        <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-5 ${modal}`} onClick={e => e.stopPropagation()}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-base font-bold ${heading}`}>Add Editor</p>
              <p className={`text-xs mt-0.5 ${sub}`}>An account will be created automatically.</p>
            </div>
            <button onClick={() => setShowForm(false)} className={`text-sm ${sub} hover:opacity-70`}>✕</button>
          </div>

          {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className={`text-xs font-medium ${sub}`}>Full Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amaka Okafor"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputCls}`} />
            </div>
            <div className="space-y-1.5">
              <label className={`text-xs font-medium ${sub}`}>Email Address *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="amaka@example.com"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors ${inputCls}`} />
            </div>
            <div className="space-y-1.5">
              <label className={`text-xs font-medium ${sub}`}>Bio <span className={sub}>(optional)</span></label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                placeholder="Short bio shown on published articles…"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-colors resize-none ${inputCls}`} />
            </div>
          </div>

          {/* Permission preview */}
          <div className={`rounded-xl p-4 space-y-2 ${dark ? "bg-white/3 border border-white/5" : "bg-gray-50 border border-gray-100"}`}>
            <p className={`text-xs font-semibold ${sub}`}>This editor will have access to:</p>
            {PERMISSIONS.map(p => (
              <div key={p.label} className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className={`text-xs ${dark ? "text-white/50" : "text-gray-500"}`}>{p.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              Cancel
            </button>
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover transition-colors disabled:opacity-50">
              {saving ? "Creating…" : "Create Editor"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ══ SUCCESS MODAL ══ */}
    {success && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-5 ${modal}`}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/15 flex items-center justify-center flex-none">
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className={`text-base font-bold ${heading}`}>Editor Created!</p>
              <p className={`text-xs mt-0.5 ${sub}`}>{success.editor.name} can now log in.</p>
            </div>
          </div>

          <div className={`rounded-xl p-4 space-y-3 ${dark ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-gray-100"}`}>
            <div>
              <p className={`text-xs font-medium ${sub}`}>Email</p>
              <p className={`text-sm font-semibold mt-0.5 ${heading}`}>{success.editor.email}</p>
            </div>
            <div>
              <p className={`text-xs font-medium ${sub}`}>Temporary Password</p>
              <div className="flex items-center gap-2 mt-0.5">
                <code className={`text-sm font-mono px-2 py-1 rounded ${dark ? "bg-white/10 text-white" : "bg-gray-200 text-gray-900"}`}>
                  {success.tempPassword}
                </code>
                <button onClick={() => navigator.clipboard.writeText(success.tempPassword)}
                  className={`text-xs ${sub} hover:opacity-70`}>Copy</button>
              </div>
            </div>
            <p className={`text-xs ${dark ? "text-amber-400/70" : "text-amber-600"}`}>
              Share these credentials with the editor. They should change their password after first login.
            </p>
          </div>

          <button onClick={() => setSuccess(null)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover transition-colors">
            Done
          </button>
        </div>
      </div>
    )}

    {/* ══ DELETE MODAL ══ */}
    {deleteTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
        <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${modal}`} onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-4 mb-5">
            <div className="h-11 w-11 rounded-full bg-red-500/15 flex items-center justify-center flex-none">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-bold ${heading}`}>Remove Editor</p>
              <p className={`text-xs mt-0.5 ${sub}`}>{deleteTarget.name}</p>
            </div>
          </div>
          <div className={`rounded-xl p-4 mb-4 ${dark ? "bg-red-500/5 border border-red-500/10" : "bg-red-50 border border-red-100"}`}>
            <p className={`text-sm ${dark ? "text-red-400" : "text-red-700"}`}>
              This will delete their account and they will no longer be able to log in.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setDeleteTarget(null)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              Cancel
            </button>
            <button onClick={() => handleDelete(deleteTarget)} disabled={deleting === deleteTarget.id}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {deleting === deleteTarget.id ? "Removing…" : "Remove Editor"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
