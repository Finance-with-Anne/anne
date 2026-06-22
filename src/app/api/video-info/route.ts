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

  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${ytId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const html = await res.text();

    let duration: number | null = null;
    let title: string | null = null;

    // Most reliable: lengthSeconds from ytInitialPlayerResponse / ytInitialData
    const lenSecMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
    if (lenSecMatch) {
      duration = Math.ceil(parseInt(lenSecMatch[1]) / 60);
    }

    // Fallback: ISO 8601 duration from JSON-LD
    if (!duration) {
      const isoMatch = html.match(/"duration"\s*:\s*"(PT[^"]+)"/);
      if (isoMatch) {
        const m = isoMatch[1].match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (m) {
          const h = parseInt(m[1] || "0");
          const min = parseInt(m[2] || "0");
          const sec = parseInt(m[3] || "0");
          duration = Math.ceil(h * 60 + min + sec / 60);
        }
      }
    }

    // Fallback: approxDurationMs
    if (!duration) {
      const msMatch = html.match(/"approxDurationMs"\s*:\s*"(\d+)"/);
      if (msMatch) {
        duration = Math.ceil(parseInt(msMatch[1]) / 60000);
      }
    }

    // Title
    const titleMatch = html.match(/"title"\s*:\s*\{"runs":\[{"text":"([^"]+)"/);
    if (!title && titleMatch) title = titleMatch[1];
    if (!title) {
      const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/);
      if (ogTitle) title = ogTitle[1];
    }

    return NextResponse.json({ duration, title, videoId: ytId });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch video info" }, { status: 500 });
  }
}
