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
  const accentColor = config?.accentColor || 'cyan';

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

  const summaryText = triggerSummary || defaultSummaries[verticalKey] || defaultSummaries.salon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl border border-slate-700/50 my-6">
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Sabah Tetikleyicisi (Daily Huddle)
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            {config?.displayName || 'İşletme Komuta Merkezi'}
          </span>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {/* Main Trigger Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
          <span>{config?.icon || '⚡'}</span>
          <span>Günaydın! {tenantName} İçin Günün Kritik Özeti</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 backdrop-blur-sm">
          {summaryText}
        </p>
      </div>

      {/* Quick Action & Recalls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Bugün Beklenen</span>
            <span className="text-xl font-extrabold text-cyan-400">{kpi.totalToday} {config?.appointmentLabel || 'Randevu'}</span>
          </div>
          <svg className="h-8 w-8 text-cyan-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Tamamlanan</span>
            <span className="text-xl font-extrabold text-emerald-400">{kpi.completed} {config?.appointmentLabel || 'İşlem'}</span>
          </div>
          <svg className="h-8 w-8 text-emerald-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Acil Çağrı / Uyarı</span>
            <span className="text-xl font-extrabold text-amber-400">{kpi.pendingRecallsCount} Müşteri</span>
          </div>
          <svg className="h-8 w-8 text-amber-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

    </div>
  );
}
