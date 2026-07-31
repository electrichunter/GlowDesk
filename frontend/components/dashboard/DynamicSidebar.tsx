"use client";

// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — DynamicSidebar
// Sektöre (vertical) göre dinamik menü render eder.
// TenantContext'ten menü listesini alır — hardcoded SALON_MENU_ITEMS yok.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useTenant } from '@/contexts/TenantContext';
import { clearSessionCookie, hasMinimumRole, getRoleLabel, getRoleBadgeColor } from '@/lib/session';
import {
  VERTICAL_MENU_ITEMS,
  ADMIN_MENU_ITEMS,
  CUSTOMER_MENU_ITEMS,
} from '@/lib/verticals/menu-items';
import type { MenuItem } from '@/lib/verticals/types';

// ─── Inline SVG İkon Haritası ─────────────────────────────────────────────────
// String key → JSX dönüşümü (config dosyasında JSX import yapmaktan kaçınmak için)

const ICON_MAP: Record<string, React.ReactNode> = {
  IconHome: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  IconCalendar: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  IconUsers: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  IconSparkles: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  IconInbox: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0L12 17l-8-4" />
    </svg>
  ),
  IconSettings: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  IconCrown: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  IconFolder: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
  IconCreditCard: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  IconGrid: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  IconLayout: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
};

function getIcon(key: string): React.ReactNode {
  return ICON_MAP[key] ?? <span className="w-4 h-4" />;
}

function getRoleAvatar(role?: string): string {
  switch (role) {
    case 'admin':    return '👑';
    case 'owner':    return '💼';
    case 'staff':    return '✂️';
    case 'customer': return '👤';
    default:         return '🏢';
  }
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export default function DynamicSidebar() {
  const { session, vertical, verticalConfig, activePlan, planConfig, openUpgradeModal } = useTenant();
  const pathname = usePathname();
  const router   = useRouter();
  const searchParams = useSearchParams();
  const currentTab   = searchParams.get('tab') || 'tenants';

  const handleLogout = () => {
    clearSessionCookie();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('glowdesk_active_user');
    }
    router.push('/login');
  };

  // ── Rol bazlı menü seçimi ────────────────────────────────────────────────
  const isCustomer             = session?.role === 'customer';
  const isSuperAdminStandalone = session?.role === 'admin' && !session.impersonatingTenantId;

  let visibleMenuItems: MenuItem[];

  if (isCustomer) {
    visibleMenuItems = CUSTOMER_MENU_ITEMS;
  } else if (isSuperAdminStandalone) {
    visibleMenuItems = ADMIN_MENU_ITEMS;
  } else {
    // Sektöre ait menü — minimum role filtresi
    visibleMenuItems = (VERTICAL_MENU_ITEMS[vertical] ?? VERTICAL_MENU_ITEMS.salon)
      .filter((item) => hasMinimumRole(session, item.minRole));
  }

  // ── Aktif link belirleme ─────────────────────────────────────────────────
  const isActive = (item: MenuItem) => {
    if (isSuperAdminStandalone) {
      return pathname === '/admin' && item.tabKey === currentTab;
    }
    return pathname === item.href;
  };

  // ── Sektör renk aksanı ───────────────────────────────────────────────────
  const accentClass = {
    cyan:   'text-cyan-500',
    violet: 'text-violet-500',
    amber:  'text-amber-500',
  }[verticalConfig?.accentColor ?? 'cyan'];

  return (
    <aside className="w-full md:w-[270px] bg-white border-r border-slate-200/90 flex flex-col justify-between p-5 md:h-screen sticky top-0 shadow-layered z-30 shrink-0">

      {/* Üst Alan */}
      <div className="space-y-5">
        {/* Brand Logo & Sector Tag */}
        <Link href="/" className="inline-flex items-center gap-2 px-1 py-1 group">
          <span className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">
            Glow<span className={accentClass}>Desk</span>
          </span>
          {isSuperAdminStandalone ? (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
              <span>👑</span>
              <span>Platform</span>
            </span>
          ) : (
            verticalConfig && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                <span>{verticalConfig.icon}</span>
                <span>{verticalConfig.label}</span>
              </span>
            )
          )}
        </Link>

        {/* Kullanıcı / İşletme Bilgisi & Aktif Plan Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0066FF] text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
              {getRoleAvatar(session?.role)}
            </div>
            <div className="truncate flex-1">
              <span className="block text-xs font-extrabold text-slate-900 truncate font-display">
                {isSuperAdminStandalone
                  ? 'GlowDesk Platform Admin'
                  : session?.businessName || session?.fullName || verticalConfig?.displayName || 'Panel'}
              </span>
              <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getRoleBadgeColor(session?.role)}`}>
                {session?.impersonatingTenantId ? '🔍 Bürünme Modu' : getRoleLabel(session?.role)}
              </span>
            </div>
          </div>

          {/* Aktif Abonelik Planı Rozeti (Tıklanabilir) */}
          {!isSuperAdminStandalone && !isCustomer && (
            <button
              onClick={() => openUpgradeModal()}
              className="w-full p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-all flex items-center justify-between group text-left shadow-2xs"
            >
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${planConfig.badgeClass}`}>
                  {planConfig.badgeLabel}
                </span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 group-hover:underline flex items-center gap-0.5">
                <span>Yükselt</span>
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          )}
        </div>

        {/* Navigasyon Linkleri */}
        <nav className="space-y-1">
          {visibleMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                isActive(item)
                  ? 'bg-[#0066FF] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <span className={`w-5 h-5 flex items-center justify-center ${isActive(item) ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {getIcon(item.iconKey)}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Alt Alan — Pro Yükseltme Uyarısı + E-posta + Çıkış */}
      <div className="pt-3 border-t border-slate-200/80 space-y-2">
        {!isSuperAdminStandalone && !isCustomer && activePlan === 'free' && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-2 shadow-md">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
              <span>⚡</span>
              <span>Pro Plana Geçin</span>
            </div>
            <p className="text-[10px] text-slate-300 font-medium">
              Otomatik SMS, 3 şube desteği ve veri aktarımını hemen kullanmaya başlayın.
            </p>
            <button
              onClick={() => openUpgradeModal('Pro Özellikleri')}
              className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] shadow-sm transition-colors"
            >
              Pro'ya Yükselt
            </button>
          </div>
        )}

        {session && (
          <div className="px-2">
            <p className="text-[11px] text-slate-400 font-bold truncate">{session.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-extrabold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-left"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Oturumu Kapat
        </button>
      </div>
    </aside>
  );
}
