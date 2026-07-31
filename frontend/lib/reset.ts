// GlowDesk — System Data Sanitization & Pure Reset Utility

import { logger } from "@/lib/logger";

export function performPureSystemReset() {
  if (typeof window === "undefined") return;

  // 1. Tüm Esnaf, Müşteri, Randevu ve Hizmet Verilerini Sıfırla
  localStorage.removeItem("glowdesk_registered_tenants");
  localStorage.removeItem("glowdesk_customers");
  localStorage.removeItem("glowdesk_services");
  localStorage.removeItem("glowdesk_appointments");
  localStorage.removeItem("glowdesk_waitlist");
  localStorage.removeItem("glowdesk_payment_logs");
  localStorage.removeItem("glowdesk_blacklisted_phones");

  // 2. Kullanıcı Veritabanından Admin Olmayan Tüm Hesapları Temizle
  const rawUsers = localStorage.getItem("glowdesk_all_users");
  if (rawUsers) {
    try {
      const parsedUsers = JSON.parse(rawUsers);
      const adminOnlyUsers = parsedUsers.filter((u: any) => u.role === "admin");
      
      // Eğer hiç admin yoksa varsayılan Super Admin hesabını koru
      if (adminOnlyUsers.length === 0) {
        adminOnlyUsers.push({
          id: "admin-1",
          fullName: "Platform Super Admin",
          email: "admin@glowdesk.com",
          role: "admin",
          status: "active",
          createdAt: new Date().toISOString(),
        });
      }
      localStorage.setItem("glowdesk_all_users", JSON.stringify(adminOnlyUsers));
    } catch {
      localStorage.setItem("glowdesk_all_users", JSON.stringify([{
        id: "admin-1",
        fullName: "Platform Super Admin",
        email: "admin@glowdesk.com",
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString(),
      }]));
    }
  } else {
    localStorage.setItem("glowdesk_all_users", JSON.stringify([{
      id: "admin-1",
      fullName: "Platform Super Admin",
      email: "admin@glowdesk.com",
      role: "admin",
      status: "active",
      createdAt: new Date().toISOString(),
    }]));
  }

  logger.info("Platform tam sıfırlama uygulandı: Sadece Admin hesapları korundu, tüm sahte veriler silindi.", "SystemReset");
}
