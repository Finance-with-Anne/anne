"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "@/lib/admin-theme";
import ActionButton from "./ActionButton";
import type { Client } from "@/types";

export default function ClientList({ clients }: { clients: Client[] }) {
  const { dark } = useAdminTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const tHead = dark ? "text-white/30 border-white/5 bg-white/2" : "text-gray-400 border-gray-100 bg-gray-50";
  const tRow = dark ? "border-white/5 hover:bg-white/3" : "border-gray-100 hover:bg-gray-50";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/30" : "text-gray-400";
  const inputBg = dark ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20" : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400";
  const filterTab = (a: boolean) => a ? dark ? "bg-white/10 text-white" : "bg-brand text-white" : dark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100";

  const filtered = clients.filter(c => {
    const matchF = filter === "all" || c.status === filter;
    const matchS = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this client?")) return;
    setDeleting(id);
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    router.refresh();
    setDeleting(null);
  }

  const counts = { all: clients.length, active: clients.filter(c => c.status === "active").length, inactive: clients.filter(c => c.status === "inactive").length };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Clients</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{clients.length} total · {counts.active} active</p>
        </div>
        <ActionButton label="Add Client" onClick={() => router.push("/admin/clients/new")} />
      </div>

      <div className={`rounded-xl border ${card}`}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? "border-white/5" : "border-gray-100"}`}>
          <div className="flex items-center gap-1">
            {(["all", "active", "inactive"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filterTab(filter === f)}`}>
                {f} <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === f ? "bg-white/20" : dark ? "bg-white/5" : "bg-gray-200"}`}>{counts[f]}</span>
              </button>
            ))}
          </div>
          <input type="text" placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none w-48 ${inputBg}`} />
        </div>

        {filtered.length === 0 ? (
          <div className={`py-16 text-center text-sm ${sub}`}>No clients found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b text-xs uppercase tracking-wide ${tHead}`}>
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Email</th>
                <th className="px-5 py-3 text-left font-medium">Phone</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id} className={`border-b last:border-0 transition-colors ${tRow}`}>
                  <td className={`px-5 py-4 font-medium ${tText}`}>{client.name}</td>
                  <td className={`px-5 py-4 ${tSub}`}>{client.email}</td>
                  <td className={`px-5 py-4 ${tSub}`}>{client.phone ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${client.status === "active" ? dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${client.status === "active" ? "bg-green-400" : dark ? "bg-white/20" : "bg-gray-300"}`} />
                      {client.status}
                    </span>
                  </td>
                  <td className={`px-5 py-4 text-xs ${tSub}`}>{new Date(client.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/clients/${client.id}`} className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-white/60 hover:bg-white/5" : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"}`}>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                      <button onClick={() => handleDelete(client.id)} disabled={deleting === client.id} className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${dark ? "text-white/20 hover:text-red-400 hover:bg-red-400/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
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
