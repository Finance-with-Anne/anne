import { NextResponse } from "next/server";

const NGX_API = "https://doclib.ngxgroup.com/REST/api/statistics/equities/?market=&sector=&orderby=&pageSize=300&pageNo=0";

// Top NGX stocks to show in the ticker (by market relevance)
const FEATURED = new Set([
  "DANGCEM","GTCO","ZENITHBANK","AIRTELAFRI","MTNN","SEPLAT","ACCESSCORP",
  "UBA","FBNH","STANBIC","OANDO","TRANSCORP","FIDELITY","NB","GEREGU",
  "ARADEL","BUAFOODS","BUACEMENT","JBERGER","WAPCO","NESTLE","FLOURMILL",
  "UNILEVER","CADBURY","INTBREW","CHAMPION","HONYFLOUR","NASCON",
]);

let cache: { data: unknown; ts: number } | null = null;
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(NGX_API, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://ngxgroup.com/",
        "Accept": "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`NGX API ${res.status}`);
    const raw: Array<Record<string, unknown>> = await res.json();

    const stocks = raw
      .filter(s => FEATURED.has(String(s.Symbol).trim()))
      .map(s => ({
        symbol:  String(s.Symbol).trim(),
        price:   Number(s.ClosePrice),
        change:  Number(s.Change),
        pct:     Number(s.PercChange),
        date:    String(s.TradeDate ?? ""),
      }))
      .sort((a, b) => FEATURED.size - [...FEATURED].indexOf(a.symbol) - (FEATURED.size - [...FEATURED].indexOf(b.symbol)));

    const payload = { stocks, fetchedAt: new Date().toISOString() };
    cache = { data: payload, ts: Date.now() };
    return NextResponse.json(payload);
  } catch (err) {
    // Return cache if available even if stale
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
