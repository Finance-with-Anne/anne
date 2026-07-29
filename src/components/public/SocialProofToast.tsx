"use client";

import { useEffect, useState } from "react";

const NAMES = [
  "Emeka", "Ronke", "Chidinma", "Tunde", "Ngozi", "Ifeoma", "Bola", "Chinedu",
  "Aisha", "Uche", "Kemi", "Segun", "Amara", "Yemi", "Femi", "Blessing",
  "Chioma", "Damilola", "Obinna", "Funke",
];

const TIMES_AGO = ["2 minutes ago", "5 minutes ago", "8 minutes ago", "just now", "12 minutes ago"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [timeAgo, setTimeAgo] = useState("");
  const [remaining, setRemaining] = useState(30);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    function cycle() {
      setName(randomFrom(NAMES));
      setTimeAgo(randomFrom(TIMES_AGO));
      setRemaining((r) => (r <= 5 ? Math.floor(Math.random() * 10) + 20 : r - 1));
      setVisible(true);

      hideTimer = setTimeout(() => {
        setVisible(false);
        showTimer = setTimeout(cycle, Math.random() * 4000 + 5000);
      }, 5000);
    }

    showTimer = setTimeout(cycle, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: "20px",
        bottom: "20px",
        zIndex: 80,
        background: "#fff",
        border: "1px solid rgba(2,19,59,0.1)",
        borderRadius: "12px",
        boxShadow: "0 12px 32px rgba(2,19,59,0.18)",
        padding: "14px 16px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        maxWidth: "340px",
        transform: visible ? "translateY(0)" : "translateY(140%)",
        opacity: visible ? 1 : 0,
        transition: "transform .45s cubic-bezier(.2,.9,.3,1.2), opacity .3s ease",
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          background: "#0040CF",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "14px",
          flexShrink: 0,
        }}
      >
        {name[0]}
      </div>
      <div style={{ fontSize: "13.5px", lineHeight: 1.35, color: "#161b28" }}>
        <span>
          <b style={{ color: "#02133B" }}>{name}</b> just bought the Investment Blueprint
        </span>
        <div style={{ fontFamily: "var(--font-plex-mono)", fontSize: "11px", color: "#8a90a0", marginTop: "3px" }}>
          {timeAgo} · {remaining} spots left at this price
        </div>
      </div>
      <span
        onClick={() => setDismissed(true)}
        style={{ marginLeft: "auto", alignSelf: "flex-start", cursor: "pointer", color: "#b7bcc8", fontSize: "14px" }}
        role="button"
        aria-label="Dismiss"
      >
        ✕
      </span>
    </div>
  );
}
