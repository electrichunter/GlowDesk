import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GlowDesk — Güzellik Salonları İçin Akıllı Randevu Sistemi",
    template: "%s | GlowDesk",
  },
  description:
    "GlowDesk ile güzellik salonunuzu ve spa merkezinizi dijitalleştirin. No-Show kurtarma motoru, akıllı bekleme listesi ve sıfır komisyon.",
  icons: {
    icon: "/glowdesklogo.ico",
  },
  keywords: [
    "randevu sistemi",
    "güzellik salonu",
    "cilt bakımı",
    "spa",
    "salon yazılımı",
    "online randevu",
    "güzellik merkezi",
    "glowdesk",
  ],
  authors: [{ name: "GlowDesk" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "GlowDesk",
    title: "GlowDesk — Güzellik Salonları İçin Akıllı Randevu Sistemi",
    description:
      "No-Show kurtarma motoru, akıllı bekleme listesi. Güzellik salonunuzun cirosunu artırın.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
