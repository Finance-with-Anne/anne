import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient, saveTokens } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/admin/booking/settings?error=no_code", req.url));

  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  await saveTokens(tokens);

  return NextResponse.redirect(new URL("/admin/booking/settings?connected=1", req.url));
}
