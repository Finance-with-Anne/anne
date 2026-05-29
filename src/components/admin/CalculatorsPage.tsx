"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminTheme } from "@/lib/admin-theme";

const CALCULATORS = [
  { id: "budget", title: "Budget Calculator", desc: "Help users plan their monthly income and expenses.", icon: "💰", href: "/calculators/budget", status: "planned" },
  { id: "savings", title: "Savings Goal", desc: "Calculate how long to reach a savings target.", icon: "🎯", href: "/calculators/savings", status: "planned" },
  { id: "debt", title: "Debt Payoff Planner", desc: "Snowball or avalanche debt payoff strategies.", icon: "📉", href: "/calculators/debt", status: "planned" },
  { id: "investment", title: "Investment Growth", desc: "Compound interest and portfolio growth projector.", icon: "📈", href: "/calculators/investment", status: "planned" },
  { id: "networth", title: "Net Worth Tracker", desc: "Assets vs liabilities net worth calculator.", icon: "🏦", href: "/calculators/networth", status: "planned" },
  { id: "emergency", title: "Emergency Fund", desc: "Calculate the right emergency fund size.", icon: "🛡️", href: "/calculators/emergency", status: "planned" },
  { id: "mortgage", title: "Mortgage Calculator", desc: "Monthly payment and affordability calculator.", icon: "🏠", href: "/calculators/mortgage", status: "planned" },
  { id: "pension", title: "Pension Planner", desc: "Estimate retirement income from pension contributions.", icon: "🧓", href: "/calculators/pension", status: "planned" },
];

export default function CalculatorsPage() {
  const { dark } = useAdminTheme();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const heading = dark ? "text-white" : "text-gray-900";
  const sub = dark ? "text-white/40" : "text-gray-400";
  const tText = dark ? "text-white/80" : "text-gray-700";

  return (
    <div className="space-y-5">
      <div>
        <h1 className={`text-xl font-bold ${heading}`}>Calculators</h1>
        <p className={`text-sm mt-0.5 ${sub}`}>Manage financial calculators shown on the public site.</p>
      </div>

      <div className={`rounded-xl border p-5 ${dark ? "border-blue-400/20 bg-blue-400/5" : "border-blue-200 bg-blue-50"}`}>
        <p className={`text-sm font-medium ${dark ? "text-blue-300" : "text-blue-700"}`}>Calculators are coming soon</p>
        <p className={`text-xs mt-1 ${dark ? "text-blue-400/60" : "text-blue-600/70"}`}>Enable the ones you want to build first and they will be shown on the public Resources page once live.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CALCULATORS.map(calc => (
          <div key={calc.id} className={`rounded-xl border p-5 ${card}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{calc.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${tText}`}>{calc.title}</p>
                  <p className={`text-xs mt-0.5 leading-relaxed ${sub}`}>{calc.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setEnabled(prev => ({ ...prev, [calc.id]: !prev[calc.id] }))}
                className={`relative shrink-0 h-5 w-9 rounded-full transition-colors ${enabled[calc.id] ? "bg-brand" : dark ? "bg-white/10" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled[calc.id] ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
            {enabled[calc.id] && (
              <div className={`mt-3 pt-3 border-t flex items-center justify-between ${dark ? "border-white/5" : "border-gray-100"}`}>
                <span className={`text-xs rounded-full px-2.5 py-0.5 ${dark ? "bg-green-400/15 text-green-400" : "bg-green-50 text-green-600"}`}>Enabled</span>
                <Link href={calc.href} className={`text-xs underline ${sub}`}>Preview →</Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
