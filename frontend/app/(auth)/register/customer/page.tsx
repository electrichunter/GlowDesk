"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setSessionCookie } from "@/lib/session";
import { isValidEmail, sanitizeText, checkPasswordStrength } from "@/lib/sanitize";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const pwStrength = checkPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !phone.trim() || !email || !password) {
      setErrorMsg("Lütfen tüm alanları doldurun.");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMsg("Geçerli bir e-posta adresi girin.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    const cleanName = sanitizeText(fullName, 100);

    try {
      const { apiRequest } = await import('@/lib/api-client');
      const { data, error } = await apiRequest('/auth/register/customer', {
        method: 'POST',
        body: JSON.stringify({
          fullName: cleanName,
          email,
          phone,
          password
        }),
      });

      if (data && data.token) {
        setSessionCookie(data.token);
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("glowdesk_active_user", JSON.stringify(data.user));
        }
        setLoading(false);
        if (typeof window !== "undefined") {
          window.location.href = "/my-appointments";
        } else {
          router.push("/my-appointments");
        }
        return;
      }

      if (error) {
        setErrorMsg(error);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error("FastAPI customer registration error:", err);
      setErrorMsg(err?.message || "Sunucuya ulaşılamadı. Lütfen tekrar deneyiniz.");
      setLoading(false);
    }
  };

  const strengthColors = ["bg-slate-200", "bg-rose-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"];
  const strengthLabels = ["", "Çok Zayıf", "Zayıf", "Orta", "Güçlü"];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* Sol Panel */}
      <div className="hidden md:flex flex-col justify-between w-[440px] bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0066FF] text-white p-12 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#0066FF] rounded-full blur-3xl" />
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0066FF] text-white font-extrabold flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold font-display tracking-tight text-white">
            Glow<span className="text-blue-400">Desk</span>
          </span>
        </Link>

        <div className="relative z-10 space-y-6">
          <div className="text-4xl">👤</div>
          <h2 className="text-3xl font-extrabold font-display leading-tight">
            Randevunu Online Al, Zamanını Boşa Harcama
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Türkiye&apos;nin en iyi güzellik salonu, berber ve spa işletmelerini keşfet. Tek tıkla randevu al, iptal et veya yeniden planla.
          </p>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm space-y-2 text-xs text-white/90 font-semibold">
            <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> %100 Ücretsiz kişisel üyelik</div>
            <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> 7/24 online randevu alma</div>
            <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Otomatik WhatsApp hatırlatıcılar</div>
          </div>
        </div>

        <p className="text-xs text-slate-400 relative z-10 font-medium">© {new Date().getFullYear()} GlowDesk Platform.</p>
      </div>

      {/* Sağ Panel: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-16 bg-white">
        <div className="max-w-md w-full mx-auto space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/register" className="text-xs text-slate-400 hover:text-slate-600 font-bold">← Geri</Link>
              <span className="text-xs text-slate-300">|</span>
              <span className="text-xs font-bold text-[#0066FF] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">👤 Kullanıcı Kaydı</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-display">
              Kullanıcı Hesabı Oluştur
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Randevu almak ve salonları keşfetmek için ücretsiz hesabınızı açın.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
              <span>⚠️</span> <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Ad Soyad *</label>
              <input
                type="text" required
                placeholder="Ahmet Yılmaz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Telefon Numarası *</label>
              <input
                type="tel" required
                placeholder="+90 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">E-posta Adresi *</label>
              <input
                type="email" required
                placeholder="isim@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Şifre *</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"} required
                  placeholder="Min. 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-700 text-sm p-1 select-none focus:outline-none"
                  title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${pwStrength.score >= i ? strengthColors[pwStrength.score] : "bg-slate-200"}`} />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500">{strengthLabels[pwStrength.score]}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-blue py-3.5 justify-center text-sm font-extrabold shadow-md mt-2 rounded-2xl"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : "Ücretsiz Hesap Oluştur →"}
            </button>
          </form>

          <div className="space-y-2 text-center pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="font-extrabold text-[#0066FF] hover:underline">Giriş Yapın</Link>
            </p>
            <p className="text-xs text-slate-400 font-medium">
              İşletme sahibi misiniz?{" "}
              <Link href="/register/business" className="font-extrabold text-slate-900 hover:underline">İşletme Kaydı →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
