"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ postId }: { postId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch("/api/blog-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId }),
    }).catch(() => {});
  }, [postId]);

  return null;
}
