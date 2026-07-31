import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Route Grupları & Rütbe Gereksinimleri ─────────────────────────────────────
const ROUTE_RULES: Array<{
  pattern: RegExp;
  allowed: string[];
  redirect: string;
}> = [
  { pattern: /^\/admin(\/|$)/,        allowed: ["admin"],                    redirect: "/dashboard" },
  { pattern: /^\/settings(\/|$)/,     allowed: ["owner", "admin"],           redirect: "/dashboard" },
  { pattern: /^\/(dashboard|appointments|waitlist|customers|services)(\/|$)/, allowed: ["staff", "owner", "admin"], redirect: "/explore" },
  { pattern: /^\/(my-appointments|profile)(\/|$)/, allowed: ["customer", "staff", "owner", "admin"], redirect: "/login" },
];

function getSessionFromCookies(request: NextRequest): { role: string; exp: number } | null {
  const cookie = request.cookies.get("gd_session")?.value;
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
      raw = Buffer.from(token, "base64").toString("utf-8");
    }

    const payload = JSON.parse(raw) as { role: string; exp: number };
    if (!payload.exp || Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Statik / API / Görsel dosyaları atla
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js)$/)
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  const session = getSessionFromCookies(request);
  const isLoggedIn = session !== null;
  const userRole = session?.role ?? "guest";

  // 1. Auth sayfalarında (login/register) zaten giriş yapılmışsa tek seferlik doğru rotaya git
  if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && isLoggedIn) {
    const nextParam = request.nextUrl.searchParams.get("next");
    if (nextParam && !nextParam.startsWith("/login") && !nextParam.startsWith("/register")) {
      return NextResponse.redirect(new URL(nextParam, request.url));
    }

    const target = userRole === "admin" ? "/admin" :
                   userRole === "customer" ? "/my-appointments" : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. Korunan rotaların rütbe kontrolü
  for (const rule of ROUTE_RULES) {
    if (rule.pattern.test(pathname)) {
      if (!isLoggedIn) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
      if (!rule.allowed.includes(userRole)) {
        const fallbackTarget = userRole === "customer" ? "/my-appointments" : "/explore";
        return NextResponse.redirect(new URL(fallbackTarget, request.url));
      }
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  const h = response.headers;
  h.set("X-Frame-Options", "DENY");
  h.set("X-Content-Type-Options", "nosniff");
  h.set("X-XSS-Protection", "1; mode=block");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
