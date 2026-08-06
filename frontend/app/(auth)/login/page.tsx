"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSession, setSessionCookie, type UserRole } from "@/lib/session";
import { isValidEmail, checkRateLimit } from "@/lib/sanitize";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isValidEmail(email)) {
      setErrorMsg("Geçerli bir e-posta adresi girin.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    const rl = checkRateLimit(`login:${email}`, 5, 60_000, 300_000);
    if (!rl.allowed) {
      const mins = Math.ceil((rl.retryAfterMs ?? 0) / 60000);
      setErrorMsg(`Çok fazla hatalı giriş denemesi. ${mins} dakika bekleyin.`);
      return;
    }

    setLoading(true);

    // ── Master Super Admin Hızlı Giriş ──
    if (email.trim().toLowerCase() === "admin@glowdesk.com" && password === "Admin1234!") {
      const adminObj = {
        id: "usr-superadmin-glowdesk",
        role: "admin" as UserRole,
        fullName: "GlowDesk Super Admin",
        email: "admin@glowdesk.com",
      };
      const token = createSession(adminObj);
      setSessionCookie(token);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("glowdesk_active_user", JSON.stringify(adminObj));
      }
      setLoading(false);
      router.push("/admin");
      return;
    }

    // ── FastAPI Backend ──
    try {
      const { apiRequest } = await import('@/lib/api-client');
      const { data, error } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data && data.access_token) {
        setSessionCookie(data.access_token);
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("glowdesk_active_user", JSON.stringify(data.user));
        }
        setLoading(false);

        const role = data.user.role;
        const target = (nextPath && !nextPath.startsWith("/login")) ? nextPath :
                       role === "admin" ? "/admin" :
                       role === "customer" ? "/my-appointments" : "/dashboard";

        if (typeof window !== "undefined") {
          window.location.href = target;
        } else {
          router.push(target);
        }
        return;
      }

      if (error) {
        setErrorMsg(error);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error("FastAPI login error:", err);
      setErrorMsg(err?.message || "Sunucuya ulaşılamadı. Lütfen tekrar deneyiniz.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-8">
      {/* Brand Header */}
      <Link href="/" className="inline-flex items-center gap-2 group">
        <div className="w-9 h-9 rounded-xl bg-[#0066FF] text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-display">
          Glow<span className="text-[#0066FF]">Desk</span>
        </span>
      </Link>

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
          Hoş Geldiniz
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Salon panelinize erişmek veya randevularınızı yönetmek için giriş yapın.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-start gap-2 animate-in fade-in duration-200">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            E-posta Adresi
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="esnaf@salonismi.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-dark"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Şifre
            </label>
            <Link href="/forgot-password" className="text-xs text-[#0066FF] hover:underline font-bold">
              Şifremi Unuttum
            </Link>
          </div>
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary-blue py-3.5 justify-center text-sm shadow-md rounded-2xl"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Giriş Yap"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 font-medium">
        Hesabınız yok mu?{" "}
        <Link href="/register" className="font-extrabold text-[#0066FF] hover:underline">
          1 Ay Ücretsiz Denemeyi Başlatın
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* Sol Panel: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 bg-white border-r border-slate-200/80">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>

      {/* Sağ Panel (NetVerim Corporate Gradient) */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0066FF] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#0066FF] rounded-full blur-[120px]" />
        </div>

        <Link href="/" className="inline-flex items-center relative z-10 justify-end gap-2">
          <span className="text-xl font-extrabold font-display tracking-tight text-white/90">
            Glow<span className="text-blue-400">Desk</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-md space-y-6 my-auto">
          <div className="space-y-4">
            <span className="px-3.5 py-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold rounded-full inline-block">
              💈 💄 🚗 🏋️ ⚖️ 🩺 12+ Sektör Tek Otomasyon
            </span>
            <h3 className="text-3xl font-extrabold font-display leading-tight text-white">
              Boş Kalan Saatleri %94 Oranında Kurtarın
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              &ldquo;No-show yüzünden her gün en az 2 randevumuz boş geçiyordu. GlowDesk&apos;in bekleme listesi motoru sayesinde boşalan saat 10 dakika içinde doluyor.&rdquo;
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 relative z-10 font-medium">
          © {new Date().getFullYear()} GlowDesk Platform. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
