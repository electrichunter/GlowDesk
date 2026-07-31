/**
 * GlowDesk — Input Güvenlik Katmanı
 * XSS, injection ve rate limiting korumaları
 */

// ── XSS Koruma: HTML Karakteri Kaçırma ────────────────────────────────────────
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\//g, "&#x2F;");
}

// ── Düz Metin Sanitizasyonu (form alanları için) ──────────────────────────────
export function sanitizeText(input: string, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "")            // HTML etiketlerini sil
    .replace(/javascript:/gi, "")    // JS protokolü
    .replace(/on\w+\s*=/gi, "");     // onerror= gibi event handler'ları
}

// ── E-posta Validasyonu ────────────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email) && email.length <= 254;
}

// ── Telefon Numarası Normalleştirme (TR format) ───────────────────────────────
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+9${digits}`;
  if (digits.length === 10) return `+90${digits}`;
  return phone.trim();
}

// ── Slug Üretimi (URL güvenli) ────────────────────────────────────────────────
export function toSlug(text: string): string {
  const map: Record<string, string> = {
    ğ: "g", ü: "u", ş: "s", ı: "i", ö: "o", ç: "c",
    Ğ: "G", Ü: "U", Ş: "S", İ: "I", Ö: "O", Ç: "C",
  };
  return text
    .replace(/[ğüşıöçĞÜŞİÖÇ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

// ── Şifre Güç Kontrolü ────────────────────────────────────────────────────────
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  suggestions: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 8)  score++; else suggestions.push("En az 8 karakter");
  if (/[A-Z]/.test(password)) score++; else suggestions.push("Büyük harf ekleyin");
  if (/[0-9]/.test(password)) score++; else suggestions.push("Rakam ekleyin");
  if (/[^A-Za-z0-9]/.test(password)) score++; else suggestions.push("Özel karakter ekleyin (!@#$)");

  const labels = ["Çok Zayıf", "Zayıf", "Orta", "Güçlü", "Çok Güçlü"];
  const colors = [
    "text-rose-600",
    "text-orange-500",
    "text-amber-500",
    "text-emerald-500",
    "text-emerald-600",
  ];

  return {
    score: score as 0 | 1 | 2 | 3 | 4,
    label: labels[score],
    color: colors[score],
    suggestions,
  };
}

// ── Basit Client-Side Rate Limiter ────────────────────────────────────────────
interface RateLimitStore {
  attempts: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60_000,
  lockMs = 300_000
): { allowed: boolean; remaining: number; retryAfterMs?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  // Kilitli mi?
  if (entry?.lockedUntil && now < entry.lockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.lockedUntil - now,
    };
  }

  // Pencere dışına çıktıysa sıfırla
  if (!entry || now - entry.firstAttempt > windowMs) {
    rateLimitMap.set(key, { attempts: 1, firstAttempt: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  entry.attempts += 1;

  if (entry.attempts > maxAttempts) {
    entry.lockedUntil = now + lockMs;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: lockMs,
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - entry.attempts,
  };
}

// ── CSRF Token Üretimi & Doğrulama ────────────────────────────────────────────
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getOrCreateCsrfToken(): string {
  if (typeof sessionStorage === "undefined") return "";
  let token = sessionStorage.getItem("gd_csrf");
  if (!token) {
    token = generateCsrfToken();
    sessionStorage.setItem("gd_csrf", token);
  }
  return token;
}

// ── Güvenli JSON Parse (SyntaxError önleyici) ──────────────────────────────────
export function safeJsonParse<T>(input: string | null | undefined, fallback: T): T {
  if (!input || typeof input !== "string" || input.trim() === "") {
    return fallback;
  }
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}

