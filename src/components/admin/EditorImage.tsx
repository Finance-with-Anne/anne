"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRef, useState } from "react";

export function EditorImageView({ node, deleteNode, updateAttributes }: NodeViewProps) {
  const [hovered, setHovered] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const src: string = node.attrs.src ?? "";
  const width: string | undefined = node.attrs.width;

  async function handleReplaceFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplacing(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "blog");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) updateAttributes({ src: data.url });
    setReplacing(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <NodeViewWrapper className="relative inline-block group my-4 w-full">
      <input ref={fileRef} type="file" accept="image/*,.avif" className="hidden" onChange={handleReplaceFile} />

      <img
        src={src}
        alt={node.attrs.alt ?? ""}
        style={{ width: width ?? "100%" }}
        className="rounded-xl max-w-full block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* Hover controls */}
      {(hovered || replacing) && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-black/70 text-white text-xs px-2.5 py-1.5 backdrop-blur-sm hover:bg-black/85 transition-colors"
          >
            {replacing ? (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            Replace
          </button>

          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => deleteNode()}
            className="flex items-center justify-center h-7 w-7 rounded-lg bg-red-500/80 text-white backdrop-blur-sm hover:bg-red-500 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}
