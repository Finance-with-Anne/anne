import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";

const FLW_SECRET = process.env.FLW_SECRET_KEY ?? "";

export async function POST(req: NextRequest) {
  const { order_id, transaction_id } = await req.json();

  if (!FLW_SECRET) return NextResponse.json({ error: "Payment not configured." }, { status: 503 });

  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transaction_id)}/verify`,
    { headers: { Authorization: `Bearer ${FLW_SECRET}` } }
  );
  const json = await res.json();

  if (json.status !== "success" || json.data?.status !== "successful") {
    return NextResponse.json({ error: "Payment not successful." }, { status: 400 });
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .single();

  if (error || !order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const downloads = await getDownloads(order.items);

  if (order.status === "paid") {
    return NextResponse.json({ success: true, downloads });
  }

  // Link order to user account by email so it appears in /account/files
  if (!order.user_id) {
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const match = users.find(u => u.email?.toLowerCase() === (order.email as string).toLowerCase());
    if (match) {
      await supabaseAdmin.from("orders").update({ user_id: match.id }).eq("id", order_id);
    }
  }

  await supabaseAdmin
    .from("orders")
    .update({ status: "paid", transaction_id: String(transaction_id) })
    .eq("id", order_id);

  sendOrderEmail(order, downloads).catch(console.error);

  return NextResponse.json({ success: true, downloads });
}

async function getDownloads(items: { id: string; name: string; qty: number }[]) {
  const ids = items.map(i => i.id);
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, name, download_url")
    .in("id", ids);

  return items.map(item => ({
    name: item.name,
    qty: item.qty,
    download_url: products?.find(p => p.id === item.id)?.download_url ?? null,
  }));
}

async function sendOrderEmail(
  order: { email: string; name: string | null; items: { name: string; qty: number }[]; total: number; currency: string },
  downloads: { name: string; download_url: string | null }[]
) {
  const s = order.currency === "GBP" ? "£" : order.currency === "USD" ? "$" : "₦";
  const itemsList = order.items.map(i => `• ${i.name} ×${i.qty}`).join("\n");
  const downloadSection = downloads.filter(d => d.download_url).length > 0
    ? `\n\nDownload your files:\n${downloads.filter(d => d.download_url).map(d => `• ${d.name}: ${d.download_url}`).join("\n")}`
    : "";

  await resend.emails.send({
    from: EMAIL_FROM,
    to: order.email,
    subject: "Your order is confirmed — Finance with Anne",
    text: `Hi ${order.name ?? "there"},\n\nThank you for your order!\n\nItems:\n${itemsList}\n\nTotal: ${s}${order.total.toLocaleString()}${downloadSection}\n\nFinance with Anne`,
  });
}
