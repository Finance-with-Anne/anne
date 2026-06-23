"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EditorImageView } from "./EditorImage";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useRef, useState } from "react";

const COLORS = [
  { label: "Default", value: "inherit" },
  { label: "Brand",   value: "#070F1E" },
  { label: "Red",     value: "#ef4444" },
  { label: "Orange",  value: "#f97316" },
  { label: "Yellow",  value: "#eab308" },
  { label: "Green",   value: "#22c55e" },
  { label: "Blue",    value: "#3b82f6" },
  { label: "Purple",  value: "#8b5cf6" },
  { label: "Pink",    value: "#ec4899" },
  { label: "Gray",    value: "#6b7280" },
];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  dark: boolean;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({ value, onChange, dark, placeholder = "Start writing…", minHeight = 260 }: RichTextEditorProps) {
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showLinkBar, setShowLinkBar] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  const toolbarBtn = dark
    ? "text-white/40 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900";
  const divider = dark ? "border-white/5" : "border-gray-100";
  const sep = dark ? "bg-white/10" : "bg-gray-200";
  const labelCls = dark ? "text-white/40" : "text-gray-400";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Image.extend({ addNodeView() { return ReactNodeViewRenderer(EditorImageView); } }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editorProps: {
      attributes: { class: "focus:outline-none px-1" },
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []).filter(f => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        files.forEach(async (file) => {
          const form = new FormData();
          form.append("file", file);
          form.append("folder", "courses");
          const res = await fetch("/api/upload", { method: "POST", body: form });
          const data = await res.json();
          if (!data.url) return;
          const node = view.state.schema.nodes.image.create({ src: data.url });
          const tr = view.state.tr.insert(coords?.pos ?? view.state.selection.from, node);
          view.dispatch(tr);
        });
        return true;
      },
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItems = items.filter(i => i.type.startsWith("image/"));
        if (!imageItems.length) return false;
        event.preventDefault();
        imageItems.forEach(async (item) => {
          const file = item.getAsFile();
          if (!file) return;
          const form = new FormData();
          form.append("file", file);
          form.append("folder", "courses");
          const res = await fetch("/api/upload", { method: "POST", body: form });
          const data = await res.json();
          if (!data.url) return;
          const node = view.state.schema.nodes.image.create({ src: data.url });
          const tr = view.state.tr.replaceSelectionWith(node);
          view.dispatch(tr);
        });
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setImgUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "courses");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) editor.chain().focus().setImage({ src: data.url }).run();
    if (imgInputRef.current) imgInputRef.current.value = "";
    setImgUploading(false);
  }

  function toggleLinkBar() {
    if (editor?.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    setLinkInput(editor?.getAttributes("link").href ?? "");
    setShowLinkBar(v => !v);
  }

  function applyLink() {
    if (!linkInput) return;
    editor?.chain().focus().setLink({ href: linkInput, target: "_blank" }).run();
    setShowLinkBar(false);
    setLinkInput("");
  }

  const border = dark ? "border-white/10" : "border-gray-200";
  const bg = dark ? "bg-[#111318]" : "bg-white";
  const toolbarBg = dark ? "bg-[#1a1d26]" : "bg-gray-50";
  const toolbarDivider = dark ? "border-white/10" : "border-gray-200";

  return (
    <div className={`rounded-xl border ${border} ${bg}`}>
      {/* Hidden file input */}
      <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Toolbar — no sticky, just sits at top */}
      <div className={`flex flex-wrap items-center gap-0.5 px-3 py-2 border-b rounded-t-xl ${toolbarDivider} ${toolbarBg}`}>

        {/* Undo / Redo */}
        <button title="Undo" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} className={`h-7 w-7 rounded flex items-center justify-center transition-colors disabled:opacity-25 ${toolbarBtn}`}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
        </button>
        <button title="Redo" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} className={`h-7 w-7 rounded flex items-center justify-center transition-colors disabled:opacity-25 ${toolbarBtn}`}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
        </button>

        <div className={`w-px h-4 mx-1 ${sep}`} />

        {/* B / I / U / S */}
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

        <div className={`w-px h-4 mx-1 ${sep}`} />

        {/* H1 / H2 / H3 */}
        {[1, 2, 3].map(level => (
          <button key={level} title={`Heading ${level}`} onMouseDown={e => e.preventDefault()}
            onClick={() => editor?.chain().focus().toggleHeading({ level: level as 1|2|3 }).run()}
            data-active={editor?.isActive("heading", { level }) ?? false}
            className={`h-7 px-2 rounded text-xs font-bold transition-colors ${toolbarBtn}`}>
            H{level}
          </button>
        ))}

        <div className={`w-px h-4 mx-1 ${sep}`} />

        {/* Align */}
        {[
          { title: "Align left",   align: "left",   path: "M4 6h16M4 12h10M4 18h14" },
          { title: "Align center", align: "center", path: "M4 6h16M7 12h10M5 18h14" },
          { title: "Align right",  align: "right",  path: "M4 6h16M10 12h10M6 18h14" },
        ].map(a => (
          <button key={a.align} title={a.title} onMouseDown={e => e.preventDefault()}
            onClick={() => editor?.chain().focus().setTextAlign(a.align).run()}
            data-active={editor?.isActive({ textAlign: a.align }) ?? false}
            className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={a.path} />
            </svg>
          </button>
        ))}

        <div className={`w-px h-4 mx-1 ${sep}`} />

        {/* Bullet list */}
        <button title="Bullet list" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBulletList().run()} data-active={editor?.isActive("bulletList") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
        </button>
        {/* Ordered list */}
        <button title="Numbered list" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleOrderedList().run()} data-active={editor?.isActive("orderedList") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
        </button>
        {/* Blockquote */}
        <button title="Blockquote" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBlockquote().run()} data-active={editor?.isActive("blockquote") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
        </button>

        <div className={`w-px h-4 mx-1 ${sep}`} />

        {/* Link */}
        <button title="Insert link" onMouseDown={e => e.preventDefault()} onClick={toggleLinkBar} data-active={editor?.isActive("link") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        </button>

        {/* Text colour */}
        <div className="relative">
          <button title="Text colour" onMouseDown={e => e.preventDefault()} onClick={() => setShowColors(v => !v)}
            className={`h-7 w-7 rounded flex flex-col items-center justify-center gap-0.5 transition-colors ${toolbarBtn}`}>
            <span className="text-xs font-bold leading-none">A</span>
            <span className="w-4 h-1 rounded-full" style={{ backgroundColor: editor?.getAttributes("textStyle").color ?? (dark ? "#ffffff" : "#111827") }} />
          </button>
          {showColors && (
            <div onMouseDown={e => e.preventDefault()} className={`absolute top-full left-0 mt-1 z-50 rounded-xl border shadow-xl p-3 w-48 ${dark ? "bg-[#1c1f27] border-white/10" : "bg-white border-gray-200"}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${labelCls}`}>Text colour</p>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map(c => (
                  <button key={c.value} title={c.label} onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      if (c.value === "inherit") editor?.chain().focus().unsetColor().run();
                      else editor?.chain().focus().setColor(c.value).run();
                      setShowColors(false);
                    }}
                    className="h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c.value === "inherit" ? "transparent" : c.value, borderColor: c.value === "inherit" ? (dark ? "rgba(255,255,255,0.2)" : "#d1d5db") : c.value }}>
                    {c.value === "inherit" && (
                      <svg className={`h-3.5 w-3.5 mx-auto ${labelCls}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Image upload */}
        <button title="Upload image" onMouseDown={e => e.preventDefault()} onClick={() => imgInputRef.current?.click()}
          className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn} ${imgUploading ? "opacity-50 cursor-wait" : ""}`}>
          {imgUploading
            ? <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            : <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          }
        </button>

        {/* Code block */}
        <button title="Code block" onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} data-active={editor?.isActive("codeBlock") ?? false} className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${toolbarBtn}`}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        </button>
      </div>

      {/* Link bar */}
      {showLinkBar && (
        <div className={`flex items-center gap-2 px-3 py-2 border-b ${toolbarDivider}`}>
          <svg className={`h-3.5 w-3.5 shrink-0 ${labelCls}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          <input autoFocus type="url" value={linkInput} onChange={e => setLinkInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkBar(false); }}
            placeholder="https://example.com"
            className={`flex-1 text-xs bg-transparent border-none focus:outline-none ${dark ? "text-white placeholder-white/20" : "text-gray-700 placeholder-gray-300"}`}
          />
          <button onClick={applyLink} className="text-xs font-medium text-[#0822C0] hover:opacity-70 transition-opacity">Apply</button>
          <button onClick={() => setShowLinkBar(false)} className={`text-xs ${labelCls} hover:opacity-70 transition-opacity`}>Cancel</button>
        </div>
      )}

      {/* Editor content */}
      <div
        className={`px-5 py-4 prose prose-sm max-w-none rounded-b-xl ${dark ? "prose-invert text-white/85" : "text-gray-800"}`}
        style={{ minHeight }}
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
