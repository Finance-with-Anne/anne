"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setEmail(user.email ?? "");
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      setFullName(profile?.full_name ?? "");
      setLoading(false);
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSuccess(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ full_name: fullName, updated_at: new Date().toISOString() }).eq("id", user.id);
    setSaving(false); setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin h-5 w-5 text-gray-300" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
    </div>
  );

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">Update your account information.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0822C0]/40 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Email address</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
          />
          <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed here.</p>
        </div>

        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <span className="text-green-700 text-xs">Profile updated successfully.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#0822C0] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#061aa0] disabled:opacity-40 transition-colors"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
