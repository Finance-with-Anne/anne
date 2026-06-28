"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const HIDDEN_PATHS = [
  "/shop/checkout",
  "/money-tracker/checkout",
  "/legacy-builders-network/checkout",
  "/booking/verify",
  "/courses/verify",
];

export default function FloatingTelegramButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    const hidden = HIDDEN_PATHS.some((p) => path.startsWith(p));
    setVisible(!hidden);
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="https://t.me/+SNSQzX94_Gk1M2M0"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
      style={{ backgroundColor: "#0822C0" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.857l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.978.702z" />
      </svg>
      Join Free Community
    </Link>
  );
}
