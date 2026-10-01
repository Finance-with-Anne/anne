import type { Booking } from "@/types";

/** How long a public checkout has to complete payment before it counts as abandoned. */
export const CHECKOUT_HOLD_MINUTES = 30;

export type PaymentState = "paid" | "abandoned" | "awaiting" | null;

export function paymentState(b: Pick<Booking, "is_paid" | "status" | "created_at">): PaymentState {
  if (b.is_paid) return "paid";
  if (b.status !== "pending") return null;
  const ageMs = Date.now() - new Date(b.created_at).getTime();
  return ageMs > CHECKOUT_HOLD_MINUTES * 60_000 ? "abandoned" : "awaiting";
}

export const paymentStateLabel: Record<Exclude<PaymentState, null>, string> = {
  paid: "Paid",
  abandoned: "Abandoned",
  awaiting: "Awaiting payment",
};

export const paymentStateClass: Record<Exclude<PaymentState, null>, string> = {
  paid: "bg-green-600 text-white",
  abandoned: "bg-amber-500 text-white",
  awaiting: "bg-gray-500 text-white",
};
