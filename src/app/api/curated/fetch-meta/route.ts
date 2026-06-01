import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'");
}

function attr(html: string, prop: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"'<>]+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+property=["']${prop}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"'<>]+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+name=["']${prop}["']`, "i"),
  ];
  for (const re of patterns) { const m = html.match(re); if (m) return decode(m[1]); }
  return null;
}

function domainToName(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    // Map common domains to proper names
    const known: Record<string, string> = {
      "wsj.com": "Wall Street Journal", "bloomberg.com": "Bloomberg",
      "reuters.com": "Reuters", "ft.com": "Financial Times",
      "nytimes.com": "New York Times", "theguardian.com": "The Guardian",
      "bbc.com": "BBC", "bbc.co.uk": "BBC", "techcrunch.com": "TechCrunch",
      "forbes.com": "Forbes", "cnbc.com": "CNBC", "cnn.com": "CNN",
      "businessinsider.com": "Business Insider", "economist.com": "The Economist",
      "washingtonpost.com": "Washington Post",
    };
    if (known[host]) return known[host];
    const part = host.split(".")[0];
    return part.charAt(0).toUpperCase() + part.slice(1);
  } catch { return "Source"; }
}

function toAbsolute(img: string, base: string) {
  if (!img || img.startsWith("http")) return img;
  try {
    const u = new URL(base);
    return img.startsWith("/") ? `${u.protocol}//${u.host}${img}` : `${u.protocol}//${u.host}/${img}`;
  } catch { return img; }
}

async function tryMicrolink(url: string) {
  const res = await fetch(
    `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=false&meta=true`,
    { headers: { "Accept": "application/json" }, signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) return null;
  const j = await res.json();
  if (j.status !== "success" || !j.data?.title) return null;
  const d = j.data;
  return { title: d.title ?? "", description: d.description ?? "", image: d.image?.url ?? "", site_name: d.publisher ?? domainToName(url) };
}

async function tryURLMeta(url: string) {
  const res = await fetch(
    `https://api.urlmeta.org/?url=${encodeURIComponent(url)}`,
    { headers: { "Accept": "application/json" }, signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) return null;
  const j = await res.json();
  if (j.result?.status !== "OK" || !j.meta?.title) return null;
  return { title: j.meta.title ?? "", description: j.meta.description ?? "", image: j.meta.image ?? "", site_name: domainToName(url) };
}

async function tryJina(url: string) {
  const res = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
    headers: {
      "Accept": "application/json",
      "X-Return-Format": "json",
      "X-No-Cache": "true",
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return null;
  const j = await res.json();
  if (!j.data?.title) return null;
  const d = j.data;
  const image = Array.isArray(d.images) && d.images.length > 0 ? d.images[0].url : "";
  return { title: d.title ?? "", description: d.description ?? "", image: image ?? "", site_name: domainToName(url) };
}

async function tryDirect(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(8000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const title = attr(html, "og:title") ?? html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1]?.trim() ?? "";
  if (!title) throw new Error("No title found");
  return {
    title: decode(title),
    description: attr(html, "og:description") ?? attr(html, "description") ?? "",
    image: toAbsolute(attr(html, "og:image") ?? "", url),
    site_name: attr(html, "og:site_name") ?? domainToName(url),
  };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { url } = await req.json();
  if (!url?.trim()) return NextResponse.json({ error: "URL is required." }, { status: 400 });
  const cleanUrl = url.trim();

  // Run all four in parallel — first success wins
  const results = await Promise.allSettled([
    tryMicrolink(cleanUrl),
    tryURLMeta(cleanUrl),
    tryJina(cleanUrl),
    tryDirect(cleanUrl),
  ]);

  for (const r of results) {
    if (r.status === "fulfilled" && r.value?.title) {
      return NextResponse.json({ ...r.value, url: cleanUrl, partial: false });
    }
  }

  // All failed — return partial so user can fill manually (never show hard error)
  return NextResponse.json({
    title: "",
    description: "",
    image: "",
    site_name: domainToName(cleanUrl),
    url: cleanUrl,
    partial: true,
  });
}
