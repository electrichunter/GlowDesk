"use client";

import { useState, useEffect } from "react";
import type { Customer } from "@/lib/types";
import { safeJsonParse } from "@/lib/sanitize";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const { apiRequest } = await import("@/lib/api-client");
        const { data } = await apiRequest<any[]>("/customers");
        if (data && Array.isArray(data)) {
          setCustomers(
            data.map((c) => ({
              id: c.id,
              tenant_id: c.tenant_id,
              full_name: c.full_name,
              phone: c.phone || undefined,
              email: c.email || undefined,
              notes: c.notes || undefined,
              appointment_count: c.appointment_count || 0,
              no_show_count: c.no_show_count || 0,
              is_blacklisted: c.is_blacklisted || false,
              created_at: c.created_at || new Date().toISOString(),
              updated_at: c.updated_at || new Date().toISOString(),
            }))
          );
        }
      } catch (err) {
        console.error("Customers fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      const { apiRequest } = await import("@/lib/api-client");
      const { data: newCust, error } = await apiRequest<any>("/customers", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      if (error) {
        alert(`❌ Hata: ${error}`);
        return;
      }

      if (newCust) {
        const formatted: Customer = {
          id: newCust.id,
          tenant_id: newCust.tenant_id,
          full_name: newCust.full_name,
          phone: newCust.phone || undefined,
          email: newCust.email || undefined,
          notes: newCust.notes || undefined,
          appointment_count: 0,
          no_show_count: 0,
          is_blacklisted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setCustomers((prev) => [formatted, ...prev]);
        setSelectedCustomer(formatted);
        setShowAddModal(false);
        setFullName("");
        setPhone("");
        setEmail("");
        setNotes("");
      }
    } catch (err) {
      console.error("Customer save error:", err);
    }
  };

  // Kara Listeye Al / Engeli Kaldır
  const handleToggleBlacklist = (customer: Customer) => {
    const nextStatus = !customer.is_blacklisted;
    const updated = customers.map((c) =>
      c.id === customer.id ? { ...c, is_blacklisted: nextStatus } : c
    );
    setCustomers(updated);
    localStorage.setItem("glowdesk_customers", JSON.stringify(updated));

    if (customer.phone) {
      const savedBlacklist: string[] = safeJsonParse(localStorage.getItem("glowdesk_blacklisted_phones"), []);
      if (nextStatus) {
        if (!savedBlacklist.includes(customer.phone)) {
          localStorage.setItem("glowdesk_blacklisted_phones", JSON.stringify([...savedBlacklist, customer.phone]));
        }
      } else {
        const filtered = savedBlacklist.filter(p => p !== customer.phone);
        localStorage.setItem("glowdesk_blacklisted_phones", JSON.stringify(filtered));
      }
    }

    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer({ ...selectedCustomer, is_blacklisted: nextStatus });
    }
  };

  // Filter
  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-[#1E1B4B]">Müşteri CRM & Kara Liste (Blacklist)</h1>
          <p className="text-slate-500 text-xs mt-1">İşletmenize kayıtlı müşterileri yönetin, sadakat metriklerini takip edin ve No-Show yapanları engelleyin.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2.5 px-4 shadow-sm"
          >
            👤 Yeni Müşteri Kaydet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sol Panel: Müşteri Tablosu */}
        <div className="lg:col-span-2 space-y-4">
          <div className="brand-card p-3 bg-white">
            <input
              type="text"
              placeholder="İsim, telefon veya e-posta ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-dark"
            />
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E1B4B] text-white uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Müşteri</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4 text-center">Ziyaret</th>
                  <th className="p-4 text-center">Durum</th>
                  <th className="p-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-[#1E1B4B]">
                        {c.full_name}
                        {c.is_blacklisted && (
                          <span className="block text-[9px] text-rose-600 font-extrabold uppercase">🚫 KARA LİSTEDE</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600">{c.phone || "Girilmemiş"}</td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-md font-extrabold text-[11px]">
                          {c.appointment_count || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {c.is_blacklisted ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded font-extrabold text-[10px] uppercase">
                            Engelli
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-extrabold text-[10px] uppercase">
                            Aktif
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#1E1B4B] border border-slate-200 text-[10px] font-bold hover:bg-[#1E1B4B] hover:text-white transition-all"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() => handleToggleBlacklist(c)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                            c.is_blacklisted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          {c.is_blacklisted ? "Engeli Kaldır" : "Engelle (Kara Liste)"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-500 font-medium">
                      Henüz kayıtlı müşteri bulunmuyor. &apos;Yeni Müşteri Kaydet&apos; butonunu kullanarak müşteri ekleyebilirsiniz.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sağ Panel: Seçili Müşteri Kartı */}
        <div className="lg:col-span-1">
          {selectedCustomer ? (
            <div className="brand-card p-6 space-y-6 bg-white sticky top-28 shadow-md">
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-[#1E1B4B] text-base">{selectedCustomer.full_name}</h3>
                  <span className="text-[10px] text-cyan-600 font-bold uppercase mt-1 block">
                    Ziyaret: {selectedCustomer.appointment_count || 0} | Gelmedi (No-Show): {selectedCustomer.no_show_count || 0}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {selectedCustomer.is_blacklisted && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold">
                  🚫 Bu müşteri kara listededir. Online sistemden randevu alması engellenmiştir.
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">Telefon:</span>
                  <span className="text-slate-800 font-bold block mt-1">{selectedCustomer.phone || "Girilmemiş"}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">E-posta:</span>
                  <span className="text-slate-800 font-bold block mt-1">{selectedCustomer.email || "Girilmemiş"}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">Müşteri Notları:</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1.5 leading-relaxed font-normal">
                    {selectedCustomer.notes || "Bu müşteri için henüz eklenmiş özel bir not yok."}
                  </p>
                </div>

                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-indigo-950 font-black">
                    <span>💳 Paket & Ders Kredi Cüzdanı</span>
                    <span className="px-2 py-0.5 bg-indigo-200 text-indigo-900 rounded-md text-[10px]">Aktif</span>
                  </div>
                  <p className="text-slate-600 text-[11px] font-semibold">
                    10 Seanslık Paket: <strong>Kalan 4 Kredi</strong> (Son kullanım: 15.12.2026)
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleToggleBlacklist(selectedCustomer)}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-xs ${
                    selectedCustomer.is_blacklisted
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  {selectedCustomer.is_blacklisted ? "✅ Engeli Kaldır (Kabul Et)" : "🚫 Kara Listeye Al (Yeni Randevu Verme)"}
                </button>
              </div>

            </div>
          ) : (
            <div className="brand-card p-6 text-center py-16 space-y-3 bg-white border-dashed">
              <span className="text-3xl">👤</span>
              <h4 className="font-extrabold text-[#1E1B4B] text-sm">Müşteri Detay & CRM</h4>
              <p className="text-slate-500 text-xs max-w-xs mx-auto leading-normal">
                Detaylı geçmiş, No-Show puanı ve kara liste durumunu görmek için listeden bir müşteri seçin.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Yeni Müşteri Ekle Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-[#1E1B4B] font-display text-lg">Yeni Müşteri Ekle</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Merve Şahin"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Telefon Numarası</label>
                <input
                  type="tel"
                  placeholder="+90 555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">E-posta Adresi</label>
                <input
                  type="email"
                  placeholder="merve@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Özel Notlar</label>
                <textarea
                  placeholder="Cilt hassasiyeti, saç tercihi vb..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-dark h-20 resize-none"
                />
              </div>

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
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
