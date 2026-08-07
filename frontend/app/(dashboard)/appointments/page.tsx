"use client";

import { useState, useEffect, useMemo } from "react";
import AppointmentCard from "@/components/dashboard/AppointmentCard";
import CalendarView from "@/components/dashboard/CalendarView";
import type { Appointment, AppointmentStatus, Customer, Service } from "@/lib/types";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTenant } from "@/contexts/TenantContext";

export default function AppointmentsPage() {
  const { vertical, verticalConfig, tenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewType, setViewType] = useState<"list" | "calendar">("calendar");
  const [timeScope, setTimeScope] = useState<"upcoming" | "past" | "all">("upcoming");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [staffFilter, setStaffFilter] = useState<string>("all");

  const activeWorkstations = useMemo(() => {
    if (tenant?.settings?.workstations && tenant.settings.workstations.length > 0) {
      return tenant.settings.workstations.filter((w) => w.is_active).map((w) => w.name);
    }
    const defaults: Record<string, string[]> = {
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
    return defaults[vertical] || defaults.salon;
  }, [tenant, vertical]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const { apiRequest } = await import("@/lib/api-client");
        
        // 1. MySQL Appointments
        const aptUrl = tenant?.id ? `/appointments?tenant_id=${tenant.id}` : "/appointments";
        const { data: dbApts } = await apiRequest<any[]>(aptUrl);
        if (dbApts && Array.isArray(dbApts)) {
          setAppointments(
            dbApts.map((a) => {
              const dateStr = a.appointment_date || new Date().toISOString().split("T")[0];
              const sTime = a.start_time ? (a.start_time.includes("T") ? a.start_time : `${dateStr}T${a.start_time}`) : `${dateStr}T10:00:00Z`;
              const eTime = a.end_time ? (a.end_time.includes("T") ? a.end_time : `${dateStr}T${a.end_time}`) : `${dateStr}T11:00:00Z`;

              return {
                id: a.id,
                tenant_id: a.tenant_id,
                customer_id: a.customer_id,
                service_id: a.service_id,
                start_time: sTime,
                end_time: eTime,
                status: (a.status || "scheduled") as AppointmentStatus,
                notes: a.notes || undefined,
                created_at: a.created_at || new Date().toISOString(),
                customer: {
                  id: a.customer_id || "cust-1",
                  tenant_id: a.tenant_id || "global",
                  full_name: a.customer_name,
                  phone: a.customer_phone,
                  created_at: a.created_at || new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                service: {
                  id: a.service_id || "svc-1",
                  tenant_id: a.tenant_id || "global",
                  name: a.service_name || "Genel Hizmet",
                  duration_minutes: 30,
                  price: parseFloat(a.total_price || 0),
                  created_at: new Date().toISOString(),
                },
              };
            })
          );
        }

        // 2. MySQL Customers
        const { data: dbCusts } = await apiRequest<any[]>("/customers");
        if (dbCusts && Array.isArray(dbCusts)) {
          setCustomers(
            dbCusts.map((c) => ({
              id: c.id,
              tenant_id: c.tenant_id || "global",
              full_name: c.full_name,
              phone: c.phone || undefined,
              email: c.email || undefined,
              created_at: c.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))
          );
        }

        // 3. MySQL Services
        const { data: dbSvcs } = await apiRequest<any[]>("/services");
        if (dbSvcs && Array.isArray(dbSvcs)) {
          setServices(
            dbSvcs.map((s) => ({
              id: s.id,
              tenant_id: s.tenant_id || "global",
              name: s.name,
              price: parseFloat(s.price || 0),
              duration_minutes: s.duration_minutes || 30,
              created_at: s.created_at || new Date().toISOString(),
            }))
          );
        }
      } catch (err) {
        console.error("Appointments fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedWorkstation, setSelectedWorkstation] = useState("1. Koltuk (Ahmet Usta)");
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [notes, setNotes] = useState("");

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    const service = services.find(s => s.id === selectedServiceId);

    try {
      const { apiRequest } = await import("@/lib/api-client");
      const { data: newApt, error } = await apiRequest<any>("/appointments/", {
        method: "POST",
        body: JSON.stringify({
          tenant_id: "tenant-demo-1",
          customer_name: customer?.full_name || "Müşteri",
          customer_phone: customer?.phone || "+90 555 000 0000",
          appointment_date: appointmentDate,
          start_time: `${appointmentTime}:00`,
          end_time: "11:00:00",
          notes: `${notes} (${selectedWorkstation})`,
          total_price: service?.price || 0.0,
        }),
      });

      if (error) {
        alert(`❌ Hata: ${error}`);
        return;
      }

      if (newApt) {
        const formatted: Appointment = {
          id: newApt.id,
          tenant_id: newApt.tenant_id,
          customer_id: selectedCustomerId,
          service_id: selectedServiceId,
          start_time: `${appointmentDate}T${appointmentTime}:00Z`,
          end_time: `${appointmentDate}T11:00:00Z`,
          status: "confirmed",
          notes: `${notes} (${selectedWorkstation})`,
          created_at: new Date().toISOString(),
          customer,
          service,
        };

        setAppointments((prev) => [formatted, ...prev]);
        setShowAddModal(false);
        setNotes("");
      }
    } catch (err) {
      console.error("Appointment save error:", err);
    }
  };

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const upcomingCount = useMemo(() => {
    return appointments.filter((a) => {
      const d = a.start_time ? a.start_time.split("T")[0] : todayStr;
      return d >= todayStr;
    }).length;
  }, [appointments, todayStr]);

  const pastCount = useMemo(() => {
    return appointments.filter((a) => {
      const d = a.start_time ? a.start_time.split("T")[0] : todayStr;
      return d < todayStr;
    }).length;
  }, [appointments, todayStr]);

  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesStaff = staffFilter === "all" || a.notes?.includes(staffFilter);
    const aptDate = a.start_time ? a.start_time.split("T")[0] : todayStr;

    const matchesTimeScope =
      timeScope === "all" ? true :
      timeScope === "upcoming" ? aptDate >= todayStr :
      aptDate < todayStr;

    return matchesStatus && matchesStaff && matchesTimeScope;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-[#1E1B4B]">Personel &amp; Koltuk Yönetim Paneli</h1>
          <p className="text-slate-500 text-xs mt-1">Geçmiş ve gelecek randevularınızı tarih, personel ve durum bazında takip edin.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setViewType("calendar")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                viewType === "calendar" ? "bg-[#1E1B4B] text-white shadow-xs" : "text-slate-600 hover:text-[#1E1B4B]"
              }`}
            >
              📅 Görsel Takvim
            </button>
            <button
              onClick={() => setViewType("list")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                viewType === "list" ? "bg-[#1E1B4B] text-white shadow-xs" : "text-slate-600 hover:text-[#1E1B4B]"
              }`}
            >
              📋 Liste Akışı
            </button>
          </div>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="btn-primary text-xs py-2.5 px-4 shadow-sm"
          >
            ➕ Yeni Randevu Ekle
          </button>
        </div>
      </div>

      {/* Personel / İstasyon Bazlı Doluluk & Performans Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeWorkstations.map((ws, idx) => {
          const borderColors = ["border-l-cyan-500", "border-l-purple-500", "border-l-amber-500", "border-l-emerald-500"];
          const colorClass = borderColors[idx % borderColors.length];
          const count = appointments.filter((a) => a.notes?.includes(ws.split(" ")[0]) || (idx === 0 && !a.notes)).length;

          return (
            <div key={ws} className={`brand-card p-5 bg-white border-l-4 ${colorClass} space-y-1`}>
              <span className="text-xs font-bold text-slate-400 uppercase">{ws}</span>
              <div className="text-2xl font-black text-[#1E1B4B]">
                {count} {verticalConfig?.appointmentLabel || "Randevu"}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Aktif Çalışma Seansı</span>
            </div>
          );
        })}
      </div>

      {/* Randevu Zaman & Durum Filtreleme Barı */}
      <div className="brand-card p-4 space-y-4 bg-white">
        
        {/* ÜST ZAMAN FİLTRESİ (Gelecek / Geçmiş / Tüm Zamanlar) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#1E1B4B] uppercase tracking-wider">Zaman Dilimi:</span>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTimeScope("upcoming")}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  timeScope === "upcoming"
                    ? "bg-[#0066FF] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🔮 Gelecek Randevular ({upcomingCount})
              </button>

              <button
                type="button"
                onClick={() => setTimeScope("past")}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  timeScope === "past"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📜 Geçmiş Randevular ({pastCount})
              </button>

              <button
                type="button"
                onClick={() => setTimeScope("all")}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  timeScope === "all"
                    ? "bg-indigo-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📅 Tüm Zamanlar ({appointments.length})
              </button>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Gösterilen: <strong className="text-slate-900">{filteredAppointments.length}</strong> randevu
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all", label: `Tüm Durumlar (${appointments.length})` },
              { key: "confirmed", label: `Onaylandı (${appointments.filter(a => a.status === "confirmed").length})` },
              { key: "pending", label: `Bekliyor (${appointments.filter(a => a.status === "pending").length})` },
              { key: "completed", label: `Tamamlandı (${appointments.filter(a => a.status === "completed").length})` },
              { key: "no_show", label: `No-Show (${appointments.filter(a => a.status === "no_show").length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === tab.key
                    ? "bg-[#1E1B4B] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
            {(vertical === "legal" || vertical === "hukuk") && (
              <span className="px-3 py-1.5 text-xs font-black rounded-lg bg-violet-100 text-violet-800 border border-violet-200 flex items-center gap-1">
                <span>⚖️</span> <span>Duruşma & UYAP Takvimi Aktif</span>
              </span>
            )}
          </div>

          {/* Staff Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">İstasyon/Personel:</span>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="input-dark bg-white py-1 px-3 text-xs w-auto"
            >
              <option value="all">Tüm İstasyonlar</option>
              {activeWorkstations.map((ws) => (
                <option key={ws} value={ws}>
                  {ws}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Main View: Calendar or List */}
      {viewType === "calendar" ? (
        <CalendarView
          appointments={filteredAppointments}
          customWorkstations={activeWorkstations}
          onSelectSlot={(date, time, ws) => {
            setAppointmentDate(date);
            setAppointmentTime(time);
            setSelectedWorkstation(ws);
            setShowAddModal(true);
          }}
          onUpdateStatus={(id, status) => {
            const updated = appointments.map(a => a.id === id ? { ...a, status } : a);
            setAppointments(updated);
            localStorage.setItem("glowdesk_appointments", JSON.stringify(updated));
          }}
        />
      ) : (
        /* Randevu Kartları Akışı */
        <div className="space-y-3">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((apt) => (
              <AppointmentCard 
                key={apt.id} 
                appointment={apt} 
                onUpdateStatus={(id, status) => {
                  const updated = appointments.map(a => a.id === id ? { ...a, status } : a);
                  setAppointments(updated);
                  localStorage.setItem("glowdesk_appointments", JSON.stringify(updated));
                }}
              />
            ))
          ) : (
            <div className="brand-card p-12 text-center text-slate-500 space-y-2 bg-white">
              <p className="text-3xl">📅</p>
              <p className="text-sm font-bold text-[#1E1B4B]">Henüz Randevu Bulunmuyor</p>
              <p className="text-xs">Sisteme kaydolan yeni randevular burada listelenecektir.</p>
            </div>
          )}
        </div>
      )}

      {/* Yeni Randevu Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-[#1E1B4B] font-display text-lg">Yeni Randevu Kaydı</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
              {/* Müşteri Seçimi */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Müşteri Seçin</label>
                {customers.length > 0 ? (
                  <select 
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="input-dark bg-white"
                  >
                    <option value="">-- Müşteri Seçiniz --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name} ({c.phone || "Telefon yok"})</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    ⚠️ Kayıtlı müşteri yok. Önce &apos;Müşteriler&apos; sayfasından müşteri ekleyin veya manuel isim girin.
                  </div>
                )}
              </div>

              {/* Hizmet Seçimi */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Hizmet Seçin</label>
                {services.length > 0 ? (
                  <select 
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="input-dark bg-white"
                  >
                    <option value="">-- Hizmet Seçiniz --</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - ₺{s.price}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    ⚠️ Kayıtlı hizmet yok. Önce &apos;Hizmetler&apos; sayfasından hizmet tanımlayın.
                  </div>
                )}
              </div>

              {/* Koltuk / Personel Seçimi */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">İstasyon / Personel Seçin</label>
                <select 
                  value={selectedWorkstation}
                  onChange={(e) => setSelectedWorkstation(e.target.value)}
                  className="input-dark bg-white"
                >
                  {activeWorkstations.map((ws) => (
                    <option key={ws} value={ws}>
                      {ws}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tarih ve Saat */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Tarih</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Saat</label>
                  <input
                    type="time"
                    required
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="input-dark"
                  />
                </div>
              </div>

              {/* Notlar */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Notlar (İsteğe Bağlı)</label>
                <textarea
                  placeholder="Randevu notu..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-dark h-20 resize-none"
                />
              </div>

              {/* Kaydet & İptal */}
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 btn-secondary justify-center text-xs py-3"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="w-2/3 btn-primary justify-center text-xs py-3 shadow-md"
                >
                  Randevuyu Kaydet
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
