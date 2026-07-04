"use client";

import { useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

type OrderItem = { id: string; name: string; qty: number; price: number };

type Order = {
  id: string;
  email: string;
  name: string | null;
  items: OrderItem[];
  total: number;
  currency: string;
  status: string;
  tx_ref: string | null;
  transaction_id: string | null;
  user_id: string | null;
  created_at: string;
};

function sym(currency: string) {
  if (currency === "GBP") return "£";
  if (currency === "USD") return "$";
  return "₦";
}

export default function OrdersList({ orders }: { orders: Order[] }) {
  const { dark } = useAdminTheme();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const tHead = dark ? "text-white/30 border-white/5 bg-white/2" : "text-gray-400 border-gray-100 bg-gray-50";
  const tRow = dark ? "border-white/5 hover:bg-white/3" : "border-gray-100 hover:bg-gray-50";
  const tText = dark ? "text-white/80" : "text-gray-800";
  const tSub = dark ? "text-white/30" : "text-gray-400";
  const inputBg = dark ? "bg-white/5 border-white/5 text-white/70 placeholder-white/20" : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400";
  const filterTab = (a: boolean) => a ? dark ? "bg-white/10 text-white" : "bg-brand text-white" : dark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100";

  const filtered = orders.filter(o => {
    const matchF = filter === "all" || o.status === filter;
    const q = search.toLowerCase();
    const matchS = !q
      || o.email.toLowerCase().includes(q)
      || (o.name ?? "").toLowerCase().includes(q)
      || (o.tx_ref ?? "").toLowerCase().includes(q)
      || o.items.some(i => i.name.toLowerCase().includes(q));
    return matchF && matchS;
  });

  const counts = {
    all: orders.length,
    paid: orders.filter(o => o.status === "paid").length,
    pending: orders.filter(o => o.status === "pending").length,
  };
  const totalRevenue = orders.filter(o => o.status === "paid").reduce((s, o) => s + (o.total ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>Orders</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>
            {orders.length} total · {counts.paid} paid · ₦{totalRevenue.toLocaleString()} revenue
          </p>
        </div>
      </div>

      <div className={`rounded-xl border ${card}`}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? "border-white/5" : "border-gray-100"}`}>
          <div className="flex items-center gap-1">
            {(["all", "paid", "pending"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filterTab(filter === f)}`}>
                {f} <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === f ? "bg-white/20" : dark ? "bg-white/5" : "bg-gray-200"}`}>{counts[f]}</span>
              </button>
            ))}
          </div>
          <input type="text" placeholder="Search orders…" value={search} onChange={e => setSearch(e.target.value)} className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none w-56 ${inputBg}`} />
        </div>

        {filtered.length === 0 ? (
          <div className={`py-16 text-center text-sm ${sub}`}>No orders found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b text-xs uppercase tracking-wide ${tHead}`}>
                <th className="px-5 py-3 text-left font-medium">Customer</th>
                <th className="px-5 py-3 text-left font-medium">Product</th>
                <th className="px-5 py-3 text-left font-medium">Amount</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Reference</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className={`border-b last:border-0 transition-colors ${tRow}`}>
                  <td className={`px-5 py-4 ${tText}`}>
                    <div className="font-medium">{order.name ?? order.email.split("@")[0]}</div>
                    <div className={`text-xs ${tSub}`}>{order.email}</div>
                  </td>
                  <td className={`px-5 py-4 ${tSub}`}>
                    {order.items.map(i => `${i.name} ×${i.qty}`).join(", ")}
                  </td>
                  <td className={`px-5 py-4 font-medium ${tText}`}>{sym(order.currency)}{(order.total ?? 0).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${order.status === "paid" ? dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-yellow-400/15 text-yellow-400" : "bg-yellow-50 text-yellow-600"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${order.status === "paid" ? "bg-green-400" : "bg-yellow-400"}`} />
                      {order.status}
                    </span>
                  </td>
                  <td className={`px-5 py-4 text-xs font-mono ${tSub}`}>{order.transaction_id ?? order.tx_ref ?? "—"}</td>
                  <td className={`px-5 py-4 text-xs ${tSub}`}>{new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
