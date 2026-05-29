import Link from "next/link";

const calculators = [
  { title: "Budget Calculator", desc: "Help users plan their monthly budget.", href: "/admin/calculators/budget", status: "planned" },
  { title: "Savings Goal", desc: "Calculate how long to reach a savings target.", href: "/admin/calculators/savings", status: "planned" },
  { title: "Debt Payoff", desc: "Snowball or avalanche debt payoff planner.", href: "/admin/calculators/debt", status: "planned" },
  { title: "Investment Growth", desc: "Compound interest and investment growth projector.", href: "/admin/calculators/investment", status: "planned" },
  { title: "Net Worth", desc: "Assets vs liabilities net worth tracker.", href: "/admin/calculators/networth", status: "planned" },
  { title: "Emergency Fund", desc: "Calculate the ideal emergency fund size.", href: "/admin/calculators/emergency", status: "planned" },
];

export default function AdminCalculatorsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calculators</h1>
          <p className="mt-1 text-sm text-gray-500">Manage financial calculators available on the site.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calculators.map((calc) => (
          <div
            key={calc.title}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <h2 className="text-sm font-semibold text-gray-900">{calc.title}</h2>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400 capitalize">{calc.status}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{calc.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
