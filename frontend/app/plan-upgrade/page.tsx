"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SUBSCRIPTION_PLANS } from "@/lib/plans";

export default function PlanUpgradePage() {

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-xs font-extrabold uppercase tracking-wider">
            ⚡ GlowDesk Abonelik &amp; Plan Yükseltme
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-display">
            İşletmenizin İhtiyacına Uygun Paketi Seçin
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-medium">
            Komisyonsuz, taahhütsüz sabit fiyatlı paketler. Dilediğiniz an paketinizi yükseltin veya düşürün.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
            const isEnterprise = key === "enterprise";
            const isPro = key === "pro";

            return (
              <div
                key={key}
                className={`bg-white rounded-3xl p-8 border flex flex-col justify-between space-y-6 shadow-layered transition-all relative ${
                  isPro
                    ? "border-2 border-[#0066FF] ring-4 ring-blue-500/10 transform md:-translate-y-2"
                    : isEnterprise
                    ? "border-purple-300 bg-gradient-to-b from-purple-50/50 to-white"
                    : "border-slate-200"
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0066FF] text-white text-[11px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    En Popüler Seçim
                  </div>
                )}
                {isEnterprise && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[11px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    👑 Kurumsal VIP
                  </div>
                )}

                <div className="space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                    {plan.badgeLabel}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 font-display">{plan.name}</h2>
                  <div className="text-4xl font-black text-slate-900 font-mono">
                    ₺{plan.monthlyPrice}{" "}
                    <span className="text-xs font-normal text-slate-500 font-sans">/ ay</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{plan.description}</p>

                  <ul className="space-y-3 text-xs text-slate-700 border-t border-slate-100 pt-4 font-medium">
                    {plan.featureList.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-emerald-600 font-extrabold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/settings";
                    }}
                    className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-xs transition-all shadow-md cursor-pointer ${
                      isPro
                        ? "btn-primary-blue"
                        : isEnterprise
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    ⚡ {plan.name} Pakete Geç →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link href="/settings" className="text-xs font-extrabold text-[#0066FF] hover:underline">
            ← İşletme Ayarlarına Dön
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
