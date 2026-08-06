"use client";

import { useState, useEffect, useRef } from "react";

type StepIndex = 0 | 1 | 2 | 3;

interface StepInfo {
  title: string;
  badge: string;
  desc: string;
  icon: string;
}

const STEPS: StepInfo[] = [
  {
    title: "Giriş: Canlı Dashboard",
    badge: "0% — Başlangıç",
    desc: "GlowDesk 3D Paneli; no-show oranlarını, canlı dolulukları ve günlük takvimi anlık takip eder.",
    icon: "📊",
  },
  {
    title: "Adım 1: Randevu & WhatsApp Teyidi",
    badge: "30% — Teyit Motoru",
    desc: "Müşteriniz randevu aldığı an WhatsApp'tan tek tıkla onay mesajı gider ve takvime işlenir.",
    icon: "💬",
  },
  {
    title: "Adım 2: Fiziki Kaynak & Uzman Atama",
    badge: "60% — Akıllı Kaynak",
    desc: "Salon koltuğu, VIP spa odası, servis lifti veya duruşma salonu otomatik kilitlenir.",
    icon: "🛋️",
  },
  {
    title: "Adım 3: Ödeme & Kasa Başarısı",
    badge: "100% — Randevudan Kasaya",
    desc: "Gelmeyen müşteri kaybı 0! Tahsilat iZico POS / Nakit ile tamamlanır ve kasaya işlenir.",
    icon: "💰",
  },
];

const SECTOR_RESOURCES = [
  { key: "beauty", name: "VIP Terapi Suit B", icon: "💄", detail: "Cilt Bakım Odası • Kilitli 🔒" },
  { key: "barber", name: "Usta Koltuk #2", icon: "💈", detail: "Saç & Sakal Tıraş Koltuğu 🔒" },
  { key: "spa", name: "Masaj & Jakuzi Odası", icon: "🌿", detail: "90 Dk. Aromaterapi Odası 🔒" },
  { key: "clinic", name: "Dermatoloji Muayene #3", icon: "🩺", label: "Estetisyen Odası 🔒" },
  { key: "auto", name: "Servis Lift #4", icon: "🚗", detail: "Hidrolik Lift & Seramik Kulvarı 🔒" },
  { key: "fitness", name: "Reformer Pilates A-1", icon: "🏋️", detail: "Cadillac Reformer Aleti 🔒" },
];

export default function Interactive3DScrollFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStep, setActiveStep] = useState<StepIndex>(0);
  const [selectedSector, setSelectedSector] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate relative scroll inside container
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      setScrollProgress(progress);

      if (progress < 0.25) setActiveStep(0);
      else if (progress < 0.55) setActiveStep(1);
      else if (progress < 0.85) setActiveStep(2);
      else setActiveStep(3);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const resource = SECTOR_RESOURCES[selectedSector];

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[300vh] bg-slate-950 text-white border-y border-slate-800/80 overflow-clip"
    >
      {/* Dynamic Background Glow Grid */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,102,255,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER AREA */}
        <div className="relative z-20 pt-8 px-6 text-center max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-xs font-bold shadow-lg">
            <span>✨ 3D İnteraktif Deneyim</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
            Randevudan Kasaya <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">3D Akış</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Sayfayı aşağı kaydırdıkça kartların 3D uzayda dönerek randevudan tahsilata nasıl dönüştüğünü canlı izleyin.
          </p>

          {/* Sector Switcher Pill Tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {SECTOR_RESOURCES.map((s, idx) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedSector(idx)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSector === idx
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 3D VIEWPORT STAGE ────────────────────────────────────────── */}
        <div className="relative z-10 flex-1 flex items-center justify-center perspective-[1200px] py-6 px-4">
          
          <div className="relative w-full max-w-xl h-[360px] sm:h-[420px] transform-style-3d transition-transform duration-75 ease-out">
            
            {/* ── KART 0: CANLI DASHBOARD (0% - 25%) ── */}
            <div
              className="absolute inset-0 rounded-3xl bg-slate-900/90 border border-blue-500/30 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out flex flex-col justify-between"
              style={{
                transform: `
                  rotateX(${15 - scrollProgress * 40}deg)
                  rotateY(${scrollProgress * 25}deg)
                  translateZ(${activeStep === 0 ? 0 : -220}px)
                  translateY(${activeStep === 0 ? 0 : -40}px)
                `,
                opacity: activeStep === 0 ? 1 : 0.25,
                filter: activeStep === 0 ? "none" : "blur(2px)",
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">GlowDesk Canlı Panel</h3>
                    <p className="text-[11px] text-slate-400">Gerçek Zamanlı Doluluk Oranı</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 animate-pulse">
                  ● Canlı Senkronize
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Bugünkü Randevu</div>
                  <div className="text-lg font-black text-white mt-1">28 Seans</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">No-Show Engeli</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">%100</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Kurtarılan Gelir</div>
                  <div className="text-lg font-black text-cyan-400 mt-1">₺14.500</div>
                </div>
              </div>

              <div className="bg-blue-950/40 p-3 rounded-2xl border border-blue-800/40 flex items-center justify-between text-xs text-blue-300">
                <span>🔄 WhatsApp Teyit Motoru Beklemede</span>
                <span className="font-bold text-white">Aktif 🔥</span>
              </div>
            </div>

            {/* ── KART 1: RANDEVU & WHATSAPP TEYİT KARTI (25% - 55%) ── */}
            <div
              className="absolute inset-0 rounded-3xl bg-slate-900/95 border border-cyan-500/40 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out flex flex-col justify-between"
              style={{
                transform: `
                  rotateX(${activeStep === 1 ? 0 : 20}deg)
                  rotateY(${activeStep === 1 ? 0 : -35}deg)
                  translateZ(${activeStep === 1 ? 60 : activeStep > 1 ? -180 : -300}px)
                  translateX(${activeStep === 1 ? 0 : activeStep > 1 ? -120 : 120}px)
                `,
                opacity: activeStep === 1 ? 1 : activeStep > 1 ? 0.3 : 0,
                pointerEvents: activeStep === 1 ? "auto" : "none",
                filter: activeStep === 1 ? "none" : "blur(3px)",
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h3 className="font-bold text-sm text-white">Yeni Randevu Teyidi</h3>
                    <p className="text-[11px] text-cyan-400 font-semibold">WhatsApp Otomatik Mesajı</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/30">
                  Adım 1 / 3
                </span>
              </div>

              <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30 space-y-2 my-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400">Müşteri: Elif Yılmaz</span>
                  <span className="text-[10px] text-slate-400">Yarın 14:00</span>
                </div>
                <div className="text-xs text-slate-200 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 font-mono">
                  ✨ Selam Elif! Yarınki seansın için koltuğun ayrıldı. Geliyor musun? (EVET / HAYIR)
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 pt-1">
                  <span>✅ Müşteri Cevabı: "EVET Geliyorum"</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
                <span>Durum: Teyit Edildi</span>
                <span className="text-cyan-400 font-bold">Kaynak Atamasına Geçiliyor →</span>
              </div>
            </div>

            {/* ── KART 2: FİZİKİ KAYNAK & UZMAN ATAMA KARTI (55% - 85%) ── */}
            <div
              className="absolute inset-0 rounded-3xl bg-slate-900/95 border border-purple-500/40 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out flex flex-col justify-between"
              style={{
                transform: `
                  rotateX(${activeStep === 2 ? 0 : -25}deg)
                  rotateY(${activeStep === 2 ? 0 : 30}deg)
                  translateZ(${activeStep === 2 ? 100 : activeStep > 2 ? -150 : -350}px)
                  translateY(${activeStep === 2 ? 0 : 80}px)
                `,
                opacity: activeStep === 2 ? 1 : activeStep > 2 ? 0.3 : 0,
                pointerEvents: activeStep === 2 ? "auto" : "none",
                filter: activeStep === 2 ? "none" : "blur(3px)",
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{resource.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm text-white">Fiziki Kaynak Atandı</h3>
                    <p className="text-[11px] text-purple-400 font-semibold">{resource.name}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
                  Adım 2 / 3
                </span>
              </div>

              <div className="bg-slate-950/90 p-4 rounded-2xl border border-purple-500/30 space-y-3 my-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">Atanan Alan:</span>
                  <span className="text-xs font-bold text-purple-300 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
                    {resource.name}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="text-slate-400">Detay:</span> {resource.detail || resource.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                  <span>🔒 Çakışmasız Saat Kilitleme Başarılı</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
                <span>Kapasite Kilitlendi</span>
                <span className="text-purple-400 font-bold">Kasa & Tahsilata Geçiliyor →</span>
              </div>
            </div>

            {/* ── KART 3: ÖDEME & KASA BAŞARI KARTI (85% - 100%) ── */}
            <div
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-950/95 via-slate-900/95 to-slate-950/95 border-2 border-emerald-500/60 p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] backdrop-blur-xl transition-all duration-500 ease-out flex flex-col justify-between"
              style={{
                transform: `
                  rotateX(${activeStep === 3 ? 0 : 35}deg)
                  rotateY(${activeStep === 3 ? 0 : 45}deg)
                  translateZ(${activeStep === 3 ? 120 : -400}px)
                  scale(${activeStep === 3 ? 1.05 : 0.8})
                `,
                opacity: activeStep === 3 ? 1 : 0,
                pointerEvents: activeStep === 3 ? "auto" : "none",
              }}
            >
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">Kasaya İşlendi!</h3>
                    <p className="text-[11px] text-emerald-400 font-bold">Randevudan Tahsilata Tamamlandı</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/40">
                  Adım 3 / 3 🚀
                </span>
              </div>

              <div className="bg-slate-950/90 p-4 rounded-2xl border border-emerald-500/40 space-y-3 my-2 text-center">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Toplam Tahsil Edilen Tutar
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                  ₺1.450,00
                </div>
                <div className="flex justify-center gap-2 pt-1 text-xs">
                  <span className="px-3 py-1 rounded-full bg-blue-950 text-blue-300 font-bold border border-blue-800">
                    💳 iZico Online POS
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                    ✅ No-Show %0
                  </span>
                </div>
              </div>

              <div className="bg-emerald-900/40 p-3 rounded-2xl border border-emerald-600/40 flex items-center justify-between text-xs text-emerald-200">
                <span>🎉 Sıfır Müşteri Kaybı Başarısı</span>
                <span className="font-extrabold text-white">Kasa Güncellendi 💰</span>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER STEP CONTROLS (Sticky Bar) */}
        <div className="relative z-20 pb-8 px-6 max-w-3xl mx-auto w-full">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            {STEPS.map((s, idx) => (
              <button
                key={s.title}
                type="button"
                onClick={() => {
                  setActiveStep(idx as StepIndex);
                  // Optionally scroll to position
                  if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const targetScroll = window.scrollY + rect.top + (idx / 3) * (rect.height - window.innerHeight);
                    window.scrollTo({ top: targetScroll, behavior: "smooth" });
                  }
                }}
                className={`flex-1 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  activeStep === idx
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-bold"
                    : "bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  <span>{s.icon}</span>
                  <span className="truncate">{s.title.split(":")[0]}</span>
                </div>
                <div className="text-[10px] opacity-80 truncate hidden sm:block mt-0.5">
                  {s.badge}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
