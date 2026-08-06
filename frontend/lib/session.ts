/**
 * GlowDesk — Merkezi Session Yönetimi (FastAPI & JWT Token)
 *
 * Token Format: base64(JSON { role, fullName, email, tenantId, exp })
 */

export type UserRole = "admin" | "editor" | "owner" | "staff" | "customer";

export interface SessionPayload {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string;
  businessName?: string;
  tenantId?: string;
  sector?: string;
  isNewUser?: boolean;
  impersonatingTenantId?: string;
  impersonatingTenantName?: string;
  exp: number;          // Unix timestamp (saniye)
  iat: number;          // Issued At timestamp
}

const SESSION_COOKIE = "gd_session";
const SESSION_DURATION_HOURS = 24;

function safeBtoa(str: string): string {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  } catch {
    return btoa(str);
  }
}

function safeAtob(str: string): string {
  try {
    return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  } catch {
    return atob(str);
  }
}

// ── Token Üretimi ──────────────────────────────────────────────────────────────
export function createSession(data: Omit<SessionPayload, "exp" | "iat">): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    ...data,
    iat: now,
    exp: now + SESSION_DURATION_HOURS * 60 * 60,
  };

  return safeBtoa(JSON.stringify(payload));
}

// ── Token Çözümü ──────────────────────────────────────────────────────────────
export function parseSession(token: string): SessionPayload | null {
  try {
    let raw: string;
    if (token.includes('.')) {
      // JWT Token (header.payload.signature)
      let payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payloadBase64.length % 4 !== 0) {
        payloadBase64 += '=';
      }
      raw = safeAtob(payloadBase64);
    } else {
      raw = safeAtob(token);
    }

    const payload = JSON.parse(raw) as SessionPayload;

    // Süresi dolmuş mu?
    if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }

    // Zorunlu alanlar
    if (!payload.role || !payload.email) return null;

    return payload;
  } catch {
    return null;
  }
}

// ── Cookie Okuma (tarayıcı tarafı) ────────────────────────────────────────────
export function getSessionCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

// ── Cookie Yazma ──────────────────────────────────────────────────────────────
export function setSessionCookie(token: string): void {
  if (typeof document === "undefined") return;

  const maxAge = SESSION_DURATION_HOURS * 60 * 60;
  document.cookie = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    `max-age=${maxAge}`,
    `path=/`,
    `SameSite=Lax`,
    ...(typeof window !== "undefined" && window.location.protocol === "https:"
      ? ["Secure"]
      : []),
  ].join("; ");
}

// ── Cookie Silme ──────────────────────────────────────────────────────────────
export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; max-age=0; path=/; SameSite=Strict`;
}

// ── Mevcut Oturumu Oku ────────────────────────────────────────────────────────
export function getCurrentSession(): SessionPayload | null {
  const token = getSessionCookie();
  if (token) {
    const parsed = parseSession(token);
    if (parsed) return parsed;
  }

  // Fallback: cookie yoksa localStorage'dan oku ve cookie'yi tazele
  if (typeof window !== "undefined") {
    try {
      const activeUser = localStorage.getItem("glowdesk_active_user");
      if (activeUser) {
        const userObj = JSON.parse(activeUser);
        if (userObj && userObj.role && userObj.email) {
          const newToken = createSession(userObj);
          setSessionCookie(newToken);
          return parseSession(newToken);
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

// ── Rütbe Kontrolleri ─────────────────────────────────────────────────────────
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  editor: 80,
  owner: 50,
  staff: 25,
  customer: 10,
};

export function hasRole(user: SessionPayload | null, ...roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function hasMinimumRole(user: SessionPayload | null, minRole: UserRole): boolean {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole];
}

export function getRoleLabel(role?: UserRole): string {
  switch (role) {
    case "admin":    return "👑 Super Admin";
    case "editor":   return "✍️ Blog Editörü";
    case "owner":    return "💼 Salon Sahibi";
    case "staff":    return "✂️ Salon Personeli";
    case "customer": return "👤 Müşteri";
    default:         return "Ziyaretçi";
  }
}

export function getRoleBadgeColor(role?: UserRole): string {
  switch (role) {
    case "admin":    return "bg-rose-100 text-rose-800 border-rose-300";
    case "editor":   return "bg-purple-100 text-purple-800 border-purple-300";
    case "owner":    return "bg-indigo-100 text-indigo-900 border-indigo-200";
    case "staff":    return "bg-cyan-100 text-cyan-900 border-cyan-200";
    case "customer": return "bg-slate-100 text-slate-700 border-slate-200";
    default:         return "bg-slate-100 text-slate-600 border-slate-200";
  }
}
