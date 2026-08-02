'use client';

import React from 'react';
import type { VerticalKey } from '@/lib/verticals/types';
import { getVerticalConfig } from '@/lib/verticals/config';


interface DailyHuddleProps {
  verticalKey: VerticalKey;
  tenantName?: string;
  triggerSummary?: string;
  kpi?: {
    totalToday: number;
    scheduled: number;
    completed: number;
    pendingRecallsCount: number;
  };
  pendingRecalls?: Array<{
    customerName: string;
    customerPhone: string;
    recallReason: string;
    suggestedService: string;
  }>;
}

export function DailyHuddle({
  verticalKey,
  tenantName = 'İşletmeniz',
  triggerSummary,
  kpi = { totalToday: 8, scheduled: 6, completed: 2, pendingRecallsCount: 3 },
  pendingRecalls = [],
}: DailyHuddleProps) {
  const config = getVerticalConfig(verticalKey);
  const [liveSummary, setLiveSummary] = React.useState<string | null>(null);
  const [loadingLive, setLoadingLive] = React.useState<boolean>(false);
  const [actionDone, setActionDone] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchDailyHuddle() {
      try {
        setLoadingLive(true);
        const { apiRequest } = await import('@/lib/api-client');
        const res = await apiRequest<any>(`/dashboard/daily-huddle?tenant_id=demo-clinic`);
        if (res && res.data && res.data.trigger_summary) {
          setLiveSummary(res.data.trigger_summary);
        }
      } catch (err) {
        // Fallback to static summary
      } finally {
        setLoadingLive(false);
      }
    }
    fetchDailyHuddle();
  }, []);

  const defaultSummaries: Record<string, string> = {
    salon: 'Bugün 12 randevu var. 2 uzmanın doluluğu %90\'ın üzerinde. Stokta boya tüpleri kritik seviyede.',
    clinic: 'Lab teslimatı tamamlanan 2 protez hazır. Bugün 14:00\'te yüksek bütçeli implant muayenesi var.',
    auto: 'Lift 2\'deki araç 14:00 randevusu öncesi çıkmalı. Tedarikçiden beklenen balata teslimata yaklaştı.',
    fitness: '09:30 Reformer Pilates dersinde 2 kişi waitlist\'te. Katılımcı 3 üyenin kredisi bitmek üzere.',
    vet: 'Bugün 3 agresif etiketli pet randevusu var (Max, Buddy, Karabaş). Kuduz aşısı gecikmiş 2 hasta uyarısı.',
    coaching: 'Elif Hanım dün gece ödevini yükledi (beklemede). Bugün 4 seansın 2\'si online video konferans.',
    legal: 'Bugün 2 duruşma var. 14:00\'teki duruşma öncesi müvekkil avansı sıfırlanmış! Otomatik link gönderildi.',
    photo: 'Ahmet-Yasemin düğün çekim brief\'inde gün batımı pozu istenmiş. Kurgudaki 1 albüm teslimi gecikti.',
    spa: 'VIP Suit 10:00 - 12:00 arası dolu. Doğum günü olan 1 misafir için özel karşılama uyarısı.',
    coworking: 'A Blok 4. kat resepsiyonu 10:00 misafirleri için bilgilendirildi. 20 kişilik ikram siparişi hazır.',
    driving: 'Bugün 18 direksiyon dersi var. Sınavı yaklaşan 4 adayın yasal 14 ders saati kontrol edildi.',
    restoran: 'Bu akşam 8 masa rezervasyonu var. VIP masada doğum günü kutlaması bulunuyor.',
  };

  const summaryText = liveSummary || triggerSummary || defaultSummaries[verticalKey] || defaultSummaries.clinic;

  const handleQuickAction = (actionName: string) => {
    setActionDone(actionName);
    setTimeout(() => setActionDone(null), 3000);
  };

  return (
    <section 
      aria-label="Sabah Tetikleyicisi ve Komuta Merkezi"
      className="relative overflow-hidden rounded-2xl bg-slate-900/90 text-white shadow-2xl border border-slate-800 p-6 my-6 transition-all duration-300 hover:border-slate-700"
    >
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30 tracking-wide">
            <svg className="h-3.5 w-3.5 text-amber-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Sabah Tetikleyicisi (Daily Huddle)
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            {config?.displayName || 'Klinik & İşletme Komuta Merkezi'}
          </span>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50">
          <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {/* Main Trigger Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2 tracking-tight">
          <span>{config?.icon || '🩺'}</span>
          <span>Günaydın! {tenantName} İçin Günün Akıllı Özeti</span>
        </h2>
        <div className="relative text-sm text-slate-200 leading-relaxed bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 backdrop-blur-md shadow-inner">
          {loadingLive ? (
            <div className="flex items-center gap-2 text-slate-400 animate-pulse">
              <svg className="animate-spin h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Günün akıllı komuta özeti yükleniyor...</span>
            </div>
          ) : (
            <p className="font-normal text-slate-200">{summaryText}</p>
          )}
        </div>
      </div>

      {/* Quick Action & Recalls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Bugün Beklenen</span>
            <span className="text-xl font-extrabold text-cyan-400 tracking-tight">{kpi.totalToday} {config?.appointmentLabel || 'Randevu'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Tamamlanan</span>
            <span className="text-xl font-extrabold text-emerald-400 tracking-tight">{kpi.completed} {config?.appointmentLabel || 'İşlem'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Acil Çağrı / Uyarı</span>
            <span className="text-xl font-extrabold text-amber-400 tracking-tight">{kpi.pendingRecallsCount} Müşteri</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Interactive Action Toolbar (AGENTS.md A11y & 44px min touch target) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuickAction('Hatırlatma SMS Gönderildi')}
            aria-label="Bugünkü hastalara toplu hatırlatma WhatsApp/SMS gönder"
            className="min-h-[44px] px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Toplu WhatsApp/SMS Gönder</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Kaynak Rezervasyonu Açıldı')}
            aria-label="Atomik Kaynak Orkestratörünü Aç"
            className="min-h-[44px] px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Kaynak Bağla (Orchestrator)</span>
          </button>
        </div>

        {actionDone && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-bounce">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {actionDone}
          </span>
        )}
      </div>
    </section>
  );
}

