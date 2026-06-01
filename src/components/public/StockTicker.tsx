"use client";

import { useEffect, useRef, useState } from "react";

type Stock = { symbol: string; price: number; change: number; pct: number };
type TickerData = { stocks: Stock[]; fetchedAt: string };

function fmt(n: number) {
  return n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StockItem({ s }: { s: Stock }) {
  const up   = s.change > 0;
  const flat = s.change === 0;
  const color = flat ? "text-gray-400" : up ? "text-emerald-400" : "text-red-400";
  const sign  = up ? "+" : "";

  return (
    <span className="inline-flex items-center gap-2.5 px-5 shrink-0">
      <span className="text-white/50 text-[11px] font-semibold tracking-widest uppercase">{s.symbol}</span>
      <span className="text-white text-[12px] font-bold">₦{fmt(s.price)}</span>
      <span className={`text-[11px] font-semibold ${color}`}>
        {flat ? "—" : `${sign}${fmt(s.change)}`}
      </span>
    </span>
  );
}

// A thin separator dot between items
function Dot() {
  return <span className="text-white/15 shrink-0 select-none">·</span>;
}

export default function StockTicker() {
  const [data, setData] = useState<TickerData | null>(null);
  const [error, setError] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/ngx-ticker");
        if (!res.ok) throw new Error();
        setData(await res.json());
        setError(false);
      } catch {
        setError(true);
      }
    }
    load();
    // Refresh every 5 min
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (error || !data || data.stocks.length === 0) return null;

  const { stocks, fetchedAt } = data;
  const delayTime = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : "";

  // Duplicate stocks for seamless loop
  const items = [...stocks, ...stocks];

  return (
    <div className="w-full bg-[#05148a] border-b border-white/10 overflow-hidden flex items-stretch h-9 select-none">
      {/* NGX LIVE badge */}
      <div className="flex items-center gap-1.5 px-3.5 shrink-0 bg-[#040f6e] border-r border-white/10 z-10">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase whitespace-nowrap">NGX Live</span>
      </div>

      {/* Scrolling track */}
      <div className="flex-1 overflow-hidden relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-[#05148a] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#05148a] to-transparent z-10" />

        <div
          ref={trackRef}
          className="flex items-center h-full animate-ticker"
          style={{ width: "max-content" }}
        >
          {items.map((s, i) => (
            <span key={`${s.symbol}-${i}`} className="inline-flex items-center">
              <StockItem s={s} />
              <Dot />
            </span>
          ))}
        </div>
      </div>

      {/* DELAYED badge */}
      <div className="flex items-center px-3.5 shrink-0 bg-[#040f6e] border-l border-white/10">
        <span className="text-[10px] text-white/30 font-medium tracking-wide whitespace-nowrap uppercase">
          Delayed · {delayTime}
        </span>
      </div>
    </div>
  );
}
