import { NextRequest, NextResponse } from "next/server";

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

  const ytId = extractYouTubeId(url);
  if (!ytId) return NextResponse.json({ error: "Not a recognised YouTube URL" }, { status: 400 });

  let title: string | null = null;
  let thumbnail: string = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  let duration: number | null = null;

  // oEmbed first — fast, reliable, no API key
  try {
    const oembed = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`
    );
    if (oembed.ok) {
      const od = await oembed.json();
      if (od.title) title = od.title;
      if (od.thumbnail_url) thumbnail = od.thumbnail_url;
    }
  } catch {}

  // HTML scrape for duration (best-effort, skip on failure)
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${ytId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();

    const lenSecMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
    if (lenSecMatch) duration = Math.ceil(parseInt(lenSecMatch[1]) / 60);

    if (!duration) {
      const msMatch = html.match(/"approxDurationMs"\s*:\s*"(\d+)"/);
      if (msMatch) duration = Math.ceil(parseInt(msMatch[1]) / 60000);
    }

    if (!title) {
      const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/);
      if (ogTitle) title = ogTitle[1];
    }
  } catch {}

  if (!title) return NextResponse.json({ error: "Could not fetch video info." }, { status: 502 });

  return NextResponse.json({ videoId: ytId, title, thumbnail, duration });
}
