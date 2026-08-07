/**
 * GlowDesk — Şeffaf FastAPI REST İstemcisi & Entegrasyon Katmanı
 * Single Source of Truth: Core FastAPI Backend (/api)
 */

import { getSessionCookie } from './session';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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
    let url = typeof window !== 'undefined'
      ? `${API_BASE}${cleanEndpoint}`
      : `${process.env.BACKEND_INTERNAL_URL || 'http://localhost:8000/api'}${cleanEndpoint}`;

    let res: Response;
    try {
      res = await fetch(url, { ...options, headers });
    } catch (primaryErr) {
      // If primary fetch failed in browser on localhost:3000, attempt direct call to http://localhost:8000/api
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        const fallbackUrl = `http://${window.location.hostname}:8000/api${cleanEndpoint}`;
        res = await fetch(fallbackUrl, { ...options, headers });
      } else {
        throw primaryErr;
      }
    }

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
