import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'");
}

function attr(html: string, property: string): string | null {
  const re1 = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"'<>]+)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+property=["']${property}["']`, "i");
  const m = html.match(re1) ?? html.match(re2);
  return m ? decode(m[1]) : null;
}

function nameMeta(html: string, name: string): string | null {
  const re1 = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"'<>]+)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+name=["']${name}["']`, "i");
  const m = html.match(re1) ?? html.match(re2);
  return m ? decode(m[1]) : null;
}

function domainToName(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const part = host.split(".")[0];
    return part.charAt(0).toUpperCase() + part.slice(1);
  } catch { return "Source"; }
}

function toAbsolute(image: string, base: string) {
  if (!image) return image;
  if (image.startsWith("http")) return image;
  try {
    const u = new URL(base);
    return image.startsWith("/") ? `${u.protocol}//${u.host}${image}` : `${u.protocol}//${u.host}/${image}`;
  } catch { return image; }
}

async function tryMicrolink(url: string) {
  const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=false`, {
    headers: { "Accept": "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json.status !== "success") return null;
  const d = json.data;
  return {
    title: d.title ?? "",
    description: d.description ?? "",
    image: d.image?.url ?? d.screenshot?.url ?? "",
    site_name: d.publisher ?? domainToName(url),
    url,
  };
}

async function tryDirect(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
    },
    signal: AbortSignal.timeout(10000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const title = attr(html, "og:title") ?? html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1]?.trim() ?? "";
  const description = attr(html, "og:description") ?? nameMeta(html, "description") ?? "";
  const image = toAbsolute(attr(html, "og:image") ?? "", url);
  const site_name = attr(html, "og:site_name") ?? domainToName(url);
  return { title: decode(title), description, image, site_name, url };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { url } = await req.json();
  if (!url?.trim()) return NextResponse.json({ error: "URL is required." }, { status: 400 });

  // 1. Try microlink.io (handles paywalled/auth-gated sites like Reuters, Bloomberg)
  const microlink = await tryMicrolink(url.trim()).catch(() => null);
  if (microlink?.title) return NextResponse.json(microlink);

  // 2. Fall back to direct HTML scraping
  try {
    const direct = await tryDirect(url.trim());
    if (direct.title) return NextResponse.json(direct);
  } catch (_) { /* ignore */ }

  // 3. Both failed — return partial data so user can fill manually
  return NextResponse.json({
    title: "",
    description: "",
    image: "",
    site_name: domainToName(url),
    url: url.trim(),
    partial: true,
  });
}
