"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";

interface ClientFormProps {
  initialData?: { id?: string; name?: string; email?: string; phone?: string; status?: string; notes?: string };
}

export default function ClientForm({ initialData }: ClientFormProps) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "active");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const labelClass = dark ? "text-white/40" : "text-gray-500";
  const inputClass = dark ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";

  async function handleSave() {
    if (!name || !email) return setError("Name and email are required.");
    setSaving(true); setError("");
    const body = { name, email, phone: phone || null, status, notes: notes || null };
    const endpoint = initialData?.id ? `/api/clients/${initialData.id}` : "/api/clients";
    const method = initialData?.id ? "PATCH" : "POST";
    const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save."); } else { router.push("/admin/clients"); }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className={`text-xl font-bold ${heading}`}>{initialData?.id ? "Edit Client" : "New Client"}</h1>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50">{saving ? "Saving…" : "Save Client"}</button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>}

      <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none ${inputClass}`} />
          </div>
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none ${inputClass}`}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div>
          <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none ${inputClass}`} />
        </div>
        <div>
          <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Phone (optional)</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7700 000000" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none ${inputClass}`} />
        </div>
        <div>
          <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Any notes about this client…" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none resize-none ${inputClass}`} />
        </div>
      </div>
    </div>
  );
}
