"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCurrentSession, type SessionPayload } from "@/lib/session";
import type { Appointment } from "@/lib/types";

export default function CustomerDashboardPage() {
  const [session] = useState<SessionPayload | null>(() => getCurrentSession());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED">("ALL");
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("glowdesk_appointments");
      if (saved) {
        const parsed: Appointment[] = JSON.parse(saved);
        setAppointments(parsed);
      } else {
        setAppointments([]);
      }
    } catch {
      setAppointments([]);
    }
  }, []);

  const handleCancelAppointment = (id: string) => {
    const updated = appointments.map((apt) =>
      apt.id === id ? { ...apt, status: "cancelled" as const } : apt
    );
    setAppointments(updated);
    localStorage.setItem("glowdesk_appointments", JSON.stringify(updated));
    setCancelModalApt(null);
  };

  const filtered = appointments.filter((apt) => {
    if (filter === "UPCOMING") return apt.status === "confirmed" || apt.status === "pending";
    if (filter === "COMPLETED") return apt.status === "completed";
    if (filter === "CANCELLED") return apt.status === "cancelled";
    return true;
  });

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-black rounded-full uppercase">● Onaylandı</span>;
      case "pending":
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black rounded-full uppercase">⏳ Beklemede</span>;
      case "completed":
        return <span className="px-2.5 py-1 bg-cyan-100 text-cyan-900 border border-cyan-200 text-[10px] font-black rounded-full uppercase">✅ Tamamlandı</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-900 border border-rose-200 text-[10px] font-black rounded-full uppercase">❌ İptal Edildi</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-black rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 mt-20 space-y-6">
        
        {/* Üst Başlık & Eylem */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
                👤 Müşteri Portalı
              </span>
              <span className="bg-indigo-100 text-indigo-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
                Online Randevularım
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E1B4B] font-display mt-0.5">
              Hoş Geldin, {session?.fullName || "Değerli Müşterimiz"}!
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Aldığınız tüm salon seanslarını, seans tarihlerini ve durumlarını buradan takip edin.
            </p>
          </div>

          <Link
            href="/explore"
            className="btn-cyan text-xs py-2.5 px-4 font-extrabold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>🔍</span> Yeni Randevu Al (Salonları Keşfet)
          </Link>
        </div>

        {/* İstatistik Özet Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="brand-card p-4 bg-white border border-slate-200">
            <span className="text-slate-400 font-bold text-[10px] uppercase block">Toplam Randevu</span>
            <span className="text-xl font-black text-[#1E1B4B] mt-1 block">{appointments.length}</span>
          </div>
          <div className="brand-card p-4 bg-emerald-50/50 border border-emerald-100">
            <span className="text-emerald-800 font-bold text-[10px] uppercase block">Yaklaşan Seanslar</span>
            <span className="text-xl font-black text-emerald-900 mt-1 block">
              {appointments.filter((a) => a.status === "confirmed" || a.status === "pending").length}
            </span>
          </div>
          <div className="brand-card p-4 bg-cyan-50/50 border border-cyan-100">
            <span className="text-cyan-800 font-bold text-[10px] uppercase block">Tamamlanan Seanslar</span>
            <span className="text-xl font-black text-cyan-900 mt-1 block">
              {appointments.filter((a) => a.status === "completed").length}
            </span>
          </div>
          <div className="brand-card p-4 bg-rose-50/50 border border-rose-100">
            <span className="text-rose-800 font-bold text-[10px] uppercase block">İptal Edilenler</span>
            <span className="text-xl font-black text-rose-900 mt-1 block">
              {appointments.filter((a) => a.status === "cancelled").length}
            </span>
          </div>
        </div>

        {/* Filtreleme Butonları */}
        <div className="flex gap-2 border-b border-slate-200 pb-3">
          {(["ALL", "UPCOMING", "COMPLETED", "CANCELLED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                filter === f
                  ? "bg-[#1E1B4B] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {f === "ALL" && "Tümü"}
              {f === "UPCOMING" && "Yaklaşan Seanslar"}
              {f === "COMPLETED" && "Tamamlananlar"}
              {f === "CANCELLED" && "İptal Edilenler"}
            </button>
          ))}
        </div>

        {/* Randevu Listesi */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((apt) => (
              <div
                key={apt.id}
                className="brand-card p-5 bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-[#1E1B4B]">{apt.service_name || "Salon Seansı"}</span>
                    {getStatusBadge(apt.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1 font-bold text-indigo-900">
                      🏢 Zelza Beauty Studio
                    </span>
                    <span>📅 {apt.date || apt.start_time?.split("T")[0] || "2026-07-27"}</span>
                    <span className="font-extrabold text-emerald-700">₺{apt.price || 450}</span>
                  </div>

                  {apt.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      &quot;{apt.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {(apt.status === "confirmed" || apt.status === "pending") && (
                    <button
                      onClick={() => setCancelModalApt(apt)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 hover:bg-rose-100 transition-all"
                    >
                      Randevuyu İptal Et ❌
                    </button>
                  )}
                  <Link
                    href="/explore"
                    className="px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-900 font-bold text-xs border border-cyan-200 hover:bg-cyan-100 transition-all"
                  >
                    Tekrar Randevu Al 🔄
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="brand-card p-12 text-center text-slate-500 space-y-3 bg-white border border-slate-200">
              <span className="text-4xl block">📅</span>
              <h4 className="font-extrabold text-[#1E1B4B] text-base">Henüz Randevunuz Bulunmuyor</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Aradığınız kategorideki güzellik salonlarını, berberleri ve klinik seanslarını inceleyip 10 saniyede randevu oluşturabilirsiniz.
              </p>
              <Link
                href="/explore"
                className="btn-cyan text-xs py-2.5 px-5 font-extrabold inline-block shadow-sm mt-2"
              >
                Salonları Keşfet & Randevu Al 🚀
              </Link>
            </div>
          )}
        </div>

        {/* Modal: İptal Onayı */}
        {cancelModalApt && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="text-center space-y-2">
                <span className="text-3xl block">⚠️</span>
                <h3 className="text-base font-extrabold text-[#1E1B4B]">Randevuyu İptal Etmek İstiyor musunuz?</h3>
                <p className="text-xs text-slate-500">
                  <strong>{cancelModalApt.service_name || "Seans"}</strong> randevunuz iptal edilecek ve salon sahibine bilgi verilecektir.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setCancelModalApt(null)}
                  className="w-1/2 btn-secondary justify-center text-xs py-2.5"
                >
                  Vazgeç
                </button>
                <button
                  onClick={() => handleCancelAppointment(cancelModalApt.id)}
                  className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Evet, İptal Et
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
