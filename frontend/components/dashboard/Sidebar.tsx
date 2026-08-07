"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getCurrentSession,
  clearSessionCookie,
  getRoleLabel,
  getRoleBadgeColor,
  hasMinimumRole,
  type SessionPayload,
  type UserRole,
} from "@/lib/session";

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const IconHome = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconCalendar = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconUsers = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const IconSparkles = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const IconInbox = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0L12 17l-8-4" />
  </svg>
);
const IconSettings = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconCrown = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// ─── Menü Tanımları (Rütbe Hiyerarşisine Göre) ───────────────────────────────
interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  minRole: UserRole;
  tabKey?: string;
}

const SALON_MENU_ITEMS: MenuItem[] = [
  { href: "/dashboard",    label: "Bugün Kimler Var?", icon: <IconHome />,     minRole: "staff"  },
  { href: "/appointments", label: "Randevu Takvimi",   icon: <IconCalendar />, minRole: "staff"  },
  { href: "/waitlist",     label: "No-Show Motoru",    icon: <IconInbox />,    minRole: "staff"  },
  { href: "/customers",    label: "Müşteriler",         icon: <IconUsers />,    minRole: "owner"  },
  { href: "/services",     label: "Hizmetler",          icon: <IconSparkles />, minRole: "owner"  },
  { href: "/settings",     label: "Salon Ayarları",     icon: <IconSettings />, minRole: "owner"  },
];

const ADMIN_MENU_ITEMS: MenuItem[] = [
  { href: "/admin?tab=calls",     label: "📞 Biz Sizi Arayalım",        icon: <IconInbox />,    minRole: "admin", tabKey: "calls" },
  { href: "/admin?tab=tenants",   label: "🏪 Kayıtlı İşletmeler",        icon: <IconCrown />,    minRole: "admin", tabKey: "tenants" },
  { href: "/admin?tab=users",     label: "👥 Kullanıcı Yönetimi",       icon: <IconUsers />,    minRole: "admin", tabKey: "users" },
  { href: "/admin?tab=blog",      label: "📝 Blog Yönetimi (Tiptap)",   icon: <IconSparkles />, minRole: "admin", tabKey: "blog" },
  { href: "/admin?tab=financials",label: "💳 Ödeme & Abonelik Logları", icon: <IconSettings />, minRole: "admin", tabKey: "financials" },
  { href: "/admin?tab=templates", label: "📋 Global Hizmet Kataloğu",   icon: <IconSparkles />, minRole: "admin", tabKey: "templates" },
  { href: "/admin?tab=audit",     label: "🚨 Sistem Audit Logları",     icon: <IconInbox />,    minRole: "admin", tabKey: "audit" },
];

const CUSTOMER_MENU_ITEMS: MenuItem[] = [
  { href: "/my-appointments", label: "📋 Randevularım", icon: <IconCalendar />, minRole: "customer" },
  { href: "/profile", label: "⚙️ Profil Ayarlarım", icon: <IconSettings />, minRole: "customer" },
];

function getRoleAvatar(role?: UserRole): string {
  switch (role) {
    case "admin":    return "👑";
    case "owner":    return "💼";
    case "staff":    return "✂️";
    case "customer": return "👤";
    default:         return "🏢";
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<SessionPayload | null>(null);

  const currentTab = searchParams.get("tab") || "tenants";

  useEffect(() => {
    const session = getCurrentSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(session);
  }, []);

  const handleLogout = () => {
    clearSessionCookie();
    localStorage.removeItem("glowdesk_active_user");
    router.push("/login");
  };

  // ── Rütbeye ve Bürünme Moduna Göre Menü Belirleme ────────────────────────────
  const isCustomer = user?.role === "customer";
  const isSuperAdminStandalone = user?.role === "admin" && !user.impersonatingTenantId;

  const visibleMenuItems = isCustomer
    ? CUSTOMER_MENU_ITEMS
    : isSuperAdminStandalone
    ? ADMIN_MENU_ITEMS
    : SALON_MENU_ITEMS.filter((item) => hasMinimumRole(user, item.minRole));

  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  // Mobil alt barda gösterilecek ilk 4 ana menü elemanı
  const primaryMobileItems = visibleMenuItems.slice(0, 4);
  const secondaryMobileItems = visibleMenuItems.slice(4);

  return (
    <>
      {/* ── DESKTOP SIDEBAR (md:flex) ── */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col justify-between p-4 md:h-screen sticky top-0 shadow-sm">
        {/* Üst Alan */}
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center px-2 py-1">
            <span className="text-xl font-black text-[#1E1B4B] font-display tracking-tight">
              Glow<span className="text-cyan-500">Desk</span>
            </span>
          </Link>

          {/* Kullanıcı Rütbe ve Profil Bilgisi */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1E1B4B] text-cyan-400 font-extrabold text-xs flex items-center justify-center shadow-xs">
              {getRoleAvatar(user?.role)}
            </div>
            <div className="truncate flex-1">
              <span className="block text-xs font-bold text-[#1E1B4B] truncate">
                {user?.role === "admin" && !user.impersonatingTenantId
                  ? "GlowDesk Platform Admin"
                  : user?.businessName || user?.fullName || "Salon Paneli"}
              </span>
              <span className={`inline-block mt-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${getRoleBadgeColor(user?.role)}`}>
                {user?.impersonatingTenantId ? "🔍 Bürünme Modu" : getRoleLabel(user?.role)}
              </span>
            </div>
          </div>

          {/* Navigasyon Linkleri — sadece yetkili menüler gösterilir */}
          <nav className="space-y-1">
            {visibleMenuItems.map((item) => {
              const isActive = isSuperAdminStandalone
                ? pathname === "/admin" && item.tabKey === currentTab
                : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Alt Alan — Kullanıcı Bilgisi + Çıkış Yap */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          {user && (
            <div className="px-3 py-1.5">
              <p className="text-[10px] text-slate-400 font-medium truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 rounded-lg transition-colors text-left cursor-pointer"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Oturumu Kapat
          </button>
        </div>
      </aside>

      {/* ── MOBİL SABİT ALT NAVİGASYON ÇUBUĞU (Mobile Bottom Nav Bar) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around pb-safe shadow-lg">
        {primaryMobileItems.map((item) => {
          const isActive = isSuperAdminStandalone
            ? pathname === "/admin" && item.tabKey === currentTab
            : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMoreOpen(false)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-touch ${
                isActive
                  ? "text-[#0066FF] font-extrabold bg-blue-50/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div>
              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[68px]">
                {item.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}

        {/* Diğer / Menü Çekmecesi Butonu */}
        <button
          type="button"
          onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-touch ${
            mobileMoreOpen ? "text-[#0066FF] font-extrabold bg-blue-50/80" : "text-slate-500"
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Menü</span>
        </button>
      </div>

      {/* ── MOBİL DİĞER MENÜ ÇEKMECESİ (Mobile Off-Canvas Drawer) ── */}
      {mobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-t-3xl border-t border-slate-200 p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Çekmece Başlığı */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E1B4B] text-cyan-400 text-xs flex items-center justify-center font-bold">
                  {getRoleAvatar(user?.role)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {user?.businessName || user?.fullName || "Salon Paneli"}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Tüm Menü Öğeleri */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Tüm Seçenekler
              </div>
              {visibleMenuItems.map((item) => {
                const isActive = isSuperAdminStandalone
                  ? pathname === "/admin" && item.tabKey === currentTab
                  : pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMoreOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#0066FF] text-white shadow-md shadow-blue-500/20"
                        : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                    }`}
                  >
                    <div className="w-5 h-5">{item.icon}</div>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Çıkış Yap Butonu */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMoreOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 text-rose-600 font-bold text-xs rounded-2xl active:bg-rose-100 transition-colors"
              >
                🚪 Oturumu Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
