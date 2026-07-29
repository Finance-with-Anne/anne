"use client";

import { useEffect, useState } from "react";

export default function LiveViewerBadge() {
  const [count, setCount] = useState(125);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => {
        const next = c + Math.floor(Math.random() * 7) - 3;
        return Math.min(146, Math.max(98, next));
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
      style={{ fontFamily: "var(--font-plex-mono)", color: "#7596F7", border: "1px solid rgba(117,150,247,0.4)" }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: "#1FBF75", boxShadow: "0 0 0 3px rgba(31,191,117,0.2)" }}
      />
      {count} people viewing this page right now
    </span>
  );
}
