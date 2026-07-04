import "server-only";

const FLW_SECRET = process.env.FLW_SECRET_KEY ?? "";

export type FlutterwaveTransaction = {
  status?: string;
  data?: {
    status?: string;
    amount?: number;
    currency?: string;
    tx_ref?: string;
    meta?: Record<string, unknown>;
  };
};

export async function verifyFlutterwaveTransaction(transactionId: string | number): Promise<FlutterwaveTransaction> {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(String(transactionId))}/verify`,
    { headers: { Authorization: `Bearer ${FLW_SECRET}` } }
  );
  return res.json();
}

export function transactionSucceeded(flw: FlutterwaveTransaction) {
  return flw.status === "success" && flw.data?.status === "successful";
}

/**
 * A verified "successful" transaction on Flutterwave only proves *some* payment
 * happened, not that it paid for *this* order. Without this check, any cheap or
 * reused transaction_id could mark an unrelated, more expensive order as paid.
 */
export function chargeMatchesExpected(
  flw: FlutterwaveTransaction,
  expected: { amount: number; currency: string; txRef: string }
) {
  const data = flw.data;
  if (!data) return false;
  const amountOk = typeof data.amount === "number" && Math.abs(data.amount - expected.amount) <= 1;
  const currencyOk = String(data.currency ?? "").toUpperCase() === expected.currency.toUpperCase();
  const txRefOk = data.tx_ref === expected.txRef;
  return amountOk && currencyOk && txRefOk;
}
