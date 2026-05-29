"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useAdminTheme } from "@/lib/admin-theme";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface BlogEditorProps {
  initialData?: {
    id?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    cover_image?: string;
    published?: boolean;
    slug?: string;
  };
}

export default function BlogEditor({ initialData }: BlogEditorProps) {
  const { dark } = useAdminTheme();
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image ?? "");
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your post…" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: initialData?.content ?? "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[360px] px-1",
      },
    },
  });

  function generateSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!initialData?.slug) setSlug(generateSlug(v));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "blog");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) setCoverImage(data.url);
    setUploading(false);
  }

  async function handleSave(publish: boolean) {
    if (!title) return setError("Title is required.");
    setSaving(true);
    setError("");

    const body = {
      title,
      slug: slug || generateSlug(title),
      excerpt,
      content: editor?.getHTML() ?? "",
      cover_image: coverImage,
      published: publish,
      published_at: publish ? new Date().toISOString() : null,
    };

    const endpoint = initialData?.id
      ? `/api/blog/${initialData.id}`
      : "/api/blog";
    const method = initialData?.id ? "PATCH" : "POST";

    const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to save.");
    } else {
      router.push("/admin/blog");
    }
    setSaving(false);
  }

  const addImageToEditor = useCallback(() => {
    const url = window.prompt("Image URL");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const card = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const inputClass = dark
    ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const labelClass = dark ? "text-white/40" : "text-gray-500";
  const heading = dark ? "text-white" : "text-gray-900";
  const toolbarBtn = dark
    ? "text-white/40 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900";
  const editorClass = dark ? "text-white/80 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-white/20" : "text-gray-800";

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${heading}`}>{initialData?.id ? "Edit Post" : "New Blog Post"}</h1>
          <p className={`text-sm mt-0.5 ${labelClass}`}>Write and publish your article.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className={`rounded-xl border p-5 space-y-3 ${card}`}>
            <input
              type="text"
              placeholder="Post title…"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={`w-full text-xl font-bold bg-transparent border-none focus:outline-none ${dark ? "text-white placeholder-white/20" : "text-gray-900 placeholder-gray-300"}`}
            />
            <div className={`border-t pt-3 ${dark ? "border-white/5" : "border-gray-100"}`}>
              <input
                type="text"
                placeholder="excerpt — short description of the post"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className={`w-full text-sm bg-transparent border-none focus:outline-none ${dark ? "text-white/50 placeholder-white/20" : "text-gray-500 placeholder-gray-300"}`}
              />
            </div>
          </div>

          {/* Toolbar + Editor */}
          <div className={`rounded-xl border overflow-hidden ${card}`}>
            {/* Toolbar */}
            <div className={`flex flex-wrap items-center gap-0.5 px-4 py-2 border-b ${dark ? "border-white/5" : "border-gray-100"}`}>
              {[
                { label: "B", action: () => editor?.chain().focus().toggleBold().run(), active: () => editor?.isActive("bold") ?? false, title: "Bold" },
                { label: "I", action: () => editor?.chain().focus().toggleItalic().run(), active: () => editor?.isActive("italic") ?? false, title: "Italic" },
                { label: "U", action: () => editor?.chain().focus().toggleUnderline().run(), active: () => editor?.isActive("underline") ?? false, title: "Underline" },
                { label: "S", action: () => editor?.chain().focus().toggleStrike().run(), active: () => editor?.isActive("strike") ?? false, title: "Strikethrough" },
              ].map((btn) => (
                <button key={btn.title} title={btn.title} onClick={btn.action} data-active={btn.active()} className={`h-7 w-7 rounded flex items-center justify-center text-xs font-bold transition-colors ${toolbarBtn}`}>{btn.label}</button>
              ))}

              <div className={`w-px h-4 mx-1 ${dark ? "bg-white/10" : "bg-gray-200"}`} />

              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  title={`Heading ${level}`}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: level as 1|2|3 }).run()}
                  data-active={editor?.isActive("heading", { level }) ?? false}
                  className={`h-7 px-2 rounded text-xs font-bold transition-colors ${toolbarBtn}`}
                >H{level}</button>
              ))}

              <div className={`w-px h-4 mx-1 ${dark ? "bg-white/10" : "bg-gray-200"}`} />

              <button title="Bullet list" onClick={() => editor?.chain().focus().toggleBulletList().run()} data-active={editor?.isActive("bulletList") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <button title="Ordered list" onClick={() => editor?.chain().focus().toggleOrderedList().run()} data-active={editor?.isActive("orderedList") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
              </button>
              <button title="Blockquote" onClick={() => editor?.chain().focus().toggleBlockquote().run()} data-active={editor?.isActive("blockquote") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10.5H6a1 1 0 01-1-1v-2a1 1 0 011-1h2m0 4v2a2 2 0 01-2 2H5m3-4h5M13 10.5h-1a1 1 0 01-1-1v-2a1 1 0 011-1h2m0 4v2a2 2 0 01-2 2h-1m2-4h2" /></svg>
              </button>
              <button title="Add image" onClick={addImageToEditor} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </button>
              <button title="Code block" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} data-active={editor?.isActive("codeBlock") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </button>
            </div>

            {/* Editor */}
            <div className={`px-5 py-4 ${editorClass}`}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          {/* Cover image */}
          <div className={`rounded-xl border p-5 space-y-3 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>Cover Image</p>
            {coverImage ? (
              <div className="relative">
                <img src={coverImage} alt="" className="w-full h-36 object-cover rounded-lg" />
                <button onClick={() => setCoverImage("")} className="absolute top-2 right-2 bg-black/60 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">✕</button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center h-36 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${dark ? "border-white/10 hover:border-white/20" : "border-gray-200 hover:border-gray-300"}`}>
                <svg className={`h-6 w-6 mb-2 ${labelClass}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`text-xs ${labelClass}`}>{uploading ? "Uploading…" : "Click to upload"}</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Slug */}
          <div className={`rounded-xl border p-5 space-y-3 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>URL Slug</p>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-url-slug"
              className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputClass}`}
            />
          </div>

          {/* Publish toggle */}
          <div className={`rounded-xl border p-5 ${card}`}>
            <div className="flex items-center justify-between">
              <p className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}>Status</p>
              <button
                onClick={() => setPublished(!published)}
                className={`relative h-5 w-9 rounded-full transition-colors ${published ? "bg-green-500" : dark ? "bg-white/10" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${published ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
            <p className={`text-xs mt-2 ${labelClass}`}>{published ? "Will be published immediately" : "Saved as draft"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
