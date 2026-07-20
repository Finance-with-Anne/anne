import Link from "next/link";

export const metadata = { title: "Calculators | Finance with Anne" };

const CALCULATORS = [
  { title: "Net Worth Ledger", desc: "See everything you own minus everything you owe, in real time.", href: "/calculators/networth", live: true },
  { title: "Savings Goal", desc: "Work out how long it takes to hit a savings target.", href: "/calculators/savings-goal", live: true },
  { title: "Compound Interest", desc: "Project how your investments grow over time.", href: "/calculators/compound-interest", live: true },
  { title: "Emergency Fund Planner", desc: "Find the right emergency fund size for your expenses.", href: "/calculators/emergency-fund", live: false },
  { title: "Mortgage Calculator", desc: "Monthly repayments and affordability for a home loan.", href: "/calculators/mortgage", live: false },
  { title: "Treasury Bills Calculator", desc: "Work out returns on Nigerian Treasury Bills.", href: "/calculators/treasury-bills", live: true },
  { title: "Inflation Impact", desc: "See how inflation erodes the value of your money over time.", href: "/calculators/inflation-impact", live: false },
  { title: "Early Retirement (Retire Rich)", desc: "Estimate when you can retire on your own terms.", href: "/calculators/retire-rich", live: false },
];

export default function CalculatorsHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Calculators</h1>
      <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-white/60">
        Free tools to help you plan your money, built for Nigerians at home and abroad.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((calc) => {
          const card = (
            <div
              className={`h-full rounded-2xl border p-6 transition-colors ${
                calc.live
                  ? "border-gray-200 bg-white hover:border-[#0822C0]/40 dark:border-white/10 dark:bg-[#0d1220] dark:hover:border-[#0822C0]/60"
                  : "border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{calc.title}</h3>
                {!calc.live && (
                  <span className="shrink-0 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-white/40">
                    Coming soon
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-white/50">{calc.desc}</p>
              {calc.live && (
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0822C0] dark:text-[#7596F7]">
                  Open calculator
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              )}
            </div>
          );

          return calc.live ? (
            <Link key={calc.href} href={calc.href}>{card}</Link>
          ) : (
            <div key={calc.href} className="cursor-not-allowed opacity-80">{card}</div>
          );
        })}
      </div>
    </div>
  );
}
