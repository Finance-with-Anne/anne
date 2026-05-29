"use client";

import { useAdminTheme } from "@/lib/admin-theme";
import { useRouter } from "next/navigation";

interface Props { subscriberCount: number; clientCount: number; recentSubscribers: any[]; }

export default function CommunityPage({ subscriberCount, clientCount, recentSubscribers }: Props) {
  const { dark } = useAdminTheme();
  const router = useRouter();

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const tRow = dark ? "border-white/5 hover:bg-white/3" : "border-gray-100 hover:bg-gray-50";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/30" : "text-gray-400";
  const divider = dark ? "border-white/5" : "border-gray-100";

  async function handleUnsubscribe(id: string) {
    await fetch("/api/subscribers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "unsubscribed" }) });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className={`text-xl font-bold ${heading}`}>Community</h1>
        <p className={`text-sm mt-0.5 ${sub}`}>Manage your subscribers and community members.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Email Subscribers", value: subscriberCount, icon: "📧" },
          { label: "Active Clients", value: clientCount, icon: "👥" },
          { label: "Total Community", value: subscriberCount + clientCount, icon: "🌍" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-5 ${card}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className={`text-xs ${sub}`}>{s.label}</p>
                <p className={`text-2xl font-bold ${heading}`}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-xl border ${card}`}>
        <div className={`px-5 py-4 border-b ${divider}`}>
          <p className={`text-sm font-semibold ${heading}`}>Recent Subscribers</p>
        </div>
        {recentSubscribers.length === 0 ? (
          <div className={`py-12 text-center text-sm ${sub}`}>No subscribers yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b text-xs uppercase tracking-wide ${dark ? "text-white/30 border-white/5 bg-white/2" : "text-gray-400 border-gray-100 bg-gray-50"}`}>
                <th className="px-5 py-3 text-left font-medium">Email</th>
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentSubscribers.map((s: any) => (
                <tr key={s.id} className={`border-b last:border-0 transition-colors ${tRow}`}>
                  <td className={`px-5 py-3 font-medium ${tText}`}>{s.email}</td>
                  <td className={`px-5 py-3 ${tSub}`}>{s.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.status === "active" ? dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"}`}>{s.status}</span>
                  </td>
                  <td className={`px-5 py-3 text-xs ${tSub}`}>{new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-5 py-3 text-right">
                    {s.status === "active" && (
                      <button onClick={() => handleUnsubscribe(s.id)} className="text-xs text-red-400 hover:opacity-70">Unsubscribe</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
