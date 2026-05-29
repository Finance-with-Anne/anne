"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import ActionButton from "./ActionButton";

type Tab = "campaigns" | "subscribers" | "compose";

interface Props { campaigns: any[]; subscribers: any[]; activeCount: number; }

export default function EmailPage({ campaigns, subscribers, activeCount }: Props) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("campaigns");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const tRow = dark ? "border-white/5 hover:bg-white/3" : "border-gray-100 hover:bg-gray-50";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/30" : "text-gray-400";
  const inputClass = dark ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const tabClass = (a: boolean) => a ? dark ? "bg-white/10 text-white" : "bg-brand text-white" : dark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-700";
  const divider = dark ? "border-white/5" : "border-gray-100";

  async function saveDraft() {
    if (!subject) return;
    setSaving(true);
    await fetch("/api/email/send-campaign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, body, save_only: true }) });
    setMsg("Draft saved.");
    setSaving(false);
    setTimeout(() => setMsg(""), 2000);
  }

  async function sendCampaign(campaignId: string) {
    if (!confirm(`Send this campaign to ${activeCount} subscribers?`)) return;
    setSending(true);
    const res = await fetch("/api/email/send-campaign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaignId }) });
    const data = await res.json();
    if (data.success) { setMsg(`Sent to ${data.sent} subscribers!`); router.refresh(); }
    setSending(false);
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Email</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{activeCount} active subscribers</p>
        </div>
        <ActionButton label="New Campaign" onClick={() => setTab("compose")} />
      </div>

      {msg && <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-xs text-green-400">{msg}</div>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Subscribers", value: subscribers.length },
          { label: "Active", value: activeCount },
          { label: "Campaigns Sent", value: campaigns.filter(c => c.status === "sent").length },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-5 ${card}`}>
            <p className={`text-xs ${sub}`}>{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${heading}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-1 p-1 rounded-xl border w-fit ${card}`}>
        {(["campaigns", "subscribers", "compose"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${tabClass(tab === t)}`}>{t}</button>
        ))}
      </div>

      {/* Campaigns */}
      {tab === "campaigns" && (
        <div className={`rounded-xl border ${card}`}>
          {campaigns.length === 0 ? (
            <div className={`py-16 text-center text-sm ${sub}`}>No campaigns yet. Create your first one.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wide ${dark ? "text-white/30 border-white/5 bg-white/2" : "text-gray-400 border-gray-100 bg-gray-50"}`}>
                  <th className="px-5 py-3 text-left font-medium">Subject</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className={`border-b last:border-0 transition-colors ${tRow}`}>
                    <td className={`px-5 py-3 font-medium ${tText}`}>{c.subject}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.status === "sent" ? dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"}`}>{c.status}</span>
                    </td>
                    <td className={`px-5 py-3 text-xs ${tSub}`}>{new Date(c.created_at).toLocaleDateString("en-GB")}</td>
                    <td className="px-5 py-3 text-right">
                      {c.status === "draft" && (
                        <button onClick={() => sendCampaign(c.id)} disabled={sending} className="text-xs text-brand font-medium hover:opacity-70">Send Now</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Subscribers */}
      {tab === "subscribers" && (
        <div className={`rounded-xl border ${card}`}>
          {subscribers.length === 0 ? (
            <div className={`py-16 text-center text-sm ${sub}`}>No subscribers yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wide ${dark ? "text-white/30 border-white/5 bg-white/2" : "text-gray-400 border-gray-100 bg-gray-50"}`}>
                  <th className="px-5 py-3 text-left font-medium">Email</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map(s => (
                  <tr key={s.id} className={`border-b last:border-0 transition-colors ${tRow}`}>
                    <td className={`px-5 py-3 font-medium ${tText}`}>{s.email}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.status === "active" ? dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"}`}>{s.status}</span>
                    </td>
                    <td className={`px-5 py-3 text-xs ${tSub}`}>{new Date(s.created_at).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Compose */}
      {tab === "compose" && (
        <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
          <p className={`text-sm font-semibold ${heading}`}>New Campaign</p>
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${sub}`}>Subject Line</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Your email subject…" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none ${inputClass}`} />
          </div>
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${sub}`}>Email Body (HTML supported)</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={10} placeholder="Write your email here…" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none resize-none font-mono ${inputClass}`} />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={saveDraft} disabled={saving} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{saving ? "Saving…" : "Save Draft"}</button>
            <p className={`text-xs ${sub}`}>Will send to {activeCount} subscribers</p>
          </div>
        </div>
      )}
    </div>
  );
}
