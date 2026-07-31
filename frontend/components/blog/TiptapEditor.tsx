"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-cyan-600 underline font-semibold",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-2xl max-w-full my-4 shadow-md border border-slate-200",
        },
      }),
    ],
    content: content || "<p>Blog yazınızı veya rehber makalenizi yazmaya başlayın...</p>",
    editorProps: {
      attributes: {
        class:
          "ProseMirror blog-prose max-w-none focus:outline-none min-h-[350px] p-5 text-slate-800 bg-white font-sans text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="p-4 text-slate-400 text-xs font-semibold animate-pulse">Tiptap Blog Editörü Yükleniyor...</div>;
  }

  const addImage = () => {
    const url = prompt("Görsel URL Adresi Girin:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setCustomLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = prompt("Bağlantı (Link) URL Adresi Girin:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Editör Zengin Araç Çubuğu (Zengin Stil Toolbar) */}
      <div className="bg-slate-100 border-b border-slate-200 p-2.5 flex flex-wrap gap-1.5 items-center">
        {/* Başlık Stilleri */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
            editor.isActive("heading", { level: 1 }) ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Ana Başlık (H1)"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
            editor.isActive("heading", { level: 2 }) ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Alt Başlık (H2)"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
            editor.isActive("heading", { level: 3 }) ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Küçük Başlık (H3)"
        >
          H3
        </button>

        <span className="h-5 w-px bg-slate-300 mx-1" />

        {/* Metin Formatlama */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
            editor.isActive("bold") ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Kalın (Bold)"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1 rounded-lg text-xs italic font-bold transition-all ${
            editor.isActive("italic") ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="İtalik (Italic)"
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2.5 py-1 rounded-lg text-xs line-through transition-all ${
            editor.isActive("strike") ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Üstü Çizili (Strike)"
        >
          S
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
            editor.isActive("code") ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Satır İçi Kod (Code)"
        >
          &lt;/&gt;
        </button>

        <span className="h-5 w-px bg-slate-300 mx-1" />

        {/* Liste ve Alıntı */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            editor.isActive("bulletList") ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Maddeli Liste"
        >
          • Liste
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            editor.isActive("orderedList") ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Sıralı Liste (1. 2. 3.)"
        >
          1. Sıralı
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            editor.isActive("blockquote") ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Alıntı Kutusu (Quote)"
        >
          &quot; Alıntı
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
            editor.isActive("codeBlock") ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Kod Bloğu (Code Block)"
        >
          💻 Kod Bloğu
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all"
          title="Çizgi Ayraç (Horizontal Rule)"
        >
          — Ayraç
        </button>

        <span className="h-5 w-px bg-slate-300 mx-1" />

        {/* Medya ve Bağlantı */}
        <button
          type="button"
          onClick={setCustomLink}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            editor.isActive("link") ? "bg-[#1E1B4B] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Bağlantı (Link) Ekle"
        >
          🔗 Link
        </button>

        <button
          type="button"
          onClick={addImage}
          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all"
          title="Görsel Ekle"
        >
          🖼️ Görsel
        </button>

        <span className="h-5 w-px bg-slate-300 mx-1" />

        {/* Geri Al / İleri Al */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 rounded-lg text-xs bg-white text-slate-600 border border-slate-200 hover:bg-slate-200"
          title="Geri Al (Undo)"
        >
          ↩️
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded-lg text-xs bg-white text-slate-600 border border-slate-200 hover:bg-slate-200"
          title="İleri Al (Redo)"
        >
          ↪️
        </button>
      </div>

      {/* Editör Metin Alanı */}
      <EditorContent editor={editor} />
    </div>
  );
}
