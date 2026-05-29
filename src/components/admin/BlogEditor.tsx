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
  const [published, setPublished]       = useState(initialData?.published ?? false);
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [error, setError]               = useState("");
  const [previewTab, setPreviewTab]     = useState<PreviewTab>("post");
  const [content, setContent]           = useState(initialData?.content ?? "");
  const [metaTitle, setMetaTitle]       = useState(initialData?.meta_title ?? "");
  const [metaDesc, setMetaDesc]         = useState(initialData?.meta_description ?? "");
  const [focusKw, setFocusKw]           = useState(initialData?.focus_keyword ?? "");

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
      attributes: { class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] px-1" },
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

  const addImageToEditor = useCallback(() => {
    const url = window.prompt("Image URL");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }, [editor]);

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
  const editorCls  = dark ? "text-white/80 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-white/20" : "text-gray-800";

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
            <button onClick={() => handleSave(false)} disabled={saving}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${dark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              Save Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50">
              {saving ? "Publishing…" : "Publish"}
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
              <div className={`flex flex-wrap items-center gap-0.5 px-4 py-2 border-b ${divider}`}>
                {[
                  { label: "B",  action: () => editor?.chain().focus().toggleBold().run(),      active: () => editor?.isActive("bold")      ?? false, title: "Bold" },
                  { label: "I",  action: () => editor?.chain().focus().toggleItalic().run(),    active: () => editor?.isActive("italic")    ?? false, title: "Italic" },
                  { label: "U",  action: () => editor?.chain().focus().toggleUnderline().run(), active: () => editor?.isActive("underline") ?? false, title: "Underline" },
                  { label: "S",  action: () => editor?.chain().focus().toggleStrike().run(),    active: () => editor?.isActive("strike")    ?? false, title: "Strikethrough" },
                ].map(btn => (
                  <button key={btn.title} title={btn.title} onClick={btn.action} data-active={btn.active()}
                    className={`h-7 w-7 rounded flex items-center justify-center text-xs font-bold transition-colors ${toolbarBtn}`}>
                    {btn.label}
                  </button>
                ))}

                <div className={`w-px h-4 mx-1 ${dark ? "bg-white/10" : "bg-gray-200"}`} />

                {[1, 2, 3].map(level => (
                  <button key={level} title={`Heading ${level}`}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: level as 1|2|3 }).run()}
                    data-active={editor?.isActive("heading", { level }) ?? false}
                    className={`h-7 px-2 rounded text-xs font-bold transition-colors ${toolbarBtn}`}>
                    H{level}
                  </button>
                ))}

                <div className={`w-px h-4 mx-1 ${dark ? "bg-white/10" : "bg-gray-200"}`} />

                <button title="Bullet list" onClick={() => editor?.chain().focus().toggleBulletList().run()} data-active={editor?.isActive("bulletList") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <button title="Ordered list" onClick={() => editor?.chain().focus().toggleOrderedList().run()} data-active={editor?.isActive("orderedList") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8" /></svg>
                </button>
                <button title="Blockquote" onClick={() => editor?.chain().focus().toggleBlockquote().run()} data-active={editor?.isActive("blockquote") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                </button>
                <button title="Add image" onClick={addImageToEditor} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                <button title="Code block" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} data-active={editor?.isActive("codeBlock") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </button>
              </div>
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
              <div className={`rounded-xl border p-4 ${card}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${labelCls}`}>Status</p>
                  <button onClick={() => setPublished(!published)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${published ? "bg-green-500" : dark ? "bg-white/10" : "bg-gray-200"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${published ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <p className={`text-xs ${labelCls}`}>{published ? "Will publish immediately" : "Saved as draft"}</p>
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
            // Post preview shown as a white "page" card inside the dark container
            <div className={`p-5`}>
              <div className={`text-xs font-medium mb-3 ${labelCls}`}>Preview — how it looks on the public site</div>
              <div className="rounded-xl overflow-hidden shadow-lg">
            <article className="bg-white mx-auto max-w-full px-8 py-10">

              {/* Cover image */}
              {coverImage ? (
                <img src={coverImage} alt={title} className="w-full rounded-xl object-cover h-56 mb-8" />
              ) : (
                <div className="w-full h-56 rounded-xl bg-gray-50 border border-gray-100 mb-8 flex items-center justify-center">
                  <svg className="h-10 w-10 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Date */}
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>

              {/* Title */}
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                {title || <span className="text-gray-200">Post title will appear here…</span>}
              </h1>

              {/* Excerpt */}
              {excerpt && (
                <p className="mt-4 text-base text-gray-500 leading-relaxed border-l-4 border-gray-200 pl-4 italic">{excerpt}</p>
              )}

              {/* Content */}
              <div
                className="mt-8 prose prose-gray max-w-none prose-headings:font-bold prose-a:text-brand prose-img:rounded-xl"
                dangerouslySetInnerHTML={{
                  __html: content || "<p style='color:#d1d5db'>Your content will appear here as you write…</p>",
                }}
              />
            </article>
              </div>
            </div>

          ) : (
            <div className="p-5 space-y-6">

              {/* Google search snippet */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Google Search Preview</p>
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
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Social Share Preview</p>
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
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">SEO Analysis</p>
                  <span className={`text-sm font-bold ${seoColor === "green" ? "text-green-600" : seoColor === "yellow" ? "text-yellow-600" : "text-red-500"}`}>
                    {seoScore}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${seoColor === "green" ? "bg-green-500" : seoColor === "yellow" ? "bg-yellow-400" : "bg-red-500"}`}
                    style={{ width: `${seoScore}%` }}
                  />
                </div>
                <div className="space-y-2 pt-1">
                  {seoChecks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className={`h-5 w-5 rounded-full flex-none flex items-center justify-center ${check.ok ? "bg-green-100" : "bg-gray-100"}`}>
                          {check.ok ? (
                            <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-xs truncate ${check.ok ? "text-gray-700" : "text-gray-400"}`}>{check.label}</p>
                      </div>
                      <span className={`text-xs flex-none font-medium ${check.ok ? "text-green-600" : "text-gray-400"}`}>{check.value}</span>
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
