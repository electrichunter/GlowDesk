"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getCurrentSession,
  clearSessionCookie,
  getRoleLabel,
  getRoleBadgeColor,
  type SessionPayload,
} from "@/lib/session";

// Icons
const IconChevronDown = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const IconMoon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const IconMenu = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconX = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SECTOR_LOGO_MAP: Record<string, { label: string; icon: string }> = {
  guzellik: { label: "Güzellik Salonu", icon: "💄" },
  salon: { label: "Güzellik Salonu", icon: "💄" },
  berber: { label: "Berber & Kuaför", icon: "💈" },
  masaj: { label: "Masaj & Spa", icon: "💆" },
  klinik: { label: "Klinik & Estetik", icon: "🩺" },
  hukuk: { label: "Hukuk Bürosu", icon: "⚖️" },
  restoran: { label: "Restoran", icon: "🍽️" },
  blog: { label: "Blog", icon: "📝" },
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [session, setSession] = useState<SessionPayload | null>(null);

  // Dynamic Sector Detection for Logo
  const activeSectorInfo = (() => {
    if (pathname.startsWith("/sektorler/guzellik")) return SECTOR_LOGO_MAP["guzellik"];
    if (pathname.startsWith("/sektorler/berber")) return SECTOR_LOGO_MAP["berber"];
    if (pathname.startsWith("/sektorler/masaj")) return SECTOR_LOGO_MAP["masaj"];
    if (pathname.startsWith("/sektorler/klinik")) return SECTOR_LOGO_MAP["klinik"];
    if (pathname.startsWith("/sektorler/hukuk")) return SECTOR_LOGO_MAP["hukuk"];
    if (pathname.startsWith("/sektorler/restoran")) return SECTOR_LOGO_MAP["restoran"];
    if (pathname.startsWith("/sektorler/salon")) return SECTOR_LOGO_MAP["salon"];
    if (pathname.startsWith("/blog")) return SECTOR_LOGO_MAP["blog"];
    if (session?.sector && SECTOR_LOGO_MAP[session.sector]) return SECTOR_LOGO_MAP[session.sector];
    return null;
  })();

  // ── Scroll Progress & Active Section Detector (Scroll Animation) ──
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
      setScrolled(window.scrollY > 20);

      // Section scroll highlight
      const featuresEl = document.getElementById("features");
      const pricingEl = document.getElementById("pricing");

      if (pricingEl && window.scrollY >= pricingEl.offsetTop - 150) {
        setActiveSection("pricing");
      } else if (featuresEl && window.scrollY >= featuresEl.offsetTop - 150) {
        setActiveSection("features");
      } else {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const active = getCurrentSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(active);
  }, [pathname]);

  const handleLogout = () => {
    clearSessionCookie();
    localStorage.removeItem("glowdesk_active_user");
    setSession(null);
    setUserDropdownOpen(false);
    setMenuOpen(false);
    router.push("/login");
  };

  const handleNavAnchor = (e: React.MouseEvent, sectionId: string) => {
    setMenuOpen(false);
    setActiveDropdown(null);
    setActiveSection(sectionId);
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(null, "", `/#${sectionId}`);
      }
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      
      {/* ── 0. SAYFA SCROLL İLERLEME ÇUBUĞU (Scroll Progress Indicator) ── */}
      <div 
        className="h-1 bg-[#0066FF] transition-all duration-75 ease-out shadow-xs" 
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ── 1. ÜST DUYURU BANDI ── */}
      <div className="bg-[#0066FF] text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <span className="inline-block animate-pulse">✨</span>
        <span>Açılışa Özel 1 Ay Ücretsiz Deneme — Taahhütsüz & Komisyonsuz Salon Otomasyonu</span>
        <span className="inline-block animate-pulse">✨</span>
      </div>

      {/* ── 2. SCROLL ANİMASYONLU ANA NAVBAR ── */}
      <nav
        className={`transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-layered border-b border-slate-200/80 py-3" 
            : "bg-white/80 backdrop-blur-xs border-b border-slate-200/50 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Brand Logo with Dynamic Sector Tag (Matching Upload Screenshot) */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#0066FF] text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-display">
                Glow<span className="text-[#0066FF]">Desk</span>
              </span>
              {activeSectorInfo && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-100/80 text-[#0066FF] border border-cyan-200 text-xs font-extrabold flex items-center gap-1 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                  <span>{activeSectorInfo.icon}</span>
                  <span>{activeSectorInfo.label}</span>
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            
            {/* Hizmetler Dropdown */}
            <div 
              className="relative group py-1"
              onMouseEnter={() => setActiveDropdown("services")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                type="button" 
                className="flex items-center gap-1 hover:text-[#0066FF] transition-colors py-1 cursor-pointer"
              >
                Hizmetler
                <IconChevronDown />
              </button>
              {activeDropdown === "services" && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link href="/#features" onClick={(e) => handleNavAnchor(e, "features")} className="block px-3.5 py-2.5 rounded-xl hover:bg-blue-50 hover:text-[#0066FF] transition-all hover:translate-x-1">
                    <div className="font-bold text-slate-800 text-xs">⚡ No-Show Engelleyici</div>
                    <div className="text-[11px] text-slate-500 font-normal">Gelmeyen müşterileri otomatik tespit eder.</div>
                  </Link>
                  <Link href="/#features" onClick={(e) => handleNavAnchor(e, "features")} className="block px-3.5 py-2.5 rounded-xl hover:bg-blue-50 hover:text-[#0066FF] transition-all hover:translate-x-1">
                    <div className="font-bold text-slate-800 text-xs">💬 WhatsApp Otomasyonu</div>
                    <div className="text-[11px] text-slate-500 font-normal">Tek tıkla randevu onay mesajları.</div>
                  </Link>
                  <Link href="/#features" onClick={(e) => handleNavAnchor(e, "features")} className="block px-3.5 py-2.5 rounded-xl hover:bg-blue-50 hover:text-[#0066FF] transition-all hover:translate-x-1">
                    <div className="font-bold text-slate-800 text-xs">📋 Bekleme Listesi Motoru</div>
                    <div className="text-[11px] text-slate-500 font-normal">Boş slotları otomatik doldurur.</div>
                  </Link>
                </div>
              )}
            </div>

            {/* Sektörler Dropdown */}
            <div 
              className="relative group py-1"
              onMouseEnter={() => setActiveDropdown("sectors")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                type="button" 
                className="flex items-center gap-1 hover:text-[#0066FF] transition-colors py-1 cursor-pointer"
              >
                Sektörler
                <IconChevronDown />
              </button>
              {activeDropdown === "sectors" && (
                <div className="absolute top-full left-0 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link href="/sektorler/guzellik" onClick={() => setActiveDropdown(null)} className="block px-3.5 py-2 rounded-xl hover:bg-blue-50 hover:text-[#0066FF] text-xs font-bold text-slate-700 hover:translate-x-1 transition-all">💄 Güzellik &amp; Estetik</Link>
                  <Link href="/sektorler/berber" onClick={() => setActiveDropdown(null)} className="block px-3.5 py-2 rounded-xl hover:bg-blue-50 hover:text-[#0066FF] text-xs font-bold text-slate-700 hover:translate-x-1 transition-all">💈 Berber &amp; Kuaför</Link>
                  <Link href="/sektorler/masaj" onClick={() => setActiveDropdown(null)} className="block px-3.5 py-2 rounded-xl hover:bg-blue-50 hover:text-[#0066FF] text-xs font-bold text-slate-700 hover:translate-x-1 transition-all">💆 Masaj Terapisi</Link>
                  <Link href="/sektorler/masaj" onClick={() => setActiveDropdown(null)} className="block px-3.5 py-2 rounded-xl hover:bg-blue-50 hover:text-[#0066FF] text-xs font-bold text-slate-700 hover:translate-x-1 transition-all">🌿 Spa &amp; Wellness</Link>
                  <Link href="/sektorler/klinik" onClick={() => setActiveDropdown(null)} className="block px-3.5 py-2 rounded-xl hover:bg-blue-50 hover:text-[#0066FF] text-xs font-bold text-slate-700 hover:translate-x-1 transition-all">🩺 Klinik &amp; Dermatoloji</Link>
                </div>
              )}
            </div>

            {/* Scroll Animated Section Links */}
            <Link
              href="/#features"
              onClick={(e) => handleNavAnchor(e, "features")}
              className={`transition-all cursor-pointer relative py-1 ${
                activeSection === "features" ? "text-[#0066FF] font-extrabold" : "hover:text-[#0066FF]"
              }`}
            >
              Özellikler
              {activeSection === "features" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0066FF] rounded-full animate-in fade-in duration-200" />
              )}
            </Link>

            <Link
              href="/#pricing"
              onClick={(e) => handleNavAnchor(e, "pricing")}
              className={`transition-all cursor-pointer relative py-1 ${
                activeSection === "pricing" ? "text-[#0066FF] font-extrabold" : "hover:text-[#0066FF]"
              }`}
            >
              Fiyatlar
              {activeSection === "pricing" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0066FF] rounded-full animate-in fade-in duration-200" />
              )}
            </Link>

            <Link
              href="/blog"
              className="hover:text-[#0066FF] transition-colors"
            >
              Blog
            </Link>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            
            {/* Dark Mode Icon Button */}
            <button
              type="button"
              aria-label="Koyu Tema Değiştir"
              className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors hidden sm:flex"
            >
              <IconMoon />
            </button>

            {/* Session States */}
            {session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 pr-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0066FF] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {session.role === "admin" ? "👑" : session.role === "owner" ? "💼" : "👤"}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                    {session.fullName || session.businessName || "Kullanıcı"}
                  </span>
                  <IconChevronDown />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{session.fullName || "Kullanıcı"}</p>
                      <p className="text-[10px] text-slate-400 truncate">{session.email}</p>
                    </div>

                    {(session.role === "owner" || session.role === "staff") && (
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#0066FF]"
                      >
                        📊 Salon Yönetim Paneli
                      </Link>
                    )}

                    {session.role === "customer" && (
                      <Link
                        href="/my-appointments"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#0066FF]"
                      >
                        📋 Randevularım
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      🚪 Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary-blue text-xs py-2.5 px-6 shadow-sm"
              >
                Giriş Yap
              </Link>
            )}

            {/* Mobile Menu Toggle (Min 44x44 Touch Target) */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Mobil Menüyü Aç/Kapat"
              className="lg:hidden w-11 h-11 rounded-2xl text-slate-800 bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              {menuOpen ? <IconX /> : <IconMenu />}
            </button>
          </div>
        </div>

        {/* ── 3. LÜKS MOBİL MENÜ (Navbar Altında Kesintisiz Hizalanan Çekmece) ── */}
        {menuOpen && (
          <div className="lg:hidden bg-white/98 backdrop-blur-2xl border-t border-slate-200/80 px-6 py-6 space-y-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Sektör Hızlı Seçimleri */}
            <div>
              <div className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 mb-2.5">
                Sektör Çözümleri
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/sektorler/guzellik"
                  onClick={() => setMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs font-bold text-slate-800 flex items-center gap-2 active:bg-blue-100"
                >
                  <span>💄</span> <span>Güzellik Salonu</span>
                </Link>
                <Link
                  href="/sektorler/berber"
                  onClick={() => setMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs font-bold text-slate-800 flex items-center gap-2 active:bg-blue-100"
                >
                  <span>💈</span> <span>Berber &amp; Kuaför</span>
                </Link>
                <Link
                  href="/sektorler/masaj"
                  onClick={() => setMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs font-bold text-slate-800 flex items-center gap-2 active:bg-blue-100"
                >
                  <span>💆</span> <span>Masaj &amp; Spa</span>
                </Link>
                <Link
                  href="/sektorler/klinik"
                  onClick={() => setMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs font-bold text-slate-800 flex items-center gap-2 active:bg-blue-100"
                >
                  <span>🩺</span> <span>Klinik &amp; Estetik</span>
                </Link>
              </div>
            </div>

            {/* Ana Navigasyon Bağlantıları */}
            <div className="space-y-1 border-t border-slate-100 pt-4">
              <div className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 mb-2">
                Menü
              </div>
              <Link
                href="/#features"
                onClick={(e) => handleNavAnchor(e, "features")}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100/80 text-sm font-bold text-slate-800 active:scale-[0.99] transition-all"
              >
                <span>⚡ Özellikler &amp; No-Show Motoru</span>
                <span className="text-slate-400">→</span>
              </Link>
              <Link
                href="/#pricing"
                onClick={(e) => handleNavAnchor(e, "pricing")}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100/80 text-sm font-bold text-slate-800 active:scale-[0.99] transition-all"
              >
                <span>💳 Paketler &amp; Fiyatlandırma</span>
                <span className="text-slate-400">→</span>
              </Link>
              <Link
                href="/blog"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100/80 text-sm font-bold text-slate-800 active:scale-[0.99] transition-all"
              >
                <span>📝 Blog &amp; Rehberler</span>
                <span className="text-slate-400">→</span>
              </Link>
            </div>

            {/* Mobil Eylem Butonları */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              {session ? (
                <div className="space-y-2">
                  {(session.role === "owner" || session.role === "staff") && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="w-full py-3.5 px-4 bg-[#0066FF] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      <span>📊</span> <span>Salon Yönetim Paneli</span>
                    </Link>
                  )}
                  {session.role === "customer" && (
                    <Link
                      href="/my-appointments"
                      onClick={() => setMenuOpen(false)}
                      className="w-full py-3.5 px-4 bg-[#0066FF] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      <span>📋</span> <span>Randevularım</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-3 px-4 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <span>🚪</span> <span>Oturumu Kapat</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full py-3.5 px-4 bg-[#0066FF] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    <span>✨</span> <span>Ücretsiz Başla / Giriş Yap</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
