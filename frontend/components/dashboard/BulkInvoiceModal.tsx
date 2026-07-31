"use client";

import { useState } from "react";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: "srv-1", name: "Saç Kesim & Şampuan Yıkama", price: 350 },
  { id: "srv-2", name: "Sakal Tıraşı & Sıcak Havlu", price: 150 },
  { id: "srv-3", name: "Cilt Bakımı & Siyah Nokta Maskesi", price: 250 },
  { id: "srv-4", name: "Keratin Saç Bakımı", price: 500 },
  { id: "srv-5", name: "VIP Komple Bakım Paketi", price: 750 },
];

interface BulkInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
}

export default function BulkInvoiceModal({ isOpen, onClose, tenantId }: BulkInvoiceModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [staffName, setStaffName] = useState("Ahmet Usta (Kıdemli Kuaför)");
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([
    DEFAULT_SERVICES[0],
    DEFAULT_SERVICES[1],
  ]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Nakit");
  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);

  const toggleService = (srv: ServiceItem) => {
    if (selectedServices.some((s) => s.id === srv.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== srv.id));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const taxAmount = (discountedSubtotal * 20) / 100;
  const grandTotal = discountedSubtotal + taxAmount;

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert("Lütfen müşteri adını giriniz.");
      return;
    }
    if (selectedServices.length === 0) {
      alert("Lütfen en az 1 hizmet seçiniz.");
      return;
    }

    const invData = {
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      staffName,
      items: selectedServices.map((s) => ({ serviceName: s.name, price: s.price, quantity: 1 })),
      subtotal,
      discountAmount: discount,
      taxRate: 20,
      taxAmount,
      grandTotal,
      paymentMethod,
      issuedAt: new Date().toLocaleString("tr-TR"),
    };

    try {
      const { apiRequest } = await import("@/lib/api-client");
      await apiRequest("/invoices", {
        method: "POST",
        body: JSON.stringify({
          tenantId,
          customerName,
          customerPhone,
          staffName,
          items: selectedServices.map((s) => ({ serviceName: s.name, price: s.price, quantity: 1 })),
          paymentMethod,
          taxRate: 20,
          discountAmount: discount,
        }),
      });
    } catch (err) {
      console.warn("Invoice API warning:", err);
    }

    setGeneratedInvoice(invData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-6 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧾</span>
              <h2 className="text-xl font-black font-display tracking-tight">Toplu Hizmet Faturası & Adisyon Kes</h2>
            </div>
            <p className="text-xs text-emerald-200 mt-1">
              Birden fazla hizmet seçerek tek seferde resmi fatura veya adisyon fişi oluşturun.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {!generatedInvoice ? (
            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              
              {/* Müşteri & Personel Seçimi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Müşteri Adı *</label>
                  <input
                    type="text" required
                    placeholder="ör. Ömer Faruk Uysal"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Hizmet Veren Personel</label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* Çoklu Hizmet Seçim Listesi */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  ✂️ Yapılan Hizmetleri Seçin (Çoklu Seçim)
                </label>
                <div className="space-y-2">
                  {DEFAULT_SERVICES.map((srv) => {
                    const isSelected = selectedServices.some((s) => s.id === srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleService(srv)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 font-bold"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span className="text-xs font-bold">{srv.name}</span>
                        </div>
                        <span className="text-xs font-black text-emerald-700">₺{srv.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ödeme Yöntemi & İndirim */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Ödeme Yöntemi</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option value="Nakit">💵 Nakit</option>
                    <option value="Kredi Kartı">💳 Kredi Kartı (POS)</option>
                    <option value="Havale / EFT">🏦 Havale / EFT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">İndirim Tutarı (₺)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* Hesaplanan Fatura Özeti */}
              <div className="bg-emerald-950 text-white p-4 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Hizmet Ara Toplamı:</span>
                  <span>₺{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-300">
                    <span>Uygulanan İndirim:</span>
                    <span>-₺{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>KDV (%20):</span>
                  <span>₺{taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-black text-emerald-400">
                  <span>GENEL TOPLAM:</span>
                  <span>₺{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs transition-all shadow-md"
              >
                🧾 Toplu Fatura / Fişi Oluştur
              </button>

            </form>
          ) : (
            /* OLUŞTURULAN RESMİ FATURA TASLAĞI VE YAZDIRMA */
            <div className="space-y-4">
              <div className="p-6 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs text-slate-800 space-y-4">
                <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                  <div>
                    <h3 className="font-black text-sm text-slate-900">GlowDesk Resmi Fatura</h3>
                    <p className="text-[10px] text-slate-500">Fatura No: {generatedInvoice.invoiceNumber}</p>
                    <p className="text-[10px] text-slate-500">Tarih: {generatedInvoice.issuedAt}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-[10px]">
                    ÖDENDİ ({generatedInvoice.paymentMethod})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <p className="font-bold text-slate-500">MÜŞTERİ:</p>
                    <p className="font-extrabold">{generatedInvoice.customerName}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-500">HİZMET VEREN:</p>
                    <p className="font-extrabold">{generatedInvoice.staffName}</p>
                  </div>
                </div>

                {/* Hizmet Kalemleri */}
                <div>
                  <p className="font-bold text-slate-500 mb-1">HİZMET KALEMLERİ:</p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {generatedInvoice.items.map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between p-2 text-xs border-b last:border-0 border-slate-100">
                        <span>1x {it.serviceName}</span>
                        <span className="font-bold">₺{it.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-right text-xs pt-2">
                  <p>Ara Toplam: ₺{generatedInvoice.subtotal}</p>
                  {generatedInvoice.discountAmount > 0 && (
                    <p className="text-rose-600">İndirim: -₺{generatedInvoice.discountAmount}</p>
                  )}
                  <p>KDV (%20): ₺{generatedInvoice.taxAmount.toFixed(2)}</p>
                  <p className="text-sm font-black text-emerald-700 pt-1 border-t border-slate-300">
                    TOPLAM TUTAR: ₺{generatedInvoice.grandTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>🖨️</span> <span>Faturayı Yazdır / PDF İndir</span>
                </button>
                <button
                  onClick={() => setGeneratedInvoice(null)}
                  className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all"
                >
                  Yeni Fatura Kes
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
