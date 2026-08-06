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
  { id: "srv-4", name: "Danışmanlık & Seans Hizmeti", price: 500 },
  { id: "srv-5", name: "VIP Komple Hizmet Paketi", price: 750 },
];

interface BulkInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
}

export default function BulkInvoiceModal({ isOpen, onClose, tenantId }: BulkInvoiceModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [staffName, setStaffName] = useState("Sorumlu Personel");
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([
    DEFAULT_SERVICES[0],
    DEFAULT_SERVICES[1],
  ]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Nakit");
  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);
  
  // GİB e-Fatura Integrator State
  const [showEFaturaModal, setShowEFaturaModal] = useState(false);
  const [integrator, setIntegrator] = useState("uyumsoft");
  const [taxNumber, setTaxNumber] = useState("11111111111");
  const [eFaturaResult, setEFaturaResult] = useState<any | null>(null);
  const [sendingEFatura, setSendingEFatura] = useState(false);

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
      invoiceNumber: `ADS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
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

  const handleSendGibEFatura = async () => {
    if (!generatedInvoice) return;
    setSendingEFatura(true);
    setEFaturaResult(null);

    try {
      const { apiRequest } = await import("@/lib/api-client");
      const { data } = await apiRequest<any>("/invoices/gib-efatura", {
        method: "POST",
        body: JSON.stringify({
          tenantId,
          integrator,
          taxNumber,
          customerName: generatedInvoice.customerName,
          items: generatedInvoice.items,
          grandTotal: generatedInvoice.grandTotal,
          paymentMethod: generatedInvoice.paymentMethod,
        }),
      });

      if (data) {
        setEFaturaResult(data);
      }
    } catch (err) {
      console.error("e-Fatura error:", err);
      alert("e-Fatura entegratör bağlantı hatası.");
    } finally {
      setSendingEFatura(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Thermal POS Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #adisyon-print-area, #adisyon-print-area * {
            visibility: visible;
          }
          #adisyon-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 4mm;
            margin: 0;
            font-size: 11px;
            color: black;
            background: white;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 no-print">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧾</span>
              <h2 className="text-xl font-black font-display tracking-tight">Adisyon & Hizmet Özeti Fişi</h2>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              Tamamlanan hizmetler için 1 sayfalık hızlı adisyon fişi çıkarın veya GİB e-Fatura entegratörüne iletin.
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
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Hizmet Veren Personel</label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 outline-none"
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
                            ? "bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span className="text-xs font-bold">{srv.name}</span>
                        </div>
                        <span className="text-xs font-black text-indigo-700">₺{srv.price}</span>
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
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
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
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* Adisyon Özeti */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1.5 text-xs">
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
                  <span>KDV Dahil / Matrah:</span>
                  <span>₺{discountedSubtotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-black text-cyan-400">
                  <span>GENEL TOPLAM:</span>
                  <span>₺{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs transition-all shadow-md"
              >
                🧾 Adisyon Fişi Oluştur
              </button>

            </form>
          ) : (
            /* OLUŞTURULAN TEK SAYFALIK ADİSYON FİŞİ */
            <div className="space-y-4">
              
              {/* POS Fişi Kartı */}
              <div id="adisyon-print-area" className="p-6 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs text-slate-900 space-y-3 shadow-inner">
                <div className="text-center border-b border-slate-300 pb-3 space-y-1">
                  <h3 className="font-black text-base text-slate-900 tracking-wider">GLOWDESK ADİSYON FİŞİ</h3>
                  <p className="text-[10px] text-slate-600 font-bold">HİZMET ÖZETİ BİLGİ FİŞİ</p>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>Fiş No: {generatedInvoice.invoiceNumber}</span>
                    <span>{generatedInvoice.issuedAt}</span>
                  </div>
                </div>

                <div className="text-[11px] space-y-0.5 border-b border-slate-200 pb-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">MÜŞTERİ:</span>
                    <span className="font-extrabold">{generatedInvoice.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PERSONEL:</span>
                    <span className="font-extrabold">{generatedInvoice.staffName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ÖDEME:</span>
                    <span className="font-extrabold text-emerald-700">{generatedInvoice.paymentMethod}</span>
                  </div>
                </div>

                {/* Kalemler */}
                <div className="space-y-1">
                  <p className="font-extrabold text-[10px] uppercase text-slate-400">ALINAN HİZMETLER:</p>
                  {generatedInvoice.items.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs py-0.5 border-b border-dashed border-slate-200">
                      <span>1x {it.serviceName}</span>
                      <span className="font-bold">₺{it.price}</span>
                    </div>
                  ))}
                </div>

                {/* Toplam */}
                <div className="space-y-1 text-right text-xs pt-2 border-t border-slate-300">
                  <p className="text-slate-600">Ara Toplam: ₺{generatedInvoice.subtotal}</p>
                  {generatedInvoice.discountAmount > 0 && (
                    <p className="text-rose-600 font-bold">İndirim: -₺{generatedInvoice.discountAmount}</p>
                  )}
                  <p className="text-sm font-black text-slate-900 pt-1 border-t border-slate-400">
                    ÖDENEN TOPLAM: ₺{generatedInvoice.grandTotal.toFixed(2)}
                  </p>
                </div>

                <div className="text-center pt-2 text-[9px] text-slate-400">
                  *** Teşekkür Eder Yine Bekleriz ***
                </div>
              </div>

              {/* E-Fatura Integrator Section */}
              {showEFaturaModal && (
                <div className="p-4 bg-indigo-950 text-white rounded-2xl space-y-3 animate-fade-in no-print">
                  <div className="flex justify-between items-center border-b border-indigo-800 pb-2">
                    <h4 className="font-black text-xs text-cyan-300">⚡ GİB e-Fatura / e-Arşiv Entegratör Gönderimi</h4>
                    <button onClick={() => setShowEFaturaModal(false)} className="text-xs text-slate-400 font-bold">✕</button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Entegratör Seçin</label>
                      <select
                        value={integrator}
                        onChange={(e) => setIntegrator(e.target.value)}
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                      >
                        <option value="uyumsoft">Uyumsoft e-Fatura API</option>
                        <option value="qnb_efinans">QNB eFinans API</option>
                        <option value="parasut">Paraşüt e-Fatura</option>
                        <option value="izibiz">İzibiz Entegrasyon</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Firma / Müşteri VKN-TCKN</label>
                      <input
                        type="text"
                        maxLength={11}
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSendGibEFatura}
                    disabled={sendingEFatura}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-extrabold rounded-xl text-xs shadow-md disabled:opacity-50"
                  >
                    {sendingEFatura ? "GİB Sistemine İletiliyor..." : "✓ GİB Sistemine Gönder (Onayla & PDF Al)"}
                  </button>

                  {eFaturaResult && (
                    <div className="p-3 bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-xs space-y-1 text-emerald-200 font-mono">
                      <p className="font-extrabold text-white">✓ e-Fatura Başarıyla Oluşturuldu!</p>
                      <p>ETTN: {eFaturaResult.ettn}</p>
                      <p>GİB Fatura No: {eFaturaResult.gibInvoiceNumber}</p>
                      <p className="text-[10px] text-cyan-300">Resmi GİB onaylı XML & PDF sisteme kaydedildi.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>🖨️</span> <span>Adisyon Fişini Yazdır (1 Sayfa Compact POS)</span>
                </button>

                <button
                  onClick={() => setShowEFaturaModal(!showEFaturaModal)}
                  className="py-3 px-4 bg-purple-900 hover:bg-purple-800 text-purple-200 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 border border-purple-700"
                >
                  <span>⚡</span> <span>e-Fatura Gönder (GİB)</span>
                </button>

                <button
                  onClick={() => {
                    setGeneratedInvoice(null);
                    setShowEFaturaModal(false);
                  }}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all"
                >
                  Yeni Adisyon
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
