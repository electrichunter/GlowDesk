/**
 * GlowDesk — Şeffaf FastAPI v1 REST İstemcisi & Entegrasyon Katmanı
 * Single Source of Truth: Core MySQL + FastAPI Backend (/api/v1)
 */

import { getSessionCookie } from './session';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Oturum Bearer JWT Token ekleme
    const token = getSessionCookie();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = typeof window !== 'undefined'
      ? `${API_BASE}${cleanEndpoint}`
      : `${process.env.BACKEND_INTERNAL_URL || 'http://localhost:8000/api/v1'}${cleanEndpoint}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage = body?.message || body?.detail || `Sunucu hatası: HTTP ${res.status}`;
      return {
        data: null,
        error: errorMessage,
        status: res.status,
      };
    }

    return {
      data: body as T,
      error: null,
      status: res.status,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Bağlantı kurulamadı. Lütfen ağ erişiminizi kontrol edin.',
      status: 500,
    };
  }
}

// Tahsilat & Ödeme Geçidi Çağrıları
export async function processPayment(paymentPayload: {
  invoice_id: string;
  amount: number;
  currency?: string;
  card_holder: string;
  card_number: string;
  expire_month: string;
  expire_year: string;
  cvv: string;
  idempotency_key?: string;
}) {
  return apiRequest('/payments/process', {
    method: 'POST',
    body: JSON.stringify(paymentPayload),
  });
}
