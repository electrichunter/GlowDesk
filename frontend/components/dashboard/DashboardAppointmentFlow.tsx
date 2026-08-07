"use client";

import { useState, useMemo } from "react";
import AppointmentCard from "@/components/dashboard/AppointmentCard";
import type { Appointment, AppointmentStatus } from "@/lib/types";

interface DashboardAppointmentFlowProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onOpenPosModal: (apt: Appointment) => void;
  businessName: string;
  verticalConfig?: any;
}

export default function DashboardAppointmentFlow({
  appointments,
  onUpdateStatus,
  onOpenPosModal,
  businessName,
  verticalConfig,
}: DashboardAppointmentFlowProps) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dateScope, setDateScope] = useState<"selected" | "upcoming" | "past" | "all">("selected");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "no_show" | "cancelled">("all");
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10; // Virtualized pagination for large dataset performance

  // Navigasyon Gün Değiştirme
  const handleOffsetDay = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split("T")[0]);
    setDateScope("selected");
    setCurrentPage(1);
  };

  const handleSetToday = () => {
    setSelectedDate(todayStr);
    setDateScope("selected");
    setCurrentPage(1);
  };

  // İstatistik Sayıları
  const counts = useMemo(() => {
    let selectedDayCount = 0;
    let upcomingCount = 0;
    let pastCount = 0;
    let pendingCount = 0;
    let confirmedCount = 0;
    let completedCount = 0;

    appointments.forEach((a) => {
      const d = a.start_time ? a.start_time.split("T")[0] : todayStr;
      if (d === selectedDate) selectedDayCount++;
      if (d >= todayStr) upcomingCount++;
      if (d < todayStr) pastCount++;
      if (a.status === "pending" || a.status === "scheduled") pendingCount++;
      if (a.status === "confirmed") confirmedCount++;
      if (a.status === "completed") completedCount++;
    });

    return {
      selected: selectedDayCount,
      upcoming: upcomingCount,
      past: pastCount,
      pending: pendingCount,
      confirmed: confirmedCount,
      completed: completedCount,
      total: appointments.length,
    };
  }, [appointments, selectedDate, todayStr]);

  // Filtrelenmiş Randevu Listesi
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const aptDate = a.start_time ? a.start_time.split("T")[0] : todayStr;

      // 1. Tarih Kapsamı Filtresi
      let matchesScope = true;
      if (dateScope === "selected") {
        matchesScope = aptDate === selectedDate;
      } else if (dateScope === "upcoming") {
        matchesScope = aptDate >= todayStr;
      } else if (dateScope === "past") {
        matchesScope = aptDate < todayStr;
      }

      // 2. Durum Filtresi (scheduled & pending Bekliyor olarak eşleşir)
      let matchesStatus = true;
      if (statusFilter === "pending") {
        matchesStatus = a.status === "pending" || a.status === "scheduled";
      } else if (statusFilter !== "all") {
        matchesStatus = a.status === statusFilter;
      }

      // 3. İsim & Telefon Araması
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cName = a.customer?.full_name?.toLowerCase() || "";
        const cPhone = a.customer?.phone || "";
        const sName = a.service?.name?.toLowerCase() || "";
        matchesSearch = cName.includes(q) || cPhone.includes(q) || sName.includes(q);
      }

      return matchesScope && matchesStatus && matchesSearch;
    });
  }, [appointments, selectedDate, dateScope, statusFilter, searchQuery, todayStr]);

  // Sayfalama (DOM kasmaması için 10'ar adet gösterim)
  const paginatedAppointments = useMemo(() => {
    if (viewMode === "timeline") return filteredAppointments;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(startIndex, startIndex + pageSize);
  }, [filteredAppointments, currentPage, pageSize, viewMode]);

  const totalPages = Math.ceil(filteredAppointments.length / pageSize) || 1;

  // Saat Dilimlerine Göre Gruplandırma (Timeline Görünümü)
  const timeSlotsGrid = useMemo(() => {
    const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    return hours.map((hour) => {
      const hourNum = parseInt(hour.split(":")[0]);
      const slotsApts = filteredAppointments.filter((a) => {
        const timePart = a.start_time?.includes("T") ? a.start_time.split("T")[1] : a.start_time;
        const aptHour = timePart ? parseInt(timePart.split(":")[0]) : 10;
        return aptHour === hourNum;
      });
      return { hour, appointments: slotsApts };
    });
  }, [filteredAppointments]);

  return (
    <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-layered">
      
      {/* ── ÜST BAŞLIK VE GÖRÜNÜM MODU ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 font-display uppercase tracking-wider">
              BUGÜNKÜ &amp; GENEL RANDEVU AKIŞI
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-[10px] font-black">
              {filteredAppointments.length} Randevu
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Tarih seçici ile dilediğiniz günün, geçmişin veya geleceğin randevularını filtreleyin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Görünüm Seçeneği: Liste vs Takvim Timeline */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setViewMode("list");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-[#0066FF] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📋 Liste Akışı
            </button>
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === "timeline"
                  ? "bg-[#0066FF] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📊 Saatlik Takvim
            </button>
          </div>
        </div>
      </div>

      {/* ── TARİH VE KAPSAM FİLTRE BAR BAR ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
        
        {/* Sol: Tarih Gezgini & Date Picker */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOffsetDay(-1)}
            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-extrabold text-sm flex items-center justify-center transition-colors shadow-2xs"
            title="Önceki Gün"
          >
            ←
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setDateScope("selected");
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <button
            type="button"
            onClick={() => handleOffsetDay(1)}
            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-extrabold text-sm flex items-center justify-center transition-colors shadow-2xs"
            title="Sonraki Gün"
          >
            →
          </button>

          {selectedDate !== todayStr && (
            <button
              type="button"
              onClick={handleSetToday}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0066FF] border border-blue-200 text-xs font-extrabold transition-colors shadow-2xs"
            >
              ⚡ Bugüne Dön
            </button>
          )}
        </div>

        {/* Orta: Zaman Kapsamı Sekmeleri */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => {
              setDateScope("selected");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              dateScope === "selected"
                ? "bg-[#1E1B4B] text-white border-[#1E1B4B] shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            📅 Seçili Gün ({counts.selected})
          </button>

          <button
            type="button"
            onClick={() => {
              setDateScope("upcoming");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              dateScope === "upcoming"
                ? "bg-[#0066FF] text-white border-[#0066FF] shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            🔮 Gelecek Randevular ({counts.upcoming})
          </button>

          <button
            type="button"
            onClick={() => {
              setDateScope("past");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              dateScope === "past"
                ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            📜 Geçmiş Randevular ({counts.past})
          </button>

          <button
            type="button"
            onClick={() => {
              setDateScope("all");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              dateScope === "all"
                ? "bg-indigo-900 text-white border-indigo-900 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            📋 Tümü ({counts.total})
          </button>
        </div>

        {/* Sağ: İsim / Telefon Arama Girişi */}
        <div className="w-full md:w-48">
          <input
            type="text"
            placeholder="🔎 Müşteri / Tel Ara..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* ── DURUM FİLTRELEME BUTONLARI (Bekliyor / Onaylandı / Tamamlandı / No-Show) ── */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Durum:</span>
        {[
          { key: "all", label: `Tümü (${appointments.length})` },
          { key: "pending", label: `⏳ Bekliyor / Yeni (${counts.pending})` },
          { key: "confirmed", label: `● Onaylandı (${counts.confirmed})` },
          { key: "completed", label: `✅ Tamamlandı (${counts.completed})` },
          { key: "no_show", label: `⚠️ No-Show` },
          { key: "cancelled", label: `❌ İptal` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setStatusFilter(tab.key as any);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all border ${
              statusFilter === tab.key
                ? "bg-[#1E1B4B] text-white border-[#1E1B4B] shadow-xs"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── RANDEVULAR GÖSTERİMİ (LISTE vs SAATLİK TAKVİM) ── */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {paginatedAppointments.length > 0 ? (
            paginatedAppointments.map((apt) => (
              <div key={apt.id} className="relative group">
                <AppointmentCard
                  appointment={apt}
                  onUpdateStatus={onUpdateStatus}
                />
                {apt.status === "confirmed" && (
                  <button
                    type="button"
                    onClick={() => onOpenPosModal(apt)}
                    className="absolute top-4 right-28 bg-[#0066FF] hover:bg-blue-700 text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    💳 Adisyon Kes
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-10 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-4xl">📅</div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                Seçilen Kriterlere Uygun Randevu Bulunamadı
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Tarih filtresini değiştirebilir veya sağ üstteki "+ Yeni Randevu Ekle" butonuyla kaydetebilirsiniz.
              </p>
            </div>
          )}

          {/* Sayfalama Kontrolleri (DOM Kasmaması İçin 10'lu Akış) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
              <span className="text-slate-500">
                Sayfa <strong className="text-slate-900">{currentPage}</strong> / {totalPages} (Toplam {filteredAppointments.length} Randevu)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-extrabold text-slate-700"
                >
                  ← Önceki Sayfa
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-extrabold text-slate-700"
                >
                  Sonraki Sayfa →
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SAATLİK TAKVİM DİLİMİ (TIMELINE) */
        <div className="space-y-3 pt-2">
          {timeSlotsGrid.map(({ hour, appointments: hourApts }) => (
            <div key={hour} className="flex gap-3 items-start border-b border-slate-100 pb-3">
              <div className="w-16 pt-1 text-xs font-mono font-extrabold text-[#0066FF] shrink-0">
                {hour}
              </div>
              <div className="flex-1 space-y-2">
                {hourApts.length > 0 ? (
                  hourApts.map((apt) => (
                    <div key={apt.id} className="relative group">
                      <AppointmentCard
                        appointment={apt}
                        onUpdateStatus={onUpdateStatus}
                      />
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-[11px] text-slate-400 font-medium italic border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    Boş Saat Seansı — Müsait
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
