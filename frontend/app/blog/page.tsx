"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type BlogPost } from "@/lib/types";

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { apiRequest } = await import("@/lib/api-client");
        const { FALLBACK_BLOG_POSTS } = await import("@/lib/blog-posts");
        const { data } = await apiRequest<BlogPost[]>("/blog");
        if (data && Array.isArray(data) && data.length > 0) {
          setPosts(data);
        } else {
          setPosts(FALLBACK_BLOG_POSTS);
        }
      } catch (err) {
        console.error("Blog posts fetch error:", err);
        const { FALLBACK_BLOG_POSTS } = await import("@/lib/blog-posts");
        setPosts(FALLBACK_BLOG_POSTS);
      }
    };

    fetchPosts();
  }, []);

  const categories = Array.from(new Set(posts.map((p) => p.category || "Genel")));

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header / Nav */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-black text-[#1E1B4B] font-display tracking-tight">
              Glow<span className="text-cyan-500">Desk</span> <span className="text-xs bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full ml-1">Blog</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-slate-900">
              Giriş Yap
            </Link>
            <Link href="/register" className="btn-cyan text-xs py-2 px-4 font-extrabold shadow-sm">
              Ücretsiz Dene
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1E1B4B] to-slate-900 text-white py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-extrabold rounded-full uppercase tracking-wider">
            GlowDesk Bilgi Merkezi & Rehberler
          </span>
          <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white">
            Salon Yönetimi & Büyüme İpuçları
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Kuaför, güzellik salonu ve spa işletmenizi büyütmek, randevu no-show oranlarını düşürmek ve dijitalleşmek için hazırladığımız rehberler.
          </p>

          {/* Arama Barı */}
          <div className="max-w-xl mx-auto pt-4">
            <input
              type="text"
              placeholder="Blog yazılarında ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-white text-slate-900 font-semibold text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-400"
            />
          </div>
        </div>
      </section>

      {/* Ana İçerik */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        {/* Kategori Filtreleri */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-[#1E1B4B] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            Tüm Yazılar ({posts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#1E1B4B] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Yazı Kartları Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  {post.cover_image ? (
                    <div className="h-48 w-full overflow-hidden bg-slate-100">
                      <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-indigo-900 to-[#1E1B4B] p-6 flex items-center justify-center text-center">
                      <span className="text-xl font-extrabold text-cyan-400 font-display">{post.title}</span>
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-900 text-[10px] font-extrabold uppercase rounded-md border border-indigo-100">
                        {post.category || "Genel"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(post.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[#1E1B4B] line-clamp-2 hover:text-cyan-600 transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                      {post.excerpt || "Devamını okumak için tıklayınız."}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">✍️ {post.author_name}</span>
                  <Link href={`/blog/${post.slug}`} className="text-xs font-extrabold text-cyan-600 hover:text-cyan-800">
                    Oku →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <span className="text-4xl block">📝</span>
            <h3 className="text-lg font-extrabold text-[#1E1B4B]">Henüz Blog Yazısı Yayınlanmadı</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Super Admin paneli üzerindeki Tiptap blog editörü ile yeni makaleler oluşturabilirsiniz.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
