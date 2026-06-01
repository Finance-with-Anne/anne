import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function attr(html: string, property: string): string | null {
  // Matches both property="og:x" content="y" and content="y" property="og:x" orders
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

function decode(s: string) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'");
}

function domainToName(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const parts = host.split(".");
    const name = parts[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return "Source";
  }
}

function toAbsolute(image: string, base: string) {
  if (!image) return image;
  if (image.startsWith("http")) return image;
  try {
    const u = new URL(base);
    return image.startsWith("/") ? `${u.protocol}//${u.host}${image}` : `${u.protocol}//${u.host}/${image}`;
  } catch { return image; }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { url } = await req.json();
  if (!url?.trim()) return NextResponse.json({ error: "URL is required." }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FWA-Curator/1.0; +https://financewithanne.co)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    const title =
      attr(html, "og:title") ??
      html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1]?.trim() ??
      "";

    const description =
      attr(html, "og:description") ??
      nameMeta(html, "description") ??
      "";

    const image = toAbsolute(attr(html, "og:image") ?? "", url);

    const siteName =
      attr(html, "og:site_name") ??
      domainToName(url);

    return NextResponse.json({ title, description, image, site_name: siteName, url });
  } catch (err) {
    return NextResponse.json(
      { error: `Could not fetch that URL: ${err instanceof Error ? err.message : "unknown error"}` },
      { status: 400 }
    );
  }
}
