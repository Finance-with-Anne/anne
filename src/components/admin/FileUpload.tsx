"use client";

import { useState, useRef } from "react";

interface FileUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
  accept?: string;
  label?: string;
  currentUrl?: string;
}

export default function FileUpload({
  onUpload,
  folder = "general",
  accept = "image/*",
  label = "Upload file",
  currentUrl,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(currentUrl ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
    } else {
      setPreview(data.url);
      onUpload(data.url);
    }

    setUploading(false);
  }

  return (
    <div className="space-y-2">
      {preview && accept.startsWith("image") && (
        <img src={preview} alt="Preview" className="h-32 w-full rounded-lg object-cover border border-gray-200" />
      )}
      {preview && !accept.startsWith("image") && (
        <p className="text-xs text-gray-500 truncate">{preview}</p>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 disabled:opacity-50 transition-colors w-full justify-center"
      >
        {uploading ? "Uploading…" : label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
