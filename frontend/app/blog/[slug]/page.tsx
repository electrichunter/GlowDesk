"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { type BlogPost } from "@/lib/types";

export default function BlogPostSinglePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchSinglePost = async () => {
      try {
        const { apiRequest } = await import("@/lib/api-client");
        const { data } = await apiRequest<BlogPost>(`/blog/${resolvedParams.slug}`);
        if (data) {
          setPost(data);
        }
      } catch (err) {
        console.error("Blog post fetch error:", err);
      }
    };

    fetchSinglePost();
  }, [resolvedParams.slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md space-y-4">
          <span className="text-4xl block">🔍</span>
          <h1 className="text-xl font-black text-[#1E1B4B]">Blog Yazısı Bulunamadı</h1>
          <p className="text-slate-500 text-xs">Aradığınız makale yayından kaldırılmış veya adresi değişmiş olabilir.</p>
          <Link href="/blog" className="btn-primary text-xs py-2 px-4 inline-block font-bold">
            ← Blog Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/blog" className="text-xs font-extrabold text-slate-600 hover:text-slate-900 flex items-center gap-1">
            ← Tüm Blog Yazıları
          </Link>
          <Link href="/" className="text-lg font-black text-[#1E1B4B] font-display">
            Glow<span className="text-cyan-500">Desk</span>
          </Link>
        </div>
      </header>

      {/* Makale Başlık & Metadata Hero */}
      <div className="bg-white border-b border-slate-200 py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-cyan-50 text-cyan-800 text-xs font-extrabold uppercase rounded-full border border-cyan-200">
              {post.category || "Genel"}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {new Date(post.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-[#1E1B4B] font-display leading-tight tracking-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-[#1E1B4B] text-cyan-400 font-bold text-sm flex items-center justify-center">
              ✍️
            </div>
            <div>
              <span className="block text-xs font-bold text-[#1E1B4B]">{post.author_name}</span>
              <span className="block text-[10px] text-slate-400 font-medium">GlowDesk İçerik Editörü</span>
            </div>
          </div>
        </div>
      </div>

      {/* Görsel */}
      {post.cover_image && (
        <div className="max-w-4xl mx-auto px-6 -mt-6">
          <img src={post.cover_image} alt={post.title} className="w-full h-80 md:h-[450px] object-cover rounded-3xl shadow-xl border border-slate-200" />
        </div>
      )}

      {/* Makale Gövdesi (Tailwind @tailwindcss/typography HTML render) */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <article
          className="blog-prose prose prose-slate lg:prose-lg max-w-none prose-headings:font-display prose-headings:font-black prose-headings:text-[#1E1B4B] prose-a:text-cyan-600 prose-img:rounded-2xl shadow-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Paylaş / Geri Dön */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-center">
          <Link href="/blog" className="btn-secondary text-xs py-2.5 px-4 font-bold">
            ← Diğer Makalelere Göz At
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Makale bağlantısı kopyalandı!");
              }
            }}
            className="btn-cyan text-xs py-2.5 px-4 font-extrabold shadow-xs"
          >
            🔗 Makaleyi Paylaş
          </button>
        </div>
      </main>
    </div>
  );
}
