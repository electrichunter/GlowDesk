"use client";

import { useState, useEffect } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import DynamicStatsCards from "@/components/dashboard/DynamicStatsCards";
import AppointmentCard from "@/components/dashboard/AppointmentCard";
import { formatPrice } from "@/__mocks__/mock-data";
import { getCurrentSession } from "@/lib/session";
import type { Appointment } from "@/lib/types";
import StaffManagementModal from "@/components/dashboard/StaffManagementModal";
import BulkInvoiceModal from "@/components/dashboard/BulkInvoiceModal";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTenant } from "@/contexts/TenantContext";
import PlanFeatureGate from "@/components/dashboard/PlanFeatureGate";
import DashboardAppointmentFlow from "@/components/dashboard/DashboardAppointmentFlow";

export default function DashboardPage() {
  const { activePlan, planConfig, openUpgradeModal, hasFeature, verticalConfig } = useTenant();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({
    today_appointments: 0,
    today_confirmed: 0,
    today_no_show: 0,
    today_empty_slots: 0,
    monthly_revenue: 0,
    monthly_appointments: 0,
    no_show_rate: 0,
    waitlist_count: 0,
  });
  const [businessName, setBusinessName] = useState(() => getCurrentSession()?.businessName || "İşletmeniz");
  const [userName, setUserName] = useState(() => getCurrentSession()?.fullName || "");
  const [isNewUser, setIsNewUser] = useState(false);

  // POS Kasa & Adisyon State
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [selectedPosApt, setSelectedPosApt] = useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"nakit" | "kredi_karti" | "havale">("kredi_karti");
  const [posSuccess, setPosSuccess] = useState(false);
  const [dailyPosTotal, setDailyPosTotal] = useState<{ nakit: number; kredi: number; total: number }>({
    nakit: 0,
    kredi: 0,
    total: 0,
  });

  const [isImpersonating] = useState(() => !!getCurrentSession()?.impersonatingTenantId);
  const [zReportModalOpen, setZReportModalOpen] = useState(false);

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [bulkInvoiceModalOpen, setBulkInvoiceModalOpen] = useState(false);
  const [userRole] = useState<string>(() => getCurrentSession()?.role || "owner");
  const [tenantId] = useState<string>(() => getCurrentSession()?.tenantId || "tenant-demo-1");

  useEffect(() => {
    try {
      const session = getCurrentSession();
      const savedUserStr = localStorage.getItem("glowdesk_active_user");
      const activeUser = session || (savedUserStr ? JSON.parse(savedUserStr) : null);

      if (activeUser) {
        if (activeUser.businessName) setBusinessName(activeUser.businessName);
        if (activeUser.fullName) setUserName(activeUser.fullName);
        if (activeUser.isNewUser) setIsNewUser(true);
      }

      // MySQL Veritabanından Randevuları Çek
      const loadDashboardData = async () => {
        setLoading(true);
        try {
          const { apiRequest } = await import("@/lib/api-client");
          const { data: dbApts } = await apiRequest<any[]>("/appointments");
          if (dbApts && Array.isArray(dbApts)) {
            const formatted: Appointment[] = dbApts.map((a) => ({
              id: a.id,
              tenant_id: a.tenant_id,
              customer_id: a.customer_id,
              service_id: a.service_id,
              start_time: a.start_time || `${a.appointment_date}T10:00:00Z`,
              end_time: a.end_time || `${a.appointment_date}T11:00:00Z`,
              status: a.status || "confirmed",
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
                created_at: a.created_at || new Date().toISOString(),
              },
            }));

            setAppointments(formatted);

            const confirmed = formatted.filter((a) => a.status === "confirmed" || a.status === "pending").length;
            const noShow = formatted.filter((a) => a.status === "no_show").length;
            const completed = formatted.filter((a) => a.status === "completed").length;
            const revenue = formatted.reduce((acc, a) => acc + (a.service?.price || 0), 0);

            setStats({
              today_appointments: formatted.length,
              today_confirmed: confirmed,
              today_no_show: noShow,
              today_empty_slots: Math.max(0, 10 - formatted.length),
              monthly_revenue: revenue,
              monthly_appointments: completed,
              no_show_rate: formatted.length > 0 ? Math.round((noShow / formatted.length) * 100) : 0,
              waitlist_count: 2,

              // Sektöre Özel Metrik Eşleşmeleri
              open_cases: 14,
              deposit_pending: 3,
              lab_orders_pending: 4,
              recalled_patients: 12,
              bay_occupancy: 75,
              storage_bins_used: 48,
              active_members: 128,
              class_occupancy: 92,
              vaccines_due: 5,
              pet_hotel_occupancy: 80,
              assignments_pending: 3,
              active_students: 42,
              gallery_reviews_pending: 6,
              rented_equipment: 9,
              vip_room_occupancy: 85,
              vouchers_sold: 18,
              room_occupancy: 78,
              corporate_credits_used: 340,
              completed_hours: 142,
              exam_candidates: 11,
              total_guests: 64,
              table_occupancy: 82,
            });
          }
        } catch (err) {
          console.error("Dashboard data load error:", err);
        } finally {
          setLoading(false);
        }
      };

      loadDashboardData();
    } catch {
      setAppointments([]);
      setLoading(false);
    }
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: Appointment["status"]) => {
    const updated = appointments.map((apt) =>
      apt.id === id ? { ...apt, status: newStatus } : apt
    );
    setAppointments(updated);
    try {
      localStorage.setItem("glowdesk_appointments", JSON.stringify(updated));
      const { apiRequest } = await import("@/lib/api-client");
      await apiRequest(`/appointments/${id}/status?status=${newStatus}`, {
        method: "PATCH",
      });
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleOpenPosModal = (apt: Appointment) => {
    setSelectedPosApt(apt);
    setPosSuccess(false);
    setPosModalOpen(true);
  };

  const handleCompleteCheckout = () => {
    if (!selectedPosApt) return;
    const price = selectedPosApt.service?.price || 450;
    
    // Randevuyu tamamlandı yap
    handleUpdateStatus(selectedPosApt.id, "completed");

    // Kasa toplamını güncelle
    setDailyPosTotal((prev) => {
      const isNakit = paymentMethod === "nakit";
      return {
        nakit: isNakit ? prev.nakit + price : prev.nakit,
        kredi: !isNakit ? prev.kredi + price : prev.kredi,
        total: prev.total + price,
      };
    });

    setPosSuccess(true);
    setTimeout(() => {
      setPosModalOpen(false);
      setPosSuccess(false);
    }, 1800);
  };

  const handleExitImpersonation = () => {
    try {
      const adminPayload = {
        id: "usr-admin-1",
        role: "admin" as const,
        fullName: "Super Admin",
        email: "admin@glowdesk.com",
        exp: Math.floor(Date.now() / 1000) + 86400,
        iat: Math.floor(Date.now() / 1000),
      };
      localStorage.setItem("glowdesk_active_user", JSON.stringify(adminPayload));
      window.location.href = "/admin";
    } catch {
      window.location.href = "/admin";
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="p-4 bg-[#0F172A] text-white rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-layered border border-blue-500/30 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <span className="font-extrabold text-[#0066FF] block text-xs tracking-wider uppercase">SUPER ADMIN BÜRÜNME MODU</span>
              <span className="text-slate-300 text-xs font-medium">{businessName} paneli teknik destek amacıyla Super Admin yetkisiyle izleniyor.</span>
            </div>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="btn-primary-blue text-xs py-2 px-4"
          >
            ↩️ Admin Paneline Dön
          </button>
        </div>
      )}

      {/* ── KARŞILAMA VE HIZLI EYLEMLER ── */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-layered flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="badge-blue-soft">
              💼 Kontrol Merkezi
            </span>
            {isNewUser && (
              <span className="px-2.5 py-0.5 bg-[#0066FF]/10 text-[#0066FF] text-[10px] font-extrabold rounded-full border border-blue-200">
                🎉 Yeni {verticalConfig?.label || "İşletme"}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
            Hoş Geldiniz, {userName || businessName}!
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            {businessName} — {verticalConfig?.label || "İşletme"} Canlı Takip ve Yönetim Paneli.
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="flex flex-wrap gap-3">
          {userRole !== "staff" && (
            <button 
              onClick={() => setStaffModalOpen(true)}
              className="btn-secondary-white text-xs py-2.5 px-4"
            >
              👥 Ekip Yönetimi
            </button>
          )}
          <button 
            onClick={() => setBulkInvoiceModalOpen(true)}
            className="btn-secondary-white text-xs py-2.5 px-4"
          >
            🧾 Adisyon & Hizmet Özeti
          </button>
          <button 
            onClick={() => setZReportModalOpen(true)}
            className="btn-secondary-white text-xs py-2.5 px-4"
          >
            📊 Z-Raporu
          </button>
          <button 
            onClick={() => setPosModalOpen(true)}
            className="btn-primary-blue text-xs py-2.5 px-5"
          >
            💳 POS / Hızlı Kasa →
          </button>
        </div>
      </div>

      {/* ── SEKTÖRE ÖZEL DİNAMİK İSTATİSTİK BENTO GRID ── */}
      <DynamicStatsCards stats={stats} isLoading={loading} />

      {/* ── ENTERPRISE AI ASİSTAN & AKILLI İŞ ÖNERİLERİ MOTORU ── */}
      <PlanFeatureGate
        feature="ai_assistant"
        featureTitle="AI Akıllı Otomasyon & Tahmin Motoru"
        featureDescription="GlowDesk AI Motoru; haftalık yoğun saatleri analiz eder, no-show riski yüksek müşterileri önceden uyarır ve boş koltukları otomatik tekliflerle doldurur."
        requiredTier="enterprise"
      >
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/60 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs">
                  👑 Enterprise AI Engine Active
                </span>
                <span className="text-xs text-indigo-200 font-medium">Canlı Tahminleme</span>
              </div>
              <h3 className="text-xl font-extrabold font-display text-white">
                🤖 AI Asistanı: Bugünkü İşletme Önerileri
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <span>⚡ Yoğun Saat Uyarısı</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">
                    14:00 - 17:00 arası doluluk oranı <strong>%95</strong>. Yedek No-Show bekleme listesindeki 2 müşteriyi davet edebilirsiniz.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <span>💡 Gelir Optimizasyonu</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">
                    Geçen ay cilt bakımı yaptıran 4 sadık müşterinizin yenileme zamanı geldi. Tek tıkla hatırlatma SMS'i gönderilsin mi?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                className="py-2.5 px-5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>✨ 4 Müşteriye Hatırlat</span>
              </button>
              <button
                type="button"
                className="py-2 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
              >
                Detaylı AI Analizi →
              </button>
            </div>
          </div>
        </div>
      </PlanFeatureGate>

      {/* ── BENTO DÜZENİ (Sol: Randevular, Sağ: Canlı POS Kasa & Bot) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sol 8 Sütun: Randevu Akışı & Canlı Takvim */}
        <div className="lg:col-span-8">
          {loading ? (
            <SkeletonTable />
          ) : (
            <DashboardAppointmentFlow
              appointments={appointments}
              onUpdateStatus={handleUpdateStatus}
              onOpenPosModal={handleOpenPosModal}
              businessName={businessName}
              verticalConfig={verticalConfig}
            />
          )}
        </div>

        {/* Sağ 4 Sütun: POS Kasa Özeti & Akıllı Bot Kartı */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Canlı Kasa Kartı */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-layered space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 font-display">
                💳 POS & Adisyon Kasa Özeti
              </h3>
              <span className="text-[10px] bg-blue-50 text-[#0066FF] px-2.5 py-1 rounded-full font-extrabold border border-blue-200">
                Canlı Kasa
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700">
                <span>💵 Nakit Tahsilat:</span>
                <span className="font-extrabold text-slate-900">₺{dailyPosTotal.nakit.toLocaleString("tr-TR")}</span>
              </div>
              <div className="flex justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700">
                <span>💳 Kredi Kartı (POS):</span>
                <span className="font-extrabold text-slate-900">₺{dailyPosTotal.kredi.toLocaleString("tr-TR")}</span>
              </div>
              <div className="flex justify-between p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-slate-900 font-extrabold">
                <span>Gün Sonu Kasa Toplamı:</span>
                <span className="text-base text-[#0066FF] font-extrabold">₺{dailyPosTotal.total.toLocaleString("tr-TR")}</span>
              </div>
            </div>
          </div>

          {/* Akıllı Motor Kartı */}
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0066FF] text-white rounded-3xl p-6 shadow-layered space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider font-display">Otomatik No-Show Motoru</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Müşterilerinize seans öncesi WhatsApp onay mesajı gönderilir. Gelmeyen seanslar bekleme listesindeki müşterilerle otomatik doldurulur.
            </p>
          </div>

        </div>
      </div>

      {/* 💳 POS ADİSYON MODAL */}
      {posModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-widest">
                  🧾 POS Hızlı Adisyon & Fiş Basımı
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 font-display mt-0.5">
                  Ödeme Tahsilatı
                </h3>
              </div>
              <button
                onClick={() => setPosModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {posSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-4xl block">✅</span>
                <h4 className="font-extrabold text-emerald-900 text-base">Adisyon Tahsil Edildi!</h4>
                <p className="text-xs text-emerald-700 font-medium">
                  Ödeme kasaya işlendi ve müşteri randevusu tamamlandı.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedPosApt ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Müşteri:</span>
                      <span className="font-extrabold text-slate-900">{selectedPosApt.customer?.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Hizmet:</span>
                      <span className="font-extrabold text-slate-900">{selectedPosApt.service?.name}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                      <span className="text-slate-700">Ödenecek Tutar:</span>
                      <span className="font-extrabold text-[#0066FF] text-base">
                        {formatPrice(selectedPosApt.service?.price || 450, selectedPosApt.service?.currency)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tahsil Edilecek Tutar (₺)</label>
                    <input
                      type="number"
                      defaultValue={450}
                      className="input-dark text-lg font-extrabold"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Ödeme Yöntemi</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("kredi_karti")}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === "kredi_karti"
                          ? "bg-[#0066FF] text-white border-[#0066FF] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span>💳</span>
                      <span>Kredi Kartı</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("nakit")}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === "nakit"
                          ? "bg-[#0066FF] text-white border-[#0066FF] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span>💵</span>
                      <span>Nakit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("havale")}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === "havale"
                          ? "bg-[#0066FF] text-white border-[#0066FF] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span>📱</span>
                      <span>Havale / EFT</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCompleteCheckout}
                    className="w-full btn-primary-blue py-3.5 text-xs justify-center shadow-md"
                  >
                    💾 Ödemeyi Al & Fiş Yazdır
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📊 GÜN SONU Z-RAPORU MODAL */}
      {zReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-widest">
                  📊 Mali Gün Sonu Z-Raporu
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 font-display mt-0.5">
                  {businessName} Günlük Kasa Raporu
                </h3>
              </div>
              <button
                onClick={() => setZReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 bg-[#0F172A] text-white rounded-2xl space-y-2">
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Rapor Tarihi:</span>
                  <span>{new Date().toLocaleDateString("tr-TR")}</span>
                </div>
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>İşletme Adı:</span>
                  <span className="font-bold text-[#0066FF]">{businessName}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-extrabold">
                  <span className="text-slate-200">Tahsil Edilen Ciro:</span>
                  <span className="text-emerald-400">₺{dailyPosTotal.total.toLocaleString("tr-TR")}</span>
                </div>
              </div>

              <div className="space-y-1.5 font-sans">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ödeme Yöntemi Dağılımı</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">💵 Nakit Kasa:</span>
                    <span className="font-extrabold text-slate-900 text-sm">₺{dailyPosTotal.nakit.toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">💳 POS / Kredi Kartı:</span>
                    <span className="font-extrabold text-slate-900 text-sm">₺{dailyPosTotal.kredi.toLocaleString("tr-TR")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => { alert("Z-Raporu yazıcıya gönderildi (Demo)."); setZReportModalOpen(false); }}
                className="btn-primary-blue w-full justify-center text-xs py-3 shadow-md"
              >
                🖨️ Z-Raporunu Yazdır & Günü Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Çalışan Yönetimi & Performans Modalı */}
      <StaffManagementModal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        tenantId={tenantId}
      />

      {/* Çoklu Hizmetli Toplu Fatura Modalı */}
      <BulkInvoiceModal
        isOpen={bulkInvoiceModalOpen}
        onClose={() => setBulkInvoiceModalOpen(false)}
        tenantId={tenantId}
      />
    </div>
  );
}
