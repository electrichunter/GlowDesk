"use client";

import { useState } from "react";
import Link from "next/link";

export interface SupportTicket {
  id: string;
  type: "ACİL" | "SATIŞ" | "ÜRÜN";
  phone: string;
  note: string;
  status: "ACİL" | "BEKLİYOR" | "ÇÖZÜLDÜ";
  createdAt: string;
}

export default function LiveChatWidget() {
  const [chatOpen, setChatOpen] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<"menu" | "sales" | "product" | "emergency" | "emergency_success">("menu");
  
  // Emergency Form State
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleSendEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setSubmitting(true);

    const newTicketId = `GD-ACIL-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: SupportTicket = {
      id: newTicketId,
      type: currentScreen === "emergency" ? "ACİL" : "SATIŞ",
      phone,
      note: note || "Canlı Destek Widget'ı Üzerinden Acil Çağrı Talebi",
      status: "ACİL",
      createdAt: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };

    // Save ticket to localStorage for Admin Panel retrieval
    try {
      const existing = JSON.parse(localStorage.getItem("glowdesk_emergency_tickets") || "[]");
      existing.unshift(newTicket);
      localStorage.setItem("glowdesk_emergency_tickets", JSON.stringify(existing));
      // Dispatch event to notify open Admin dashboard tabs instantly
      window.dispatchEvent(new Event("glowdesk_new_ticket"));
    } catch (err) {
      console.warn("Storage warning:", err);
    }

    setTicketId(newTicketId);
    setSubmitting(false);
    setCurrentScreen("emergency_success");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {chatOpen && (
        <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200/90 w-[340px] space-y-4 animate-in fade-in zoom-in-95 duration-200 card-inset-border">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#0066FF] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ⚡
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 block font-display leading-tight">
                  GlowDesk Destek Asistanı
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Canlı Destek Ekibi Çevrimiçi
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* SCREEN 1: MAIN MENU */}
          {currentScreen === "menu" && (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-xs text-slate-800 font-medium leading-relaxed">
                👋 Merhaba! Size nasıl yardımcı olabilirim? Aşağıdaki konulardan seçim yapabilirsiniz:
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("sales")}
                  className="w-full text-left text-xs font-bold text-slate-800 bg-slate-50 hover:bg-blue-50 hover:text-[#0066FF] p-3 rounded-2xl border border-slate-200 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>💬 Satış öncesi sorum var</span>
                  <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentScreen("product")}
                  className="w-full text-left text-xs font-bold text-slate-800 bg-slate-50 hover:bg-blue-50 hover:text-[#0066FF] p-3 rounded-2xl border border-slate-200 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>🛠️ Mevcut Ürünüm ile ilgili sorum var</span>
                  <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentScreen("emergency")}
                  className="w-full text-center text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 p-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🚨 ACİL DESTEK TALEBİ</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2: SALES INQUIRY */}
          {currentScreen === "sales" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setCurrentScreen("menu")}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
              >
                ← Ana Menüye Dön
              </button>
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-xs text-slate-800 font-medium leading-relaxed">
                GlowDesk 1 ay boyunca tamamen ücretsizdir, kredi kartı gerekmez. Sık sorulan durumlar:
              </div>
              <div className="space-y-2">
                <Link
                  href="/satis-oncesi-bilgi"
                  className="block text-center text-xs font-bold text-[#0066FF] bg-blue-50 p-2.5 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  📖 Satış Öncesi SSS &amp; Bilgi Sayfası →
                </Link>
                <button
                  type="button"
                  onClick={() => setCurrentScreen("emergency")}
                  className="w-full text-center text-xs font-bold text-slate-800 bg-slate-100 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  📞 Beni Telefonla Arayın
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: PRODUCT INQUIRY */}
          {currentScreen === "product" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setCurrentScreen("menu")}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
              >
                ← Ana Menüye Dön
              </button>
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-xs text-slate-800 font-medium leading-relaxed">
                No-Show bekleme listesi, WhatsApp teyit mesajları ve takvim entegrasyonu rehberimize göz atabilirsiniz:
              </div>
              <div className="space-y-2">
                <Link
                  href="/urun-destek"
                  className="block text-center text-xs font-bold text-[#0066FF] bg-blue-50 p-2.5 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  🛠️ Ürün Destek Kılavuzu →
                </Link>
                <button
                  type="button"
                  onClick={() => setCurrentScreen("emergency")}
                  className="w-full text-center text-xs font-bold text-slate-800 bg-slate-100 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  🚨 Acil Teknik Çağrı Bırakın
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 4: EMERGENCY FORM */}
          {currentScreen === "emergency" && (
            <form onSubmit={handleSendEmergency} className="space-y-3">
              <button
                type="button"
                onClick={() => setCurrentScreen("menu")}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
              >
                ← Ana Menüye Dön
              </button>

              <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 text-xs text-rose-800 font-bold">
                🚨 Nöbetçi Destek Ekibine &amp; Admin Paneline Bildirim Düşecek:
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Telefon Numarası *</label>
                <input
                  type="tel" required
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Sorununuz (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="ör. Randevu takvimi açılmıyor"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer"
              >
                {submitting ? "Gönderiliyor..." : "🚨 ACİL ÇAĞRI BİLDİR"}
              </button>
            </form>
          )}

          {/* SCREEN 5: EMERGENCY SUCCESS */}
          {currentScreen === "emergency_success" && (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mx-auto font-bold">
                ✓
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">Talep Admin Paneline İletildi!</h4>
              <p className="text-xs text-slate-600 font-medium">
                Bilet No: <span className="font-mono font-bold text-[#0066FF]">{ticketId}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Nöbetçi destek ekibimiz ve Admin sistemine çağrınız düştü. Telefonla aranacaksınız.
              </p>
              <button
                type="button"
                onClick={() => setCurrentScreen("menu")}
                className="text-xs font-bold text-[#0066FF] hover:underline pt-2 inline-block"
              >
                Tamam
              </button>
            </div>
          )}

        </div>
      )}

      {/* Floating Chat Launcher Button */}
      <button
        type="button"
        onClick={() => setChatOpen(!chatOpen)}
        className="w-14 h-14 rounded-full bg-[#0F172A] text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform relative group cursor-pointer border-2 border-white/20"
      >
        <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white font-extrabold text-[11px] rounded-full flex items-center justify-center border-2 border-white">
          1
        </span>
      </button>
    </div>
  );
}
