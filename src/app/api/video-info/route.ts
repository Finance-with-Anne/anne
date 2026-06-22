import { NextRequest, NextResponse } from "next/server";

function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] || "0");
  const min = parseInt(m[2] || "0");
  const sec = parseInt(m[3] || "0");
  return Math.ceil(h * 60 + min + sec / 60);
}

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

  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${ytId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; bot)" },
      next: { revalidate: 3600 },
    });
    const html = await res.text();

    const durationMatch = html.match(/"duration":"(PT[^"]+)"/);
    const titleMatch = html.match(/"title":"([^"\\]+)"/);

    const duration = durationMatch ? parseIsoDuration(durationMatch[1]) : null;
    const title = titleMatch ? titleMatch[1] : null;

    return NextResponse.json({ duration, title, videoId: ytId });
  } catch {
    return NextResponse.json({ error: "Failed to fetch video info" }, { status: 500 });
  }
}
