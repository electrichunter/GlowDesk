"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCurrentSession, setSessionCookie, createSession, type SessionPayload } from "@/lib/session";

export default function CustomerProfilePage() {
  const [session, setSession] = useState<SessionPayload | null>(() => getCurrentSession());
  const [fullName, setFullName] = useState(() => getCurrentSession()?.fullName || "");
  const [phone, setPhone] = useState(() => getCurrentSession()?.phone || "");
  const [email, setEmail] = useState(() => getCurrentSession()?.email || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const updated = {
      ...session,
      fullName,
      phone,
      email,
    };
    const token = createSession(updated);
    setSessionCookie(token);
    setSession(updated);

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("glowdesk_active_user", JSON.stringify(updated));
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 mt-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
                ⚙️ Müşteri Hesabı
              </span>
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                Profil Bilgilerim
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1E1B4B] font-display mt-0.5">
              Profil & İletişim Ayarları
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Randevu sms ve onay bildirimlerinin geleceği iletişim bilgilerinizi düzenleyin.
            </p>
          </div>

          {savedSuccess && (
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <span>✓</span> Profiliniz başarıyla güncellendi!
            </div>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="brand-card p-6 space-y-5 bg-white border border-slate-200 shadow-xs">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Ad Soyad *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-dark text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">E-posta Adresi *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Telefon Numarası *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-dark text-xs font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="btn-cyan text-xs py-2.5 px-6 font-extrabold shadow-sm"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
