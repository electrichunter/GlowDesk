"use client";

import { useState, useMemo } from "react";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { useTenant } from "@/contexts/TenantContext";

interface CalendarViewProps {
  appointments: Appointment[];
  customWorkstations?: string[];
  onSelectSlot?: (date: string, time: string, workstation: string) => void;
  onUpdateStatus?: (id: string, status: AppointmentStatus) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 - 20:00

const SECTOR_DEFAULT_WORKSTATIONS: Record<string, string[]> = {
  legal: ["1. Danışmanlık Masası", "2. Görüşme Masası", "Toplantı Odası"],
  hukuk: ["1. Danışmanlık Masası", "2. Görüşme Masası", "Toplantı Odası"],
  clinic: ["1. Muayene Odası", "2. Muayene Odası", "Diş / Tedavi Üniti"],
  auto: ["1. Lift", "2. Lift", "Yıkama & Detailing Pedi"],
  fitness: ["Reformer Pilates 1", "Stüdyo A"],
  vet: ["Muayene Masası 1", "Pet Grooming Pedi"],
  coaching: ["Seans Odası 1", "Seans Odası 2"],
  photo: ["Plato A (Beyaz Fon)", "Plato B (Gün Işığı)"],
  spa: ["Masaj Odası 1", "VIP Spa Suiti"],
  coworking: ["Toplantı Odası A", "Toplantı Odası B"],
  restoran: ["Masa 1 (Salon)", "Masa 2 (Teras)"],
  salon: ["1. Koltuk", "2. Koltuk", "VİP Bakım Odası"],
};

const STATUS_COLORS: Record<AppointmentStatus, { bg: string; border: string; text: string; label: string }> = {
  confirmed: { bg: "bg-emerald-50 hover:bg-emerald-100", border: "border-emerald-400", text: "text-emerald-800", label: "Onaylandı" },
  pending: { bg: "bg-amber-50 hover:bg-amber-100", border: "border-amber-400", text: "text-amber-800", label: "Bekliyor" },
  scheduled: { bg: "bg-amber-50 hover:bg-amber-100", border: "border-amber-400", text: "text-amber-800", label: "Bekliyor / Yeni" },
  completed: { bg: "bg-cyan-50 hover:bg-cyan-100", border: "border-cyan-400", text: "text-cyan-800", label: "Tamamlandı" },
  no_show: { bg: "bg-rose-50 hover:bg-rose-100", border: "border-rose-400", text: "text-rose-800", label: "No-Show" },
  cancelled: { bg: "bg-slate-100 hover:bg-slate-200", border: "border-slate-300", text: "text-slate-600", label: "İptal" },
};

export default function CalendarView({ appointments, customWorkstations, onSelectSlot, onUpdateStatus }: CalendarViewProps) {
  const { vertical, tenant } = useTenant();
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedWorkstationFilter, setSelectedWorkstationFilter] = useState<string>("all");
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

  // Compute workstations dynamically
  const workstationsList = useMemo(() => {
    if (customWorkstations && customWorkstations.length > 0) return customWorkstations;
    if (tenant?.settings?.workstations && tenant.settings.workstations.length > 0) {
      return tenant.settings.workstations.filter((w) => w.is_active).map((w) => w.name);
    }
    return SECTOR_DEFAULT_WORKSTATIONS[vertical] || SECTOR_DEFAULT_WORKSTATIONS.salon;
  }, [customWorkstations, tenant, vertical]);

  // Filter workstations based on selected filter
  const visibleWorkstations = useMemo(() => {
    if (selectedWorkstationFilter === "all") return workstationsList;
    return workstationsList.filter((w) => w.includes(selectedWorkstationFilter));
  }, [selectedWorkstationFilter, workstationsList]);

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setCurrentDate(new Date().toISOString().split("T")[0]);
  };

  // Extract Appointments for Current Date
  const currentAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      let aptDate = currentDate;
      if (apt.start_time) {
        aptDate = apt.start_time.split("T")[0];
      } else if (apt.date) {
        aptDate = apt.date;
      }
      return aptDate === currentDate;
    });
  }, [appointments, currentDate]);

  // Helper to match appointment to workstation & hour
  const getAppointmentForSlot = (wsName: string, hour: number, wsIndex: number) => {
    return currentAppointments.filter((apt) => {
      // 1. Time parsing (ISO datetime, time string or fallback)
      let timeStr = apt.start_time || apt.time || "10:00:00";
      if (timeStr.includes("T")) {
        timeStr = timeStr.split("T")[1];
      }
      const aptHour = parseInt(timeStr.split(":")[0], 10);
      if (isNaN(aptHour) || aptHour !== hour) return false;

      // 2. Workstation matching (check notes, or default to first station)
      if (apt.notes) {
        const firstWord = wsName.split(" ")[0];
        if (apt.notes.includes(firstWord) || apt.notes.includes(wsName)) {
          return true;
        }
      }
      // If workstation is not specified or notes didn't match any workstation name, put on 1st station
      const matchesAnyOtherWs = visibleWorkstations.some((otherWs, idx) => {
        if (idx === wsIndex) return false;
        const otherWord = otherWs.split(" ")[0];
        return apt.notes && (apt.notes.includes(otherWord) || apt.notes.includes(otherWs));
      });

      return !matchesAnyOtherWs && wsIndex === 0;
    });
  };

  return (
    <div className="brand-card bg-white p-6 space-y-6 shadow-sm border border-slate-200 rounded-2xl font-sans">
      {/* Calendar Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-[#1E1B4B] hover:bg-slate-200 rounded-lg transition-all"
          >
            Bugün
          </button>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={handlePrevDay}
              className="p-1.5 text-slate-600 hover:bg-white hover:shadow-xs rounded-md transition-all text-xs font-bold"
            >
              ◀
            </button>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[#1E1B4B] px-2 focus:outline-none"
            />
            <button
              onClick={handleNextDay}
              className="p-1.5 text-slate-600 hover:bg-white hover:shadow-xs rounded-md transition-all text-xs font-bold"
            >
              ▶
            </button>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {new Date(currentDate).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedWorkstationFilter}
            onChange={(e) => setSelectedWorkstationFilter(e.target.value)}
            className="input-dark bg-white py-1.5 px-3 text-xs w-auto border-slate-200"
          >
            <option value="all">Tüm İstasyonlar / Odalar</option>
            {workstationsList.map((ws) => (
              <option key={ws} value={ws}>
                {ws}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === "day" ? "bg-[#1E1B4B] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Günlük Izgara
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === "week" ? "bg-[#1E1B4B] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Özet Tablo
            </button>
          </div>
        </div>
      </div>

      {/* Grid Header & Body */}
      {viewMode === "day" ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-20 p-3 text-center text-[11px] font-extrabold uppercase text-slate-400 border-r border-slate-200">
                  Saat
                </th>
                {visibleWorkstations.map((ws) => (
                  <th key={ws} className="p-3 text-left text-xs font-extrabold text-[#1E1B4B] border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span>{ws}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => {
                const hourFormatted = hour < 10 ? `0${hour}:00` : `${hour}:00`;
                return (
                  <tr key={hour} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 text-center text-xs font-bold text-slate-400 border-r border-slate-200 bg-slate-50/30">
                      {hourFormatted}
                    </td>
                    {visibleWorkstations.map((ws, wsIdx) => {
                      const matchedApts = getAppointmentForSlot(ws, hour, wsIdx);
                      return (
                        <td
                          key={ws}
                          onClick={() => {
                            if (matchedApts.length === 0 && onSelectSlot) {
                              onSelectSlot(currentDate, hourFormatted, ws);
                            }
                          }}
                          className="p-2 border-r border-slate-100 last:border-r-0 h-16 align-top cursor-pointer transition-all hover:bg-indigo-50/30 relative"
                        >
                          {matchedApts.length > 0 ? (
                            <div className="space-y-1">
                              {matchedApts.map((apt) => {
                                const style = STATUS_COLORS[apt.status] || STATUS_COLORS.confirmed;
                                return (
                                  <div
                                    key={apt.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveAppointment(apt);
                                    }}
                                    className={`p-2 rounded-lg border ${style.bg} ${style.border} ${style.text} shadow-2xs transition-all hover:scale-[1.02] cursor-pointer`}
                                  >
                                    <div className="flex justify-between items-start gap-1">
                                      <span className="font-extrabold text-xs tracking-tight truncate">
                                        {apt.customer?.full_name || "Müşteri"}
                                      </span>
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/70">
                                        {style.label}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] opacity-90 mt-1">
                                      <span>{apt.service?.name || "Hizmet"}</span>
                                      <span className="font-mono font-bold">₺{apt.service?.price || apt.price || 0}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-[11px] text-indigo-400 font-bold">
                              + Randevu Ekle
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Summary Table View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleWorkstations.map((ws) => {
            const wsAppointments = currentAppointments.filter((a) =>
              a.notes ? a.notes.includes(ws.split(" ")[0]) : ws.includes("1. Koltuk")
            );

            return (
              <div key={ws} className="brand-card bg-slate-50/50 p-4 border border-slate-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <h4 className="font-extrabold text-xs text-[#1E1B4B]">{ws}</h4>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    {wsAppointments.length} Seans
                  </span>
                </div>
                {wsAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {wsAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => setActiveAppointment(apt)}
                        className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-indigo-300 transition-all cursor-pointer space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-xs text-[#1E1B4B]">
                            {apt.customer?.full_name || "Müşteri"}
                          </span>
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                            {apt.start_time?.split("T")[1]?.slice(0, 5) || apt.time || "10:00"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{apt.service?.name || "Genel Hizmet"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">Bu koltukta bugün kayıt yok.</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Status Update Modal */}
      {activeAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Randevu Detayı</span>
                <h3 className="font-extrabold text-lg text-[#1E1B4B]">
                  {activeAppointment.customer?.full_name || "Müşteri"}
                </h3>
              </div>
              <button onClick={() => setActiveAppointment(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Hizmet:</span>
                <span className="font-extrabold text-[#1E1B4B]">{activeAppointment.service?.name || "Hizmet"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Saat:</span>
                <span className="font-mono font-bold text-indigo-700">
                  {activeAppointment.start_time?.split("T")[1]?.slice(0, 5) || activeAppointment.time || "10:00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Ücret:</span>
                <span className="font-mono font-extrabold text-emerald-700">
                  ₺{activeAppointment.service?.price || activeAppointment.price || 0}
                </span>
              </div>
              {activeAppointment.notes && (
                <div className="pt-1 border-t border-slate-200 text-slate-600 text-[11px]">
                  📝 {activeAppointment.notes}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-2">Durum Güncelle:</label>
              <div className="grid grid-cols-2 gap-2">
                {(["confirmed", "completed", "no_show", "cancelled"] as AppointmentStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      if (onUpdateStatus) onUpdateStatus(activeAppointment.id, st);
                      setActiveAppointment(null);
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      STATUS_COLORS[st].bg
                    } ${STATUS_COLORS[st].border} ${STATUS_COLORS[st].text}`}
                  >
                    {STATUS_COLORS[st].label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveAppointment(null)}
              className="w-full btn-secondary justify-center text-xs py-2.5 mt-2"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
