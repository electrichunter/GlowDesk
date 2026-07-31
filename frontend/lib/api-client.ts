/**
 * GlowDesk — Merkezi FastAPI REST İstemcisi
 * FastAPI + MySQL backend sunucusuna bağlanan HTTP katmanı.
 */

import { getSessionCookie } from './session';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Oturum token'ını ekle
    const token = getSessionCookie();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = typeof window !== 'undefined' ? `/api${path}` : `${API_BASE}${path}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        data: null,
        error: body?.detail || body?.message || `HTTP ${res.status} Hatası`,
      };
    }

    return { data: body, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Sunucuya ulaşılamadı.',
    };
  }
}
