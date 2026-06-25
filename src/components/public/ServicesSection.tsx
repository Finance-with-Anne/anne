import Link from "next/link";

const IC = "#6d78c4";

function SphereIcon({
  lines,
  rx,
  ry,
  stroke = IC,
}: {
  lines: number;
  rx: number;
  ry: number;
  stroke?: string;
}) {
  return (
    <svg viewBox="0 0 80 80" width="68" height="68" fill="none" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <ellipse
          key={i}
          cx="40"
          cy="40"
          rx={rx}
          ry={ry}
          stroke={stroke}
          strokeWidth="0.65"
          opacity="0.72"
          transform={`rotate(${(i * 180) / lines} 40 40)`}
        />
      ))}
    </svg>
  );
}

const ROW1 = [
  { name: "Stock Signals",     lines: 12, rx: 30, ry: 9  },
  { name: "Smart Money Moves", lines: 18, rx: 27, ry: 7  },
  { name: "Expert Sessions",   lines: 10, rx: 26, ry: 14 },
  { name: "Exclusive Analysis",lines: 12, rx: 30, ry: 10 },
];

const WHITE_CARD = "rounded-2xl border border-gray-100 bg-white p-7 flex flex-col gap-10 min-h-[260px] justify-between";

export default function ServicesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 sm:px-8 py-20">

      {/* ── Header row ── */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-16 mb-14">
        <div className="flex-1">
          <span className="inline-block rounded border border-gray-200 px-3 py-1 text-xs text-gray-500 mb-5">
            Services Offered
          </span>
          <h2
            className="text-5xl sm:text-6xl leading-[1.05] text-gray-900"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}
          >
            My Consulting and
            <br />
            Coaching Services
          </h2>
        </div>
        <div className="lg:max-w-[340px] lg:pt-16">
          <p className="text-gray-400 text-sm leading-relaxed">
            Practical, relatable financial guidance designed to help you earn more,
            manage your money wisely, and grow long-term wealth with confidence
          </p>
        </div>
      </div>

      {/* ── Row 1: 4 equal white cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {ROW1.map((svc) => (
          <div key={svc.name} className={WHITE_CARD}>
            <SphereIcon lines={svc.lines} rx={svc.rx} ry={svc.ry} />
            <p className="text-gray-900 text-lg font-light">{svc.name}</p>
          </div>
        ))}
      </div>

      {/* ── Row 2: 1 + 1 + 2-col ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Foundation Building — blue-purple */}
        <div
          className="rounded-2xl p-7 flex flex-col gap-10 min-h-[260px] justify-between"
          style={{ backgroundColor: "#5b68be" }}
        >
          <SphereIcon lines={14} rx={27} ry={8} stroke="rgba(255,255,255,0.6)" />
          <p className="text-white text-lg font-light">Foundation Building</p>
        </div>

        {/* Vetted Strategies — white */}
        <div className={WHITE_CARD}>
          <SphereIcon lines={10} rx={26} ry={13} />
          <p className="text-gray-900 text-lg font-light">Vetted Strategies</p>
        </div>

        {/* Legacy Builders Network — dark navy, 2-col span */}
        <div
          className="col-span-2 rounded-2xl p-8 lg:p-10 flex flex-col justify-end min-h-[260px]"
          style={{
            backgroundColor: "#0c1a2e",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 48px)",
          }}
        >
          <h3
            className="text-white text-3xl sm:text-4xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}
          >
            LEGACY BUILDERS
            <br />
            NETWORK
          </h3>
          <Link
            href="/legacy-builders-network"
            className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors w-fit"
          >
            Join the Premium Community
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
