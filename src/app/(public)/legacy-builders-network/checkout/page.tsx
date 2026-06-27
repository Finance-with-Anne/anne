import { headers } from "next/headers";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

const PRICES: Record<string, number> = {
  NGN: 150000,
  GBP: 150,
  USD: 150,
};

function detectCurrency(country: string | null): string {
  if (country === "GB") return "GBP";
  if (country === "US" || country === "CA" || country === "AU") return "USD";
  return "NGN";
}

export default async function LBNCheckoutPage() {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");
  const currency = detectCurrency(country);
  const price = PRICES[currency] ?? PRICES.NGN;

  return <CheckoutForm currency={currency} price={price} />;
}
