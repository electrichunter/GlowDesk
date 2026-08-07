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
      className="relative w-full min-h-[220vh] bg-[#F8FAFC] text-slate-900 border-y border-slate-200/80 overflow-clip font-sans"
    >
      {/* Dynamic Background Glow Grid */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden py-4 sm:py-6">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,102,255,0.06),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER AREA */}
        <div className="relative z-20 px-4 text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0066FF] text-xs font-extrabold shadow-2xs">
            <span>✨ 3D İnteraktif Akış</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] animate-ping" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Randevudan Kasaya <span className="bg-gradient-to-r from-[#0066FF] via-blue-600 to-indigo-600 bg-clip-text text-transparent">3D Otomasyon Akışı</span>
          </h2>
          <p className="text-slate-600 text-xs max-w-lg mx-auto font-medium">
            Sayfayı aşağı kaydırdıkça randevunun 3D uzayda dönerek kaynak ataması ve kasa tahsilatına dönüşmesini izleyin.
          </p>

          {/* Sector Switcher Pill Tabs */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {SECTOR_RESOURCES.map((s, idx) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedSector(idx)}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSector === idx
                    ? "bg-[#0066FF] text-white shadow-md shadow-blue-500/20 scale-105"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 3D VIEWPORT STAGE ────────────────────────────────────────── */}
        <div className="relative z-10 flex-1 flex items-center justify-center perspective-[1000px] my-auto px-4">
          
          <div className="relative w-full max-w-lg h-[320px] sm:h-[360px] transform-style-3d transition-transform duration-75 ease-out scale-90 sm:scale-100">
            
            {/* ── KART 0: CANLI DASHBOARD (0% - 25%) ── */}
            <div
              className="absolute inset-0 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-layered backdrop-blur-xl transition-all duration-500 ease-out flex flex-col justify-between"
              style={{
                transform: `
                  rotateX(${15 - scrollProgress * 40}deg)
                  rotateY(${scrollProgress * 25}deg)
                  translateZ(${activeStep === 0 ? 0 : -220}px)
                  translateY(${activeStep === 0 ? 0 : -40}px)
                `,
                opacity: activeStep === 0 ? 1 : 0.35,
                filter: activeStep === 0 ? "none" : "blur(2px)",
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0066FF] text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 font-display">GlowDesk Canlı Panel</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Gerçek Zamanlı Doluluk Oranı</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Canlı Senkronize</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Bugünkü Randevu</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1 font-display">28 Seans</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">No-Show Engeli</div>
                  <div className="text-lg font-extrabold text-emerald-600 mt-1 font-display">%100</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Kurtarılan Gelir</div>
                  <div className="text-lg font-extrabold text-[#0066FF] mt-1 font-display">₺14.500</div>
                </div>
              </div>

              <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 flex items-center justify-between text-xs text-[#0066FF] font-bold">
                <span>🔄 WhatsApp Teyit Motoru Beklemede</span>
                <span className="bg-[#0066FF] text-white px-2.5 py-0.5 rounded-full text-[10px]">Aktif 🔥</span>
              </div>
            </div>

            {/* ── KART 1: RANDEVU & WHATSAPP TEYİT KARTI (25% - 55%) ── */}
            <div
              className="absolute inset-0 rounded-3xl bg-white border border-blue-200/90 p-6 shadow-layered backdrop-blur-xl transition-all duration-500 ease-out flex flex-col justify-between"
              style={{
                transform: `
                  rotateX(${activeStep === 1 ? 0 : 20}deg)
                  rotateY(${activeStep === 1 ? 0 : -35}deg)
                  translateZ(${activeStep === 1 ? 60 : activeStep > 1 ? -180 : -300}px)
                  translateX(${activeStep === 1 ? 0 : activeStep > 1 ? -120 : 120}px)
                `,
                opacity: activeStep === 1 ? 1 : activeStep > 1 ? 0.35 : 0,
                pointerEvents: activeStep === 1 ? "auto" : "none",
                filter: activeStep === 1 ? "none" : "blur(3px)",
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 font-display">Yeni Randevu Teyidi</h3>
                    <p className="text-[11px] text-[#0066FF] font-bold">WhatsApp Otomatik Mesajı</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0066FF] text-[11px] font-extrabold border border-blue-200">
                  Adım 1 / 3
                </span>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2 my-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-900">Müşteri: Elif Yılmaz</span>
                  <span className="text-[10px] text-slate-500 font-bold">Yarın 14:00</span>
                </div>
                <div className="text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-emerald-200 font-mono shadow-2xs">
                  ✨ Selam Elif! Yarınki seansın için koltuğun ayrıldı. Geliyor musun? (EVET / HAYIR)
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 pt-1">
                  <span>✅ Müşteri Cevabı: "EVET Geliyorum"</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
                <span>Durum: Teyit Edildi</span>
                <span className="text-[#0066FF] font-extrabold">Kaynak Atamasına Geçiliyor →</span>
              </div>
            </div>

            {/* ── KART 2: FİZİKİ KAYNAK & UZMAN ATAMA KARTI (55% - 85%) ── */}
            <div
              className="absolute inset-0 rounded-3xl bg-white border border-purple-200/90 p-6 shadow-layered backdrop-blur-xl transition-all duration-500 ease-out flex flex-col justify-between"
              style={{
                transform: `
                  rotateX(${activeStep === 2 ? 0 : -25}deg)
                  rotateY(${activeStep === 2 ? 0 : 30}deg)
                  translateZ(${activeStep === 2 ? 100 : activeStep > 2 ? -150 : -350}px)
                  translateY(${activeStep === 2 ? 0 : 80}px)
                `,
                opacity: activeStep === 2 ? 1 : activeStep > 2 ? 0.35 : 0,
                pointerEvents: activeStep === 2 ? "auto" : "none",
                filter: activeStep === 2 ? "none" : "blur(3px)",
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{resource.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 font-display">Fiziki Kaynak Atandı</h3>
                    <p className="text-[11px] text-purple-700 font-bold">{resource.name}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[11px] font-extrabold border border-purple-200">
                  Adım 2 / 3
                </span>
              </div>

              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 space-y-3 my-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">Atanan Alan:</span>
                  <span className="text-xs font-bold text-purple-900 bg-white px-3 py-1 rounded-full border border-purple-200">
                    {resource.name}
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  <span className="text-slate-500 font-bold">Detay:</span> {resource.detail || resource.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-800 font-extrabold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <span>🔒 Çakışmasız Saat Kilitleme Başarılı</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
                <span>Kapasite Kilitlendi</span>
                <span className="text-purple-700 font-extrabold">Kasa & Tahsilata Geçiliyor →</span>
              </div>
            </div>

            {/* ── KART 3: ÖDEME & KASA BAŞARI KARTI (85% - 100%) ── */}
            <div
              className="absolute inset-0 rounded-3xl bg-white border-2 border-emerald-500/80 p-6 shadow-layered backdrop-blur-xl transition-all duration-500 ease-out flex flex-col justify-between"
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
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 font-display">Kasaya İşlendi!</h3>
                    <p className="text-[11px] text-emerald-700 font-extrabold">Randevudan Tahsilata Tamamlandı</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                  Adım 3 / 3 🚀
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 my-2 text-center">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Toplam Tahsil Edilen Tutar
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight font-mono">
                  ₺1.450,00
                </div>
                <div className="flex justify-center gap-2 pt-1 text-xs">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] font-bold border border-blue-200">
                    💳 iZico Online POS
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    ✅ No-Show %0
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-bold">
                <span>🎉 Sıfır Müşteri Kaybı Başarısı</span>
                <span className="font-black text-emerald-700">Kasa Güncellendi 💰</span>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER STEP CONTROLS (Sticky Bar) */}
        <div className="relative z-20 pb-8 px-6 max-w-3xl mx-auto w-full">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-4 rounded-2xl shadow-layered flex items-center justify-between gap-4">
            {STEPS.map((s, idx) => (
              <button
                key={s.title}
                type="button"
                onClick={() => {
                  setActiveStep(idx as StepIndex);
                  // Scroll to relative position
                  if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const targetScroll = window.scrollY + rect.top + (idx / 3) * (rect.height - window.innerHeight);
                    window.scrollTo({ top: targetScroll, behavior: "smooth" });
                  }
                }}
                className={`flex-1 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  activeStep === idx
                    ? "bg-[#0066FF] text-white shadow-lg shadow-blue-500/20 font-bold"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  <span>{s.icon}</span>
                  <span className="truncate">{s.title.split(":")[0]}</span>
                </div>
                <div className="text-[10px] opacity-90 truncate hidden sm:block mt-0.5 font-medium">
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
