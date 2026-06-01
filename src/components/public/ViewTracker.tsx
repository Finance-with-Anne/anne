"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ postId }: { postId: string }) {
  const tracked = useRef(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    startTime.current = Date.now();

    fetch("/api/blog-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
    }).catch(() => {});

    function sendDuration() {
      const secs = Math.round((Date.now() - startTime.current) / 1000);
      if (secs < 3) return;
      navigator.sendBeacon(
        "/api/blog-views",
        new Blob(
          [JSON.stringify({ post_id: postId, read_duration_seconds: secs })],
          { type: "application/json" }
        )
      );
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") sendDuration();
    }

    window.addEventListener("beforeunload", sendDuration);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", sendDuration);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [postId]);

  return null;
}
