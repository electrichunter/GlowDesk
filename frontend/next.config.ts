import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── HTTP Güvenlik Başlıkları ─────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Clickjacking Koruması
          { key: "X-Frame-Options", value: "DENY" },
          // MIME Sniffing Koruması
          { key: "X-Content-Type-Options", value: "nosniff" },
          // XSS Koruması (eski tarayıcılar için)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Referrer Gizliliği
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HTTPS Zorlaması (üretim ortamı için)
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // İzin Politikası
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js runtime için unsafe-inline gerekli (üretimde nonce tabanlı CSP geçilebilir)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' http: https:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // ── Görüntü Optimizasyonu ─────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    dangerouslyAllowSVG: false,
  },

  // ── API & Storage Proxy Rewrites ──────────────────────────────────────────────
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.BACKEND_INTERNAL_URL || "http://backend:8000/api/:path*",
      },
      {
        source: "/storage/:path*",
        destination: process.env.MINIO_INTERNAL_URL || "http://minio:9000/:path*",
      },
    ];
  },

  // ── Çıktı & Derleme ───────────────────────────────────────────────────────────
  output: "standalone",
  poweredByHeader: false,          // X-Powered-By: Next.js başlığını gizle
  reactStrictMode: true,
  compress: true,
};

export default nextConfig;
