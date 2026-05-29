"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useAdminTheme } from "@/lib/admin-theme";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const COLORS = [
  { label: "Default",  value: "inherit" },
  { label: "Brand",    value: "#070F1E" },
  { label: "Red",      value: "#ef4444" },
  { label: "Orange",   value: "#f97316" },
  { label: "Yellow",   value: "#eab308" },
  { label: "Green",    value: "#22c55e" },
  { label: "Blue",     value: "#3b82f6" },
  { label: "Purple",   value: "#8b5cf6" },
  { label: "Pink",     value: "#ec4899" },
  { label: "Gray",     value: "#6b7280" },
];

interface BlogEditorProps {
  initialData?: {
    id?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    cover_image?: string;
    published?: boolean;
    slug?: string;
    meta_title?: string;
    meta_description?: string;
    focus_keyword?: string;
  };
}

type PreviewTab = "post" | "seo";

export default function BlogEditor({ initialData }: BlogEditorProps) {
  const { dark } = useAdminTheme();
  const router = useRouter();

  const [title, setTitle]               = useState(initialData?.title ?? "");
  const [excerpt, setExcerpt]           = useState(initialData?.excerpt ?? "");
  const [slug, setSlug]                 = useState(initialData?.slug ?? "");
  const [coverImage, setCoverImage]     = useState(initialData?.cover_image ?? "");
  const [status, setStatus]             = useState<"draft" | "scheduled" | "published">(initialData?.published ? "published" : "draft");
  const [scheduledAt, setScheduledAt]   = useState("");
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [error, setError]               = useState("");
  const [previewTab, setPreviewTab]     = useState<PreviewTab>("post");
  const [content, setContent]           = useState(initialData?.content ?? "");
  const [metaTitle, setMetaTitle]       = useState(initialData?.meta_title ?? "");
  const [metaDesc, setMetaDesc]         = useState(initialData?.meta_description ?? "");
  const [focusKw, setFocusKw]           = useState(initialData?.focus_keyword ?? "");
  const [linkInput, setLinkInput]       = useState("");
  const [showLinkBar, setShowLinkBar]   = useState(false);
  const [showColors, setShowColors]     = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const imgInputRef                     = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your post…" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: initialData?.content ?? "",
    editorProps: {
      attributes: { class: "focus:outline-none min-h-[400px] px-1" },
    },
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
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

  async function handleSave(forceDraft?: boolean) {
    if (!title) return setError("Title is required.");
    if (status === "scheduled" && !scheduledAt) return setError("Please set a scheduled date.");
    setSaving(true);
    setError("");
    const effectiveStatus = forceDraft ? "draft" : status;
    const body = {
      title,
      slug: slug || generateSlug(title),
      excerpt,
      content: editor?.getHTML() ?? "",
      cover_image: coverImage,
      published: effectiveStatus === "published",
      published_at: effectiveStatus === "published"
        ? new Date().toISOString()
        : effectiveStatus === "scheduled"
        ? new Date(scheduledAt).toISOString()
        : null,
      meta_title: metaTitle || title,
      meta_description: metaDesc || excerpt,
      focus_keyword: focusKw,
    };
    const endpoint = initialData?.id ? `/api/blog/${initialData.id}` : "/api/blog";
    const method   = initialData?.id ? "PATCH" : "POST";
    const res  = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Failed to save.");
    else router.push("/admin/blog");
    setSaving(false);
  }

  async function handleEditorImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setImgUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "blog");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) editor.chain().focus().setImage({ src: data.url }).run();
    setImgUploading(false);
    if (imgInputRef.current) imgInputRef.current.value = "";
  }

  function applyLink() {
    if (!linkInput) {
      editor?.chain().focus().unsetLink().run();
    } else {
      editor?.chain().focus().setLink({ href: linkInput }).run();
    }
    setLinkInput("");
    setShowLinkBar(false);
  }

  function toggleLinkBar() {
    const existing = editor?.getAttributes("link").href ?? "";
    setLinkInput(existing);
    setShowLinkBar(v => !v);
  }

  // ── SEO analysis ──────────────────────────────────────────
  const effTitle   = metaTitle || title;
  const effDesc    = metaDesc  || excerpt;
  const plainText  = content.replace(/<[^>]+>/g, "");
  const wordCount  = plainText.split(/\s+/).filter(Boolean).length;
  const kw         = focusKw.toLowerCase();

  const seoChecks = [
    { label: "Meta title (50–60 chars)",         ok: effTitle.length >= 50 && effTitle.length <= 60,     value: `${effTitle.length} chars` },
    { label: "Meta description (120–160 chars)", ok: effDesc.length  >= 120 && effDesc.length  <= 160,   value: `${effDesc.length} chars`  },
    { label: "Focus keyword in title",           ok: !!kw && title.toLowerCase().includes(kw),            value: kw ? (title.toLowerCase().includes(kw) ? "Found" : "Missing") : "No keyword" },
    { label: "Focus keyword in description",     ok: !!kw && effDesc.toLowerCase().includes(kw),          value: kw ? (effDesc.toLowerCase().includes(kw) ? "Found" : "Missing") : "No keyword" },
    { label: "Focus keyword in content",         ok: !!kw && plainText.toLowerCase().includes(kw),        value: kw ? (plainText.toLowerCase().includes(kw) ? "Found" : "Missing") : "No keyword" },
    { label: "Cover image set",                  ok: !!coverImage,                                         value: coverImage ? "Yes" : "No" },
    { label: "Excerpt written",                  ok: !!excerpt,                                            value: excerpt ? "Yes" : "Missing" },
    { label: "Word count (300+ recommended)",    ok: wordCount >= 300,                                     value: `${wordCount} words` },
  ];
  const seoScore = Math.round((seoChecks.filter(c => c.ok).length / seoChecks.length) * 100);
  const seoColor = seoScore >= 75 ? "green" : seoScore >= 50 ? "yellow" : "red";

  // ── Theme tokens ─────────────────────────────────────────
  const leftBg     = dark ? "bg-[#0d0f14]" : "bg-[#f0f2f5]";
  const headerBg   = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const card       = dark ? "bg-[#111318] border-white/5" : "bg-white border-gray-200";
  const inputCls   = dark ? "bg-white/5 border-white/5 text-white placeholder-white/20 focus:border-white/20" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300";
  const labelCls   = dark ? "text-white/40" : "text-gray-500";
  const headingCls = dark ? "text-white" : "text-gray-900";
  const divider    = dark ? "border-white/5" : "border-gray-100";
  const toolbarBtn = dark
    ? "text-white/40 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900";
  const editorCls  = dark ? "text-white/85" : "text-gray-900";

  return (
    // Break out of the p-6 on <main> and fill the remaining viewport height (header = h-14 = 56px)
    <div className="flex -m-6 h-[calc(100vh-56px)] overflow-hidden">

      {/* ════════════════ LEFT — EDITOR ════════════════ */}
      <div className={`w-1/2 flex flex-col overflow-hidden border-r ${dark ? "border-white/5" : "border-gray-200"} ${leftBg}`}>

        {/* Sticky top bar */}
        <div className={`flex-none flex items-center justify-between px-6 py-3.5 border-b ${headerBg}`}>
          <div>
            <h1 className={`text-sm font-bold ${headingCls}`}>{initialData?.id ? "Edit Post" : "New Blog Post"}</h1>
            <p className={`text-xs mt-0.5 ${labelCls}`}>Write and publish your article</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSave(true)} disabled={saving}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              Save Draft
            </button>
            <button onClick={() => handleSave()} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50">
              {saving ? "Saving…" : status === "published" ? "Publish" : status === "scheduled" ? "Schedule" : "Save"}
            </button>
          </div>
        </div>

        {/* Scrollable editor body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{error}</div>
            )}

            {/* Title + excerpt */}
            <div className={`rounded-xl border p-5 space-y-3 ${card}`}>
              <input
                type="text"
                placeholder="Post title…"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`w-full text-xl font-bold bg-transparent border-none focus:outline-none ${dark ? "text-white placeholder-white/20" : "text-gray-900 placeholder-gray-300"}`}
              />
              <div className={`border-t pt-3 ${divider}`}>
                <input
                  type="text"
                  placeholder="Excerpt — a short description of the post"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className={`w-full text-sm bg-transparent border-none focus:outline-none ${dark ? "text-white/50 placeholder-white/20" : "text-gray-500 placeholder-gray-300"}`}
                />
              </div>
            </div>

            {/* Toolbar + editor */}
            <div className={`rounded-xl border overflow-hidden ${card}`}>
              {/* Hidden file input for in-editor image upload */}
              <input ref={imgInputRef} type="file" accept="image/*" onChange={handleEditorImageUpload} className="hidden" />

              <div className={`flex flex-wrap items-center gap-0.5 px-3 py-2 border-b ${divider}`}>

                {/* Undo / Redo */}
                <button title="Undo" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} className={`h-7 w-7 rounded flex items-center justify-center transition-colors disabled:opacity-25 ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </button>
                <button title="Redo" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} className={`h-7 w-7 rounded flex items-center justify-center transition-colors disabled:opacity-25 ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
                </button>

                <div className={`w-px h-4 mx-1 ${dark ? "bg-white/10" : "bg-gray-200"}`} />

                {/* Text formatting */}
                {[
                  { label: "B", action: () => editor?.chain().focus().toggleBold().run(),      active: () => editor?.isActive("bold")      ?? false, title: "Bold" },
                  { label: "I", action: () => editor?.chain().focus().toggleItalic().run(),    active: () => editor?.isActive("italic")    ?? false, title: "Italic" },
                  { label: "U", action: () => editor?.chain().focus().toggleUnderline().run(), active: () => editor?.isActive("underline") ?? false, title: "Underline" },
                  { label: "S", action: () => editor?.chain().focus().toggleStrike().run(),    active: () => editor?.isActive("strike")    ?? false, title: "Strikethrough" },
                ].map(btn => (
                  <button key={btn.title} title={btn.title} onMouseDown={e => e.preventDefault()} onClick={btn.action} data-active={btn.active()}
                    className={`h-7 w-7 rounded flex items-center justify-center text-xs font-bold transition-colors ${toolbarBtn}`}>
                    {btn.label}
                  </button>
                ))}

                <div className={`w-px h-4 mx-1 ${dark ? "bg-white/10" : "bg-gray-200"}`} />

                {/* Headings */}
                {[1, 2, 3].map(level => (
                  <button key={level} title={`Heading ${level}`}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: level as 1|2|3 }).run()}
                    data-active={editor?.isActive("heading", { level }) ?? false}
                    className={`h-7 px-2 rounded text-xs font-bold transition-colors ${toolbarBtn}`}>
                    H{level}
                  </button>
                ))}

                <div className={`w-px h-4 mx-1 ${dark ? "bg-white/10" : "bg-gray-200"}`} />

                {/* Lists + blockquote */}
                <button title="Bullet list" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBulletList().run()} data-active={editor?.isActive("bulletList") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </button>
                <button title="Ordered list" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleOrderedList().run()} data-active={editor?.isActive("orderedList") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
                    <text x="2" y="7.5" fontSize="5" fill="currentColor" stroke="none">1</text>
                    <text x="2" y="13.5" fontSize="5" fill="currentColor" stroke="none">2</text>
                    <text x="2" y="19.5" fontSize="5" fill="currentColor" stroke="none">3</text>
                  </svg>
                </button>
                <button title="Blockquote" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBlockquote().run()} data-active={editor?.isActive("blockquote") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </button>

                <div className={`w-px h-4 mx-1 ${dark ? "bg-white/10" : "bg-gray-200"}`} />

                {/* Link */}
                <button title="Insert link" onMouseDown={e => e.preventDefault()} onClick={toggleLinkBar} data-active={editor?.isActive("link") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>

                {/* Text colour */}
                <div className="relative">
                  <button
                    title="Text colour"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setShowColors(v => !v)}
                    className={`h-7 w-7 rounded flex flex-col items-center justify-center gap-0.5 transition-colors ${toolbarBtn}`}
                  >
                    <span className="text-xs font-bold leading-none">A</span>
                    <span className="w-4 h-1 rounded-full" style={{ backgroundColor: editor?.getAttributes("textStyle").color ?? (dark ? "#ffffff" : "#111827") }} />
                  </button>
                  {showColors && (
                    <div
                      onMouseDown={e => e.preventDefault()}
                      className={`absolute top-full left-0 mt-1 z-50 rounded-xl border shadow-xl p-3 w-48 ${dark ? "bg-[#1c1f27] border-white/10" : "bg-white border-gray-200"}`}
                    >
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${labelCls}`}>Text colour</p>
                      <div className="grid grid-cols-5 gap-2">
                        {COLORS.map(c => (
                          <button
                            key={c.value}
                            title={c.label}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => {
                              if (c.value === "inherit") {
                                editor?.chain().focus().unsetColor().run();
                              } else {
                                editor?.chain().focus().setColor(c.value).run();
                              }
                              setShowColors(false);
                            }}
                            className="h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110"
                            style={{
                              backgroundColor: c.value === "inherit" ? "transparent" : c.value,
                              borderColor: c.value === "inherit" ? (dark ? "rgba(255,255,255,0.2)" : "#d1d5db") : c.value,
                            }}
                          >
                            {c.value === "inherit" && (
                              <svg className={`h-3.5 w-3.5 mx-auto ${labelCls}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Image upload */}
                <button title="Upload image" onMouseDown={e => e.preventDefault()} onClick={() => imgInputRef.current?.click()} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn} ${imgUploading ? "opacity-50 cursor-wait" : ""}`}>
                  {imgUploading ? (
                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </button>

                {/* Code block */}
                <button title="Code block" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} data-active={editor?.isActive("codeBlock") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </button>
              </div>

              {/* Link input bar */}
              {showLinkBar && (
                <div className={`flex items-center gap-2 px-3 py-2 border-b ${divider}`}>
                  <svg className={`h-3.5 w-3.5 shrink-0 ${labelCls}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  <input
                    autoFocus
                    type="url"
                    value={linkInput}
                    onChange={e => setLinkInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkBar(false); }}
                    placeholder="https://example.com"
                    className={`flex-1 text-xs bg-transparent border-none focus:outline-none ${dark ? "text-white placeholder-white/20" : "text-gray-700 placeholder-gray-300"}`}
                  />
                  <button onClick={applyLink} className="text-xs font-medium text-brand hover:opacity-70 transition-opacity">Apply</button>
                  {editor?.isActive("link") && (
                    <button onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkBar(false); }} className="text-xs text-red-400 hover:opacity-70 transition-opacity">Remove</button>
                  )}
                  <button onClick={() => setShowLinkBar(false)} className={`text-xs ${labelCls} hover:opacity-70`}>✕</button>
                </div>
              )}

              <div className={`px-5 py-4 ${editorCls}`}>
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* Cover image */}
            <div className={`rounded-xl border p-5 space-y-3 ${card}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${labelCls}`}>Cover Image</p>
              {coverImage ? (
                <div className="relative">
                  <img src={coverImage} alt="" className="w-full h-44 object-cover rounded-lg" />
                  <button onClick={() => setCoverImage("")}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs hover:bg-black/80 transition-colors">
                    ✕
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center h-36 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${dark ? "border-white/10 hover:border-white/20" : "border-gray-200 hover:border-gray-300"}`}>
                  <svg className={`h-6 w-6 mb-2 ${labelCls}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-xs ${labelCls}`}>{uploading ? "Uploading…" : "Click to upload cover image"}</span>
                  <span className={`text-xs mt-1 ${dark ? "text-white/20" : "text-gray-300"}`}>PNG, JPG, WEBP — max 10 MB</span>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Slug + status row */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-xl border p-4 space-y-2 ${card}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${labelCls}`}>URL Slug</p>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="post-url-slug"
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputCls}`}
                />
              </div>
              <div className={`rounded-xl border p-4 space-y-3 ${card}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${labelCls}`}>Status</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { value: "draft",     label: "Draft",     icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
                    { value: "scheduled", label: "Scheduled", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                    { value: "published", label: "Publish",   icon: "M5 13l4 4L19 7" },
                  ] as const).map(opt => {
                    const active = status === opt.value;
                    const activeStyle =
                      opt.value === "published" ? dark ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-green-50 border-green-300 text-green-700" :
                      opt.value === "scheduled" ? dark ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400" : "bg-yellow-50 border-yellow-300 text-yellow-700" :
                      dark ? "bg-white/10 border-white/20 text-white" : "bg-gray-100 border-gray-300 text-gray-800";
                    const inactiveStyle = dark ? "border-white/5 text-white/30 hover:border-white/15 hover:text-white/50" : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600";
                    return (
                      <button key={opt.value} onClick={() => setStatus(opt.value)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-all ${active ? activeStyle : inactiveStyle}`}>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} />
                        </svg>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {status === "scheduled" && (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputCls}`}
                  />
                )}
                <p className={`text-xs ${labelCls}`}>
                  {status === "published" ? "Will go live immediately on save" :
                   status === "scheduled" ? scheduledAt ? `Scheduled for ${new Date(scheduledAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}` : "Pick a date and time above" :
                   "Saved privately, not visible on site"}
                </p>
              </div>
            </div>

            {/* ── SEO section ── */}
            <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
              <div className="flex items-center gap-2">
                <svg className={`h-4 w-4 ${labelCls}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className={`text-xs font-semibold uppercase tracking-wide ${labelCls}`}>SEO</p>
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                  seoColor === "green" ? "bg-green-500/15 text-green-500" :
                  seoColor === "yellow" ? "bg-yellow-500/15 text-yellow-500" :
                  "bg-red-500/15 text-red-500"
                }`}>{seoScore}%</span>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-medium ${labelCls}`}>Focus Keyword</label>
                <input
                  type="text"
                  value={focusKw}
                  onChange={(e) => setFocusKw(e.target.value)}
                  placeholder="e.g. financial coaching"
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputCls}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-medium ${labelCls}`}>Meta Title</label>
                  <span className={`text-xs ${effTitle.length > 60 ? "text-red-400" : effTitle.length >= 50 ? "text-green-400" : labelCls}`}>
                    {effTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || "Defaults to post title"}
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors ${inputCls}`}
                />
                <div className={`h-1 rounded-full overflow-hidden ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                  <div className={`h-full rounded-full transition-all ${effTitle.length > 60 ? "bg-red-500" : effTitle.length >= 50 ? "bg-green-500" : "bg-yellow-400"}`}
                    style={{ width: `${Math.min((effTitle.length / 60) * 100, 100)}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-medium ${labelCls}`}>Meta Description</label>
                  <span className={`text-xs ${effDesc.length > 160 ? "text-red-400" : effDesc.length >= 120 ? "text-green-400" : labelCls}`}>
                    {effDesc.length}/160
                  </span>
                </div>
                <textarea
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder={excerpt || "Defaults to excerpt"}
                  rows={3}
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none transition-colors resize-none ${inputCls}`}
                />
                <div className={`h-1 rounded-full overflow-hidden ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                  <div className={`h-full rounded-full transition-all ${effDesc.length > 160 ? "bg-red-500" : effDesc.length >= 120 ? "bg-green-500" : "bg-yellow-400"}`}
                    style={{ width: `${Math.min((effDesc.length / 160) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ════════════════ RIGHT — PREVIEW ════════════════ */}
      <div className={`w-1/2 flex flex-col overflow-hidden ${leftBg}`}>

        {/* Preview header */}
        <div className={`flex-none flex items-center justify-between px-6 py-3.5 border-b ${headerBg}`}>
          <div className={`flex items-center gap-1 rounded-lg p-1 ${dark ? "bg-white/5" : "bg-gray-100"}`}>
            <button onClick={() => setPreviewTab("post")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${previewTab === "post" ? dark ? "bg-white/10 text-white shadow-sm" : "bg-white text-gray-900 shadow-sm" : dark ? "text-white/30 hover:text-white/60" : "text-gray-500 hover:text-gray-700"}`}>
              Post Preview
            </button>
            <button onClick={() => setPreviewTab("seo")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${previewTab === "seo" ? dark ? "bg-white/10 text-white shadow-sm" : "bg-white text-gray-900 shadow-sm" : dark ? "text-white/30 hover:text-white/60" : "text-gray-500 hover:text-gray-700"}`}>
              SEO Preview
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${seoColor === "green" ? "bg-green-500" : seoColor === "yellow" ? "bg-yellow-500" : "bg-red-500"}`} />
            <span className={`text-xs ${labelCls}`}>
              SEO {seoScore >= 75 ? "Good" : seoScore >= 50 ? "Needs work" : "Poor"}
            </span>
          </div>
        </div>

        {/* Preview body */}
        <div className="flex-1 overflow-y-auto">

          {previewTab === "post" ? (
            <article className="mx-auto max-w-2xl px-8 py-12">

              {/* Cover image */}
              {coverImage ? (
                <img src={coverImage} alt={title} className="w-full rounded-xl object-cover h-56 mb-8" />
              ) : (
                <div className={`w-full h-56 rounded-xl mb-8 flex items-center justify-center ${dark ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-gray-100"}`}>
                  <svg className={`h-10 w-10 ${dark ? "text-white/10" : "text-gray-200"}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Date */}
              <p className={`text-sm ${labelCls}`}>
                {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>

              {/* Title */}
              <h1 className={`mt-2 text-3xl font-bold tracking-tight leading-tight ${headingCls}`}>
                {title || <span className={labelCls}>Post title will appear here…</span>}
              </h1>

              {/* Excerpt */}
              {excerpt && (
                <p className={`mt-4 text-base leading-relaxed border-l-4 pl-4 italic ${dark ? "text-white/40 border-white/10" : "text-gray-500 border-gray-200"}`}>{excerpt}</p>
              )}

              {/* Content */}
              <div
                className="mt-8 blog-content"
                dangerouslySetInnerHTML={{
                  __html: content || `<p style='color:${dark ? "#ffffff30" : "#d1d5db"}'>Your content will appear here as you write…</p>`,
                }}
              />
            </article>

          ) : (
            <div className="p-5 space-y-6">

              {/* Google search snippet */}
              <div className="space-y-2">
                <p className={`text-xs font-semibold uppercase tracking-wide ${labelCls}`}>Google Search Preview</p>
                <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-1 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 font-medium">Finance with Anne</p>
                      <p className="text-xs text-gray-400">anne-fawn.vercel.app › blog › {slug || "post-slug"}</p>
                    </div>
                  </div>
                  <p className="text-lg text-blue-600 font-medium leading-snug hover:underline cursor-pointer line-clamp-1">
                    {effTitle || <span className="text-gray-300">Post title…</span>}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {effDesc || <span className="text-gray-300">Meta description will appear here once you write an excerpt or set a meta description…</span>}
                  </p>
                </div>
              </div>

              {/* Social OG card */}
              <div className="space-y-2">
                <p className={`text-xs font-semibold uppercase tracking-wide ${labelCls}`}>Social Share Preview</p>
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {coverImage ? (
                    <img src={coverImage} alt="" className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                      <span className="text-xs text-gray-300">No cover image set</span>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">anne-fawn.vercel.app</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1 line-clamp-1">{effTitle || "Post title…"}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{effDesc || "Description…"}</p>
                  </div>
                </div>
              </div>

              {/* SEO checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${labelCls}`}>SEO Analysis</p>
                  <span className={`text-sm font-bold ${seoColor === "green" ? dark ? "text-green-400" : "text-green-600" : seoColor === "yellow" ? dark ? "text-yellow-400" : "text-yellow-600" : "text-red-500"}`}>
                    {seoScore}%
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${seoColor === "green" ? "bg-green-500" : seoColor === "yellow" ? "bg-yellow-400" : "bg-red-500"}`}
                    style={{ width: `${seoScore}%` }}
                  />
                </div>
                <div className="space-y-2 pt-1">
                  {seoChecks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className={`h-5 w-5 rounded-full flex-none flex items-center justify-center ${check.ok ? dark ? "bg-green-500/20" : "bg-green-100" : dark ? "bg-white/5" : "bg-gray-100"}`}>
                          {check.ok ? (
                            <svg className={`h-3 w-3 ${dark ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className={`h-3 w-3 ${labelCls}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-xs truncate ${check.ok ? dark ? "text-white/70" : "text-gray-700" : labelCls}`}>{check.label}</p>
                      </div>
                      <span className={`text-xs flex-none font-medium ${check.ok ? dark ? "text-green-400" : "text-green-600" : labelCls}`}>{check.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

    </div>
  );
}
