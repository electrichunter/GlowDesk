// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — (dashboard)/layout.tsx
// Server Component olarak çalışır.
// Session cookie'den okunur → TenantProvider'a geçirilir.
// FastAPI REST backend uyumlu session ve tenant çözümleyici.
// ─────────────────────────────────────────────────────────────────────────────

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TenantProvider } from '@/contexts/TenantContext';
import DynamicSidebar from '@/components/dashboard/DynamicSidebar';
import DynamicOnboarding from '@/components/dashboard/DynamicOnboarding';
import PlanUpgradeModal from '@/components/dashboard/PlanUpgradeModal';
import type { Tenant } from '@/lib/types';

/** Cookie'den session payload'ını oku (JWT ve Base64 destekli) */
async function getServerSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('gd_session')?.value;
  if (!cookie) return null;
  try {
    const token = decodeURIComponent(cookie);
    let raw: string;
    if (token.includes('.')) {
      let payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payloadBase64.length % 4 !== 0) {
        payloadBase64 += '=';
      }
      raw = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    } else {
      raw = Buffer.from(token, 'base64').toString('utf-8');
    }
    const payload = JSON.parse(raw);
    if (!payload.exp || Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Tenant verisini FastAPI Backend'inden veya session'dan çöz */
async function getTenantById(tenantId: string, session: any): Promise<Tenant | null> {
  try {
    const apiBase = process.env.BACKEND_INTERNAL_URL || 'http://backend:8000/api';
    const res = await fetch(`${apiBase}/tenants/${tenantId}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      return data as Tenant;
    }
  } catch {
    // Fallback: Session'dan geçici tenant objesi üret
  }

  return {
    id: tenantId,
    name: session.businessName || session.fullName || 'İşletmem',
    slug: tenantId,
    sector: session.sector || 'beauty',
    phone: session.phone || '',
    city: 'İstanbul',
    district: 'Merkez',
    address: '',
    subscription_tier: 'pro',
    status: 'active',
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Tenant;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Session'ı server-side oku
  const session = await getServerSession();

  // 2. Oturum yoksa login'e yönlendir
  if (!session) {
    redirect('/login');
  }

  // 3. Tenant verisini çek (Admin için null olabilir)
  const tenant = session.tenantId
    ? await getTenantById(session.tenantId, session)
    : null;

  return (
    <TenantProvider tenant={tenant} session={session}>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#F1F5F9] text-[#334155]">
        {/* Sol Sidebar — sektöre duyarlı */}
        <DynamicSidebar />

        {/* Ana İçerik */}
        <main className="flex-1 flex flex-col p-6 md:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full relative">
          {children}
        </main>
      </div>

      {/* Sektöre Özel Onboarding Sihirbazı */}
      <DynamicOnboarding />

      {/* Plan Yükseltme Modalı */}
      <PlanUpgradeModal />
    </TenantProvider>
  );
}
