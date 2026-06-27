import { NextRequest, NextResponse } from "next/server";

// Set LBN_COUPONS in env as comma-separated "CODE:DISCOUNT_NGN" pairs
// e.g. LBN_COUPONS=WELCOME15000:15000,VIP30000:30000
function parseCoupons(): Record<string, number> {
  const raw = process.env.LBN_COUPONS ?? "";
  const map: Record<string, number> = {};
  for (const entry of raw.split(",")) {
    const [code, amount] = entry.trim().split(":");
    if (code && amount && !isNaN(Number(amount))) {
      map[code.toUpperCase()] = Number(amount);
    }
  }
  return map;
}

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ valid: false, error: "No code provided." }, { status: 400 });

  const coupons = parseCoupons();
  const discount = coupons[String(code).toUpperCase()];

  if (discount === undefined) {
    return NextResponse.json({ valid: false, error: "Invalid or expired coupon code." });
  }

  return NextResponse.json({ valid: true, discount });
}
