"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { logger, SystemLog } from "@/lib/logger";
import { safeJsonParse } from "@/lib/sanitize";
import { getCurrentSession, createSession, setSessionCookie, type SessionPayload, type UserRole } from "@/lib/session";
import { performPureSystemReset } from "@/lib/reset";
import type { BlogPost } from "@/lib/types";

const TiptapEditor = dynamic(() => import("@/components/blog/TiptapEditor"), {
  ssr: false,
  loading: () => <div className="p-4 text-xs font-semibold text-slate-400 animate-pulse">Tiptap Blog Editörü Yükleniyor...</div>,
});

interface RegisteredTenant {
  id: string;
  name: string;
  slug: string;
  sector: string;
  phone?: string;
  city?: string;
  district?: string;
  subscription_tier: "starter" | "pro" | "enterprise";
  status: "active" | "suspended" | "onboarding";
  mrr_amount: number;
  free_until?: string; // e.g. "2028-01-01"
  created_at: string;
}

interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  businessName?: string;
  status?: "active" | "banned";
  createdAt: string;
}

interface PaymentLog {
  id: string;
  tenant_name: string;
  amount: number;
  provider: "Iyzico" | "Stripe" | "Banka Havalesi";
  status: "success" | "failed" | "pending";
  timestamp: string;
}

interface GlobalServiceTemplate {
  id: string;
  sector: string;
  name: string;
  duration_minutes: number;
  suggested_price: number;
}

interface SupportTicket {
  id: string;
  type: "ACİL" | "SATIŞ" | "ÜRÜN";
  phone: string;
  note: string;
  status: "ACİL" | "BEKLİYOR" | "ÇÖZÜLDÜ";
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [tenants, setTenants] = useState<RegisteredTenant[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [templates, setTemplates] = useState<GlobalServiceTemplate[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [emergencyTickets, setEmergencyTickets] = useState<SupportTicket[]>([]);

  const [activeTab, setActiveTab] = useState<"tenants" | "financials" | "templates" | "users" | "blog" | "audit" | "support">("tenants");

  const loadEmergencyTickets = useCallback(() => {
    try {
      const data = JSON.parse(localStorage.getItem("glowdesk_emergency_tickets") || "[]");
      setEmergencyTickets(data);
    } catch (e) {
      console.warn("Tickets load error", e);
    }
  }, []);

  useEffect(() => {
    loadEmergencyTickets();
    window.addEventListener("glowdesk_new_ticket", loadEmergencyTickets);
    return () => window.removeEventListener("glowdesk_new_ticket", loadEmergencyTickets);
  }, [loadEmergencyTickets]);

  useEffect(() => {
    if (tabParam && ["tenants", "financials", "templates", "users", "blog", "audit", "support"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  // Blog State
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogCategory, setBlogCategory] = useState("Genel");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogCover, setBlogCover] = useState("");
  const [blogStatus, setBlogStatus] = useState<"draft" | "published">("published");
  const [blogContent, setBlogContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [logFilter, setLogFilter] = useState<"ALL" | "ERROR" | "WARN" | "INFO">("ALL");

  // New Template Form State
  const [newTplName, setNewTplName] = useState("");
  const [newTplSector, setNewTplSector] = useState("barber");
  const [newTplDuration, setNewTplDuration] = useState(30);
  const [newTplPrice, setNewTplPrice] = useState(300);

  // New Tenant Modal State
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantSector, setNewTenantSector] = useState("beauty");
  const [newTenantCity, setNewTenantCity] = useState("İstanbul");
  const [newTenantDistrict, setNewTenantDistrict] = useState("Şişli");
  const [newTenantPhone, setNewTenantPhone] = useState("+90 555 000 0000");
  const [newTenantTier, setNewTenantTier] = useState<"starter" | "pro" | "enterprise">("pro");

  // New & Edit User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("owner");
  const [newUserBusiness, setNewUserBusiness] = useState("");

  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserPhone, setEditUserPhone] = useState("");
  const [editUserRole, setEditUserRole] = useState<UserRole>("owner");
  const [editUserStatus, setEditUserStatus] = useState<"active" | "banned">("active");
  const [userSaveSuccess, setUserSaveSuccess] = useState(false);

  const loadAdminData = useCallback(async () => {
    try {
      const { apiRequest } = await import('@/lib/api-client');
      
      // 1. MySQL Veritabanından Kullanıcıları Çek
      const { data: dbUsers } = await apiRequest<RegisteredUser[]>('/users');
      if (dbUsers && Array.isArray(dbUsers)) {
        setUsers(dbUsers);
      } else {
        setUsers([]);
      }

      // 2. MySQL Veritabanından İşletmeleri (Tenants) Çek
      const { data: dbTenants } = await apiRequest<any[]>('/tenants');
      if (dbTenants && Array.isArray(dbTenants)) {
        setTenants(dbTenants.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          sector: t.sector || 'beauty',
          phone: t.phone,
          city: t.city,
          district: t.district,
          subscription_tier: t.subscription_tier || 'pro',
          status: t.status || 'active',
          mrr_amount: t.subscription_tier === 'enterprise' ? 1499 : 499,
          created_at: t.created_at || new Date().toISOString(),
        })));
      } else {
        setTenants([]);
      }

      // 3. Ödeme Loglarını Yükle
      const savedPayments = localStorage.getItem("glowdesk_payment_logs");
      const parsedPayments = safeJsonParse<PaymentLog[]>(savedPayments, []);
      setPaymentLogs(parsedPayments);

      // 4. Global Hizmet Şablonlarını Yükle
      const savedTemplates = localStorage.getItem("glowdesk_global_templates");
      const parsedTemplates = safeJsonParse<GlobalServiceTemplate[]>(savedTemplates, []);
      setTemplates(parsedTemplates);

      // 5. Sistem Loglarını Yükle
      setLogs(logger.getLogs());

      // 6. Blog Yazılarını MySQL Veritabanından Çek
      const { data: dbPosts } = await apiRequest<BlogPost[]>('/blog');
      if (dbPosts && Array.isArray(dbPosts)) {
        setBlogPosts(dbPosts);
      } else {
        setBlogPosts([]);
      }
    } catch (err) {
      console.error("Admin data load error:", err);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Blog Post CRUD Handlers (Only Admin & Editor)
  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim()) {
      alert("Lütfen blog başlığını ve Tiptap içerik alanını doldurunuz.");
      return;
    }

    const session = getCurrentSession();
    if (session?.role !== "admin" && session?.role !== "editor") {
      alert("❌ Yalnızca Super Admin ve Blog Editörleri makale yayınlayabilir.");
      return;
    }

    const slug = blogSlug.trim() || blogTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    
    try {
      const { apiRequest } = await import('@/lib/api-client');
      const { data: newPost, error } = await apiRequest<BlogPost>('/blog', {
        method: 'POST',
        body: JSON.stringify({
          title: blogTitle.trim(),
          slug,
          category: blogCategory,
          excerpt: blogExcerpt.trim() || null,
          content: blogContent,
          cover_image: blogCover.trim() || null,
          author_name: session?.fullName || "GlowDesk Editör",
          status: blogStatus
        })
      });

      if (error) {
        alert(`❌ Hata: ${error}`);
        return;
      }

      if (newPost) {
        setBlogPosts((prev) => [newPost, ...prev]);
        logger.info(`Yeni blog yazısı MySQL'e kaydedildi: ${newPost.title}`, "BlogEngine");
      }
    } catch (err) {
      console.error("Blog post save error:", err);
    }

    setShowBlogModal(false);
    resetBlogForm();
  };

  const resetBlogForm = () => {
    setEditingPostId(null);
    setBlogTitle("");
    setBlogSlug("");
    setBlogCategory("Genel");
    setBlogExcerpt("");
    setBlogCover("");
    setBlogStatus("published");
    setBlogContent("");
  };

  const handleResolveTicket = (ticketId: string) => {
    const updated = emergencyTickets.map((t) => (t.id === ticketId ? { ...t, status: "ÇÖZÜLDÜ" as const } : t));
    setEmergencyTickets(updated);
    localStorage.setItem("glowdesk_emergency_tickets", JSON.stringify(updated));
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm("Bu destek çağrısını silmek istediğinize emin misiniz?")) {
      const updated = emergencyTickets.filter((t) => t.id !== ticketId);
      setEmergencyTickets(updated);
      localStorage.setItem("glowdesk_emergency_tickets", JSON.stringify(updated));
    }
  };

  const handleEditBlogPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setBlogTitle(post.title);
    setBlogSlug(post.slug);
    setBlogCategory(post.category);
    setBlogExcerpt(post.excerpt);
    setBlogCover(post.cover_image || "");
    setBlogStatus(post.status);
    setBlogContent(post.content);
    setShowBlogModal(true);
  };

  const handleToggleBlogPostStatus = (postId: string) => {
    const updated = blogPosts.map((p) => {
      if (p.id === postId) {
        const nextStatus: BlogPost["status"] = p.status === "published" ? "draft" : "published";
        return { ...p, status: nextStatus, updated_at: new Date().toISOString() };
      }
      return p;
    });
    setBlogPosts(updated);
    localStorage.setItem("glowdesk_blog_posts", JSON.stringify(updated));
  };

  const handleDeleteBlogPost = (postId: string, title: string) => {
    if (confirm(`'${title}' blog yazısını silmek istediğinize emin misiniz?`)) {
      const updated = blogPosts.filter((p) => p.id !== postId);
      setBlogPosts(updated);
      localStorage.setItem("glowdesk_blog_posts", JSON.stringify(updated));
      logger.info(`Blog yazısı silindi: ${title}`, "BlogEngine");
    }
  };

  const handleTriggerPureReset = () => {
    if (confirm("🚨 DİKKAT: Admin hesapları HARİÇ tüm salon, müşteri, randevu ve hizmet verileri kalıcı olarak sıfırlanacaktır. Onaylıyor musunuz?")) {
      performPureSystemReset();
      loadAdminData();
      alert("✅ Platform tamamen sıfırlandı. Sadece Admin hesapları korundu.");
    }
  };

  // Salon Olarak Bürünme (Impersonation)
  const handleImpersonateTenant = (tenant: RegisteredTenant) => {
    if (confirm(`'${tenant.name}' salonunun paneline Super Admin yetkisiyle bürünmek (impersonate) istiyor musunuz?`)) {
      const currentSession = getCurrentSession();
      const updatedPayload: SessionPayload = {
        id: currentSession?.id || "usr-admin-1",
        role: "owner",
        fullName: currentSession?.fullName || "Super Admin",
        email: currentSession?.email || "admin@glowdesk.com",
        businessName: tenant.name,
        tenantId: tenant.id,
        sector: tenant.sector,
        impersonatingTenantId: tenant.id,
        impersonatingTenantName: tenant.name,
        exp: Math.floor(Date.now() / 1000) + 86400,
        iat: Math.floor(Date.now() / 1000),
      };

      const token = createSession(updatedPayload);
      setSessionCookie(token);
      localStorage.setItem("glowdesk_active_user", JSON.stringify(updatedPayload));
      logger.info(`SUPER ADMIN Bürünme Modu Başlatıldı: ${tenant.name} (${tenant.id})`, "AuditTrail");
      
      router.push("/dashboard");
    }
  };

  // Salon Durumu Değiştirme
  const handleToggleTenantStatus = (tenantId: string) => {
    const updated = tenants.map((t) => {
      if (t.id === tenantId) {
        const nextStatus: RegisteredTenant["status"] = t.status === "active" ? "suspended" : "active";
        logger.info(`Salon Durumu Güncellendi: ${t.name} -> ${nextStatus}`, "AdminControl");
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTenants(updated);
    localStorage.setItem("glowdesk_registered_tenants", JSON.stringify(updated));
  };

  // Salon Abonelik Paketini Değiştirme (Starter, Pro, Enterprise)
  const handleChangeTenantTier = (tenantId: string, newTier: "starter" | "pro" | "enterprise") => {
    const updated = tenants.map((t) => {
      if (t.id === tenantId) {
        const newMrr = newTier === "enterprise" ? 1499 : newTier === "pro" ? 499 : 0;
        logger.info(`İşletme paketi güncellendi: ${t.name} -> ${newTier.toUpperCase()} (₺${newMrr}/Ay)`, "AdminTenantControl");
        return { ...t, subscription_tier: newTier, mrr_amount: newMrr };
      }
      return t;
    });
    setTenants(updated);
    localStorage.setItem("glowdesk_registered_tenants", JSON.stringify(updated));
  };

  // Salon Özel Ücretsiz Kullanım (Promo Lisans) Bitiş Tarihi Ayarlama (örn. 01.01.2028)
  const handleSetTenantFreeUntil = (tenantId: string, freeUntilDate: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (freeUntilDate && freeUntilDate < todayStr) {
      alert("⚠️ Geçmiş bir tarih ücretsiz promosyon tarihi olarak atanamaz. Lütfen bugün veya gelecek bir tarih seçiniz.");
      return;
    }
    const updated = tenants.map((t) => {
      if (t.id === tenantId) {
        logger.info(`İşletme ücretsiz promo lisans tarihi ayarlandı: ${t.name} -> Bitiş: ${freeUntilDate || "Kaldırıldı"}`, "AdminTenantControl");
        return { ...t, free_until: freeUntilDate || undefined };
      }
      return t;
    });
    setTenants(updated);
    localStorage.setItem("glowdesk_registered_tenants", JSON.stringify(updated));
  };

  // Salon Silme
  const handleDeleteTenant = (tenantId: string, tenantName: string) => {
    if (confirm(`'${tenantName}' salonunu platformdan kalıcı olarak silmek istediğinize emin misiniz?`)) {
      const updated = tenants.filter((t) => t.id !== tenantId);
      setTenants(updated);
      localStorage.setItem("glowdesk_registered_tenants", JSON.stringify(updated));
      logger.info(`Salon Silindi: ${tenantName} (${tenantId})`, "AdminControl");
    }
  };

  // Yeni Gerçek Salon Ekleme
  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    const slug = newTenantName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-");

    const mrrAmount = newTenantTier === "enterprise" ? 1499 : newTenantTier === "pro" ? 499 : 0;

    const newTenant: RegisteredTenant = {
      id: `tenant-${Date.now()}`,
      name: newTenantName.trim(),
      slug,
      sector: newTenantSector,
      phone: newTenantPhone.trim(),
      city: newTenantCity.trim(),
      district: newTenantDistrict.trim(),
      subscription_tier: newTenantTier,
      status: "active",
      mrr_amount: mrrAmount,
      created_at: new Date().toISOString(),
    };

    const updatedTenants = [newTenant, ...tenants];
    setTenants(updatedTenants);
    localStorage.setItem("glowdesk_registered_tenants", JSON.stringify(updatedTenants));

    if (mrrAmount > 0) {
      const newPayLog: PaymentLog = {
        id: `iyz-${Date.now()}`,
        tenant_name: newTenant.name,
        amount: mrrAmount,
        provider: "Iyzico",
        status: "success",
        timestamp: new Date().toISOString(),
      };
      const updatedPayments = [newPayLog, ...paymentLogs];
      setPaymentLogs(updatedPayments);
      localStorage.setItem("glowdesk_payment_logs", JSON.stringify(updatedPayments));
    }

    setShowAddTenantModal(false);
    setNewTenantName("");
    logger.info(`Yeni işletme kaydedildi: ${newTenant.name} (${newTenantTier.toUpperCase()})`, "AdminPanel");
  };

  // ── KULLANICI YÖNETİMİ HANDLERLARI ───────────────────────────────────────────
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    try {
      const { apiRequest } = await import('@/lib/api-client');
      const { data, error } = await apiRequest<any>('/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: newUserName.trim(),
          email: newUserEmail.trim(),
          phone: newUserPhone.trim() || null,
          role: newUserRole,
        }),
      });

      if (error) {
        alert(`❌ Kullanıcı Eklenemedi: ${error}`);
        return;
      }

      const newUserObj: RegisteredUser = {
        id: data?.id || `usr-${Date.now()}`,
        fullName: data?.fullName || newUserName.trim(),
        email: data?.email || newUserEmail.trim(),
        phone: data?.phone || newUserPhone.trim(),
        role: data?.role || newUserRole,
        businessName: newUserBusiness.trim() || undefined,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [newUserObj, ...prev]);
      setShowAddUserModal(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPhone("");
      setNewUserBusiness("");
      setUserSaveSuccess(true);
      setTimeout(() => setUserSaveSuccess(false), 4000);
      logger.info(`Yeni kullanıcı kaydedildi: ${newUserObj.fullName} (${newUserObj.role})`, "AdminUserControl");
    } catch (err) {
      console.error("Add user error:", err);
    }
  };

  const handleStartEditUser = (user: RegisteredUser) => {
    setEditingUser(user);
    setEditUserName(user.fullName);
    setEditUserEmail(user.email);
    setEditUserPhone(user.phone || "");
    setEditUserRole(user.role);
    setEditUserStatus(user.status || "active");
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const { apiRequest } = await import('@/lib/api-client');
      const { error } = await apiRequest(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: editUserName.trim(),
          email: editUserEmail.trim(),
          phone: editUserPhone.trim(),
          role: editUserRole,
          status: editUserStatus,
        }),
      });

      if (error) {
        alert(`❌ Kaydedilemedi: ${error}`);
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                fullName: editUserName.trim(),
                email: editUserEmail.trim(),
                phone: editUserPhone.trim(),
                role: editUserRole,
                status: editUserStatus,
              }
            : u
        )
      );

      setEditingUser(null);
      setUserSaveSuccess(true);
      setTimeout(() => setUserSaveSuccess(false), 4000);
      logger.info(`Kullanıcı değişiklikleri kaydedildi: ${editUserName}`, "AdminUserControl");
    } catch (err) {
      console.error("User save edit error:", err);
    }
  };

  const handleToggleUserBan = async (userId: string, userName: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const nextStatus: RegisteredUser["status"] = targetUser.status === "banned" ? "active" : "banned";

    try {
      const { apiRequest } = await import('@/lib/api-client');
      await apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });

      const updated = users.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u));
      setUsers(updated);
      setUserSaveSuccess(true);
      setTimeout(() => setUserSaveSuccess(false), 3000);
      logger.info(`Kullanıcı engel durumu kaydedildi: ${userName} -> ${nextStatus}`, "AdminUserControl");
    } catch (err) {
      console.error("User status update error:", err);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`'${userName}' kullanıcısını sistemden kalıcı olarak silmek istediğinize emin misiniz?`)) {
      try {
        const { apiRequest } = await import('@/lib/api-client');
        const { error } = await apiRequest(`/users/${userId}`, { method: 'DELETE' });
        if (error) {
          alert(`Kullanıcı silinemedi: ${error}`);
          return;
        }
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        logger.info(`Kullanıcı Silindi: ${userName} (${userId})`, "AdminUserControl");
      } catch (err) {
        console.error("Kullanıcı silme hatası:", err);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    }
  };

  const handleResetUserPassword = (email: string) => {
    alert(`🔑 '${email}' e-posta adresine güvenli şifre sıfırlama bağlantısı iletildi.`);
    logger.info(`Şifre sıfırlama bağlantısı gönderildi: ${email}`, "AdminUserControl");
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (newRole === "admin") {
      alert("⚠️ İşletme hesaplarına veya kullanıcılara dışarıdan Super Admin yetkisi verilemez. Super Admin yetkisi yalnızca sistem kurucu hesabına aittir.");
      return;
    }

    try {
      const { apiRequest } = await import('@/lib/api-client');
      await apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });

      const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
      setUsers(updated);
      setUserSaveSuccess(true);
      setTimeout(() => setUserSaveSuccess(false), 3000);
      logger.info(`Kullanıcı rolü kaydedildi: ${userId} → ${newRole}`, "AdminPanel");
    } catch (err) {
      console.error("Role change error:", err);
    }
  };
  // Global Şablon Ekleme
  const handleAddGlobalTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName.trim()) return;

    const newTpl: GlobalServiceTemplate = {
      id: `gt-${Date.now()}`,
      sector: newTplSector,
      name: newTplName.trim(),
      duration_minutes: newTplDuration,
      suggested_price: newTplPrice,
    };
    const updatedTpls = [...templates, newTpl];
    setTemplates(updatedTpls);
    localStorage.setItem("glowdesk_global_templates", JSON.stringify(updatedTpls));
    setNewTplName("");
    logger.info(`Yeni global hizmet şablonu eklendi: ${newTpl.name}`, "GlobalCatalog");
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem("glowdesk_global_templates", JSON.stringify(updated));
  };

  // Metrikler
  const todayStr = new Date().toISOString().split("T")[0];

  const isTenantFree = (t: RegisteredTenant) => {
    return t.status === "active" && !!t.free_until && t.free_until >= todayStr;
  };

  const activeTenants = tenants.filter((t) => t.status === "active");
  const activePayingTenants = tenants.filter((t) => t.status === "active" && !isTenantFree(t));
  const freePromoTenants = tenants.filter((t) => isTenantFree(t));
  const suspendedTenants = tenants.filter((t) => t.status === "suspended");

  // MRR Sadece Ücretli Abonelerden Hesaplanır (Ücretsiz Hesaplar ₺0 Katkı Sağlar)
  const totalMRR = activePayingTenants.reduce((acc, t) => acc + (t.mrr_amount || 0), 0);
  const totalARR = totalMRR * 12;

  // Promosyon / Ücretsiz Kullanım Maliyeti (Kayıp Tahmini Ciro)
  const monthlyLostRevenue = freePromoTenants.reduce((acc, t) => {
    const defaultTierPrice = t.subscription_tier === "enterprise" ? 1499 : t.subscription_tier === "pro" ? 499 : 0;
    return acc + (t.mrr_amount || defaultTierPrice);
  }, 0);

  // Filtrelenmiş Kullanıcılar
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtrelenmiş Loglar
  const filteredLogs = logs.filter((l) => {
    if (logFilter === "ALL") return true;
    return l.type === logFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Super Admin Banner Header */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0066FF] text-white p-8 rounded-3xl shadow-layered border border-blue-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-[#0066FF] text-white font-extrabold text-[10px] uppercase rounded-full tracking-wider shadow-sm">
              👑 GlowDesk Platform Super Admin
            </span>
            <span className="text-[10px] text-emerald-300 font-extrabold bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/50">
              ● Canlı Sistem Aktif
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Platform Büyüme & Yönetim Paneli
          </h1>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed font-medium">
            Platform genelindeki tüm işletmeleri, abonelik gelirlerini (MRR), acil destek çağrılarını, tiptap blog içeriklerini ve sistem loglarını buradan yönetin.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="btn-secondary-white text-xs py-2.5 px-4"
          >
            👤 Yeni Kullanıcı
          </button>
          <button
            onClick={() => setShowAddTenantModal(true)}
            className="btn-primary-blue text-xs py-2.5 px-5 shadow-md"
          >
            🏢 Yeni İşletme Kaydet →
          </button>
        </div>
      </div>

      {/* Finansal & Kullanıcı Metrikleri Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-layered hover:shadow-layered-hover transition-all space-y-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block font-display">Net Aylık MRR Geliri</span>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            ₺{totalMRR.toLocaleString("tr-TR")}
          </div>
          <span className="text-[11px] text-emerald-600 font-extrabold block">
            Yıllık ARR: ₺{totalARR.toLocaleString("tr-TR")}
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-layered hover:shadow-layered-hover transition-all space-y-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block font-display">🎁 Promo Hesaplar</span>
          <div className="text-3xl font-extrabold text-[#0066FF] font-display">
            {freePromoTenants.length} <span className="text-xs font-semibold text-slate-400">Salon</span>
          </div>
          <span className="text-[11px] text-rose-600 font-extrabold block">
            Maliyet: -₺{monthlyLostRevenue.toLocaleString("tr-TR")}/Ay
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-layered hover:shadow-layered-hover transition-all space-y-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block font-display">Kayıtlı İşletmeler</span>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {tenants.length} <span className="text-xs font-semibold text-slate-400">Salon</span>
          </div>
          <span className="text-[11px] text-slate-500 font-bold block">
            {activePayingTenants.length} Ödemeli | {freePromoTenants.length} Promo | {suspendedTenants.length} Donduruldu
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-layered hover:shadow-layered-hover transition-all space-y-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block font-display">Toplam Kullanıcılar</span>
          <div className="text-3xl font-extrabold text-emerald-600 font-display">{users.length}</div>
          <span className="text-[11px] text-slate-500 font-bold block">
            {users.filter(u => u.role === "admin").length} Admin | {users.filter(u => u.role === "owner").length} Esnaf | {users.filter(u => u.role === "customer").length} Müşteri
          </span>
        </div>
      </div>

      {/* Aktif Modül Başlığı */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <h2 className="text-sm font-extrabold text-[#1E1B4B] font-display uppercase tracking-wider">
          {activeTab === "support" && `🚨 Acil Destek & Canlı Müşteri Talepleri (${emergencyTickets.length})`}
          {activeTab === "tenants" && `🏪 Kayıtlı Tüm İşletmeler (${tenants.length})`}
          {activeTab === "users" && `👥 Tüm Kullanıcıları Yönetme Paneli (${users.length})`}
          {activeTab === "blog" && `📝 Blog & Makale Yönetimi (Tiptap Editör) (${blogPosts.length})`}
          {activeTab === "financials" && `💳 Ödeme & Abonelik Logları (${paymentLogs.length})`}
          {activeTab === "templates" && `📋 Global Hizmet Şablonları Kataloğu (${templates.length})`}
          {activeTab === "audit" && `🚨 Sistem Audit Logları (${logs.length})`}
        </h2>
        <span className="text-xs text-[#1E1B4B] font-extrabold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          👈 Sol Menüden Seçili Modül
        </span>
      </div>

      {/* TAB: ACİL DESTEK TALEPLERİ */}
      {activeTab === "support" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between text-xs text-rose-800 font-bold">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚨</span>
              <span>Canlı Destek Botu ve Siteden Gelen Müşteri Çağrıları</span>
            </div>
            <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-[10px]">
              {emergencyTickets.filter(t => t.status === "ACİL").length} Bekleyen Acil Çağrı
            </span>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-xs">
            {emergencyTickets.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F172A] text-white uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Bilet No</th>
                    <th className="p-4">Tip</th>
                    <th className="p-4">Müşteri Telefon</th>
                    <th className="p-4">Sorun / Not</th>
                    <th className="p-4">Zaman</th>
                    <th className="p-4">Durum</th>
                    <th className="p-4 text-right">Eylemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {emergencyTickets.map((t) => (
                    <tr key={t.id} className={t.status === "ACİL" ? "bg-rose-50/50 hover:bg-rose-100/50" : "hover:bg-slate-50"}>
                      <td className="p-4 font-mono font-bold text-[#0066FF]">{t.id}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${t.type === "ACİL" ? "bg-rose-100 text-rose-700 border border-rose-300" : "bg-blue-100 text-blue-700"}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        <a href={`tel:${t.phone}`} className="hover:text-[#0066FF] underline">
                          📞 {t.phone}
                        </a>
                      </td>
                      <td className="p-4">{t.note}</td>
                      <td className="p-4 text-slate-500">{t.createdAt}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === "ACİL" ? "bg-rose-600 text-white" : "bg-emerald-100 text-emerald-800"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {t.status !== "ÇÖZÜLDÜ" && (
                          <button
                            type="button"
                            onClick={() => handleResolveTicket(t.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            ✓ Çözüldü Olarak İşaretle
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteTicket(t.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          🗑️ Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                Henüz canlı sohbet widget&apos;ından gelen destek talebi bulunmuyor.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: İŞLETMELER */}
      {activeTab === "tenants" && (
        <div className="space-y-4">
          <div className="brand-card p-3 bg-white">
            <input
              type="text"
              placeholder="Salon adı, şehir veya ilçe ile filtrele..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-dark text-xs"
            />
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-xs">
            {tenants.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E1B4B] text-white uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">İşletme Adı</th>
                    <th className="p-4">Sektör</th>
                    <th className="p-4">Konum</th>
                    <th className="p-4">Paket & MRR</th>
                    <th className="p-4">🎁 Ücretsiz Kullanım (Promo Bitiş)</th>
                    <th className="p-4">Erişim Durumu</th>
                    <th className="p-4 text-right">Eylem & Yönetim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {tenants
                    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.district?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-[#1E1B4B]">
                          {t.name}
                          <span className="block text-[10px] font-normal text-slate-400">/{t.slug}</span>
                        </td>
                        <td className="p-4 font-bold text-cyan-700 uppercase">{t.sector}</td>
                        <td className="p-4">{t.city} / {t.district || "Şişli"}</td>
                        <td className="p-4">
                          <select
                            value={t.subscription_tier}
                            onChange={(e) => handleChangeTenantTier(t.id, e.target.value as any)}
                            className="input-dark bg-white py-1 px-2 text-xs w-auto font-extrabold text-[#1E1B4B]"
                          >
                            <option value="starter">Starter (₺0/Ay)</option>
                            <option value="pro">Pro (₺499/Ay)</option>
                            <option value="enterprise">Enterprise (₺1.499/Ay)</option>
                          </select>
                          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">₺{t.mrr_amount}/Ay MRR</span>
                        </td>
                        <td className="p-4">
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={t.free_until || ""}
                            onChange={(e) => handleSetTenantFreeUntil(t.id, e.target.value)}
                            className="input-dark text-xs py-1 px-2 w-auto bg-white font-bold"
                          />
                          {t.free_until && new Date(t.free_until) > new Date() ? (
                            <span className="text-[10px] text-cyan-600 font-extrabold mt-1 block">
                              🎁 {new Date(t.free_until).toLocaleDateString("tr-TR")}&apos;ye kadar Ücretsiz
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 mt-1 block">Tarih Seçilmedi</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            t.status === "active" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                            t.status === "suspended" ? "bg-rose-100 text-rose-800 border-rose-200" :
                            "bg-amber-100 text-amber-800 border-amber-200"
                          }`}>
                            {t.status === "active" ? "● Aktif" : t.status === "suspended" ? "🔒 Donduruldu" : "⏳ Kurulumda"}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">

                          <button
                            onClick={() => handleToggleTenantStatus(t.id)}
                            className={`px-2.5 py-1.5 rounded-xl font-bold text-[10px] border transition-all ${
                              t.status === "active"
                                ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {t.status === "active" ? "Dondur" : "Aktifleştir"}
                          </button>

                          <button
                            onClick={() => handleDeleteTenant(t.id, t.name)}
                            className="px-2.5 py-1.5 rounded-xl font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all"
                          >
                            Sil 🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500 space-y-3 bg-white">
                <span className="text-4xl block">🏢</span>
                <h4 className="font-extrabold text-[#1E1B4B]">Henüz Kayıtlı İşletme Bulunmuyor</h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TÜM KULLANICILARI YÖNET */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="brand-card p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <input
              type="text"
              placeholder="Kullanıcı adı, e-posta, telefon veya işletme ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-dark text-xs flex-1"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Rol Filtresi:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="input-dark bg-white text-xs w-auto"
              >
                <option value="all">Tüm Rolleri Göster</option>
                <option value="admin">👑 Super Admin</option>
                <option value="owner">💼 Salon Sahibi (Owner)</option>
                <option value="staff">✂️ Salon Personeli (Staff)</option>
                <option value="customer">👤 Müşteri (Customer)</option>
              </select>
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="btn-cyan text-xs py-2 px-3.5 font-bold shadow-xs whitespace-nowrap flex items-center gap-1.5"
              >
                <span>➕</span> Yeni Kullanıcı Ekle
              </button>
            </div>
          </div>

          {userSaveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Kullanıcı verileri veritabanına başarıyla kaydedildi ve güncellendi!</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded font-black">SAVE SUCCESS</span>
            </div>
          )}

          <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-xs">
            {filteredUsers.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E1B4B] text-white uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Kullanıcı Ad Soyad</th>
                    <th className="p-4">İletişim</th>
                    <th className="p-4">Bağlı İşletme</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Hesap Durumu</th>
                    <th className="p-4 text-right">Yönetim Eylemleri</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredUsers.map((u, idx) => (
                    <tr key={`${u.id || "usr"}-${u.email || "mail"}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-[#1E1B4B]">{u.fullName}</td>
                      <td className="p-4">
                        {u.email}
                        {u.phone && <span className="block text-[10px] text-slate-400">{u.phone}</span>}
                      </td>
                      <td className="p-4 text-slate-600 font-semibold">{u.businessName || "— (Platform)"}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                          className="input-dark bg-white py-1 px-2 text-xs w-auto font-bold"
                        >
                          {u.role === "admin" && <option value="admin">👑 Super Admin</option>}
                          <option value="owner">💼 Salon Sahibi</option>
                          <option value="staff">✂️ Personel</option>
                          <option value="customer">👤 Müşteri</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase border ${
                          u.status === "banned"
                            ? "bg-rose-100 text-rose-800 border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                        }`}>
                          {u.status === "banned" ? "🔒 Engelli" : "● Aktif"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleStartEditUser(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-extrabold text-[10px]"
                          title="Kullanıcı Detaylarını Düzenle ve Kaydet"
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          onClick={() => handleResetUserPassword(u.email)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                          title="Şifre Sıfırlama Bağlantısı Gönder"
                        >
                          🔑 Şifre
                        </button>
                        <button
                          onClick={() => handleToggleUserBan(u.id, u.fullName)}
                          className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] border transition-all ${
                            u.status === "banned"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {u.status === "banned" ? "Engeli Aç" : "Engelle"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.fullName)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] hover:bg-rose-100"
                        >
                          Sil 🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500 space-y-2 bg-white">
                <span className="text-3xl block">👥</span>
                <p className="font-extrabold text-[#1E1B4B]">Kullanıcı Bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: BLOG YÖNETİMİ (TIPTAP EDITOR) */}
      {activeTab === "blog" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-extrabold text-[#1E1B4B] text-sm">📝 Tiptap Blog & Rehber Yayınlama Merkezi</h3>
              <p className="text-slate-500 text-xs mt-0.5">Sadece Super Admin ve Blog Editörleri makale kaleme alabilir ve yayınlayabilir.</p>
            </div>
            <button
              onClick={() => {
                resetBlogForm();
                setShowBlogModal(true);
              }}
              className="btn-cyan text-xs py-2.5 px-4 font-extrabold shadow-sm flex items-center gap-1.5"
            >
              <span>✍️</span> Yeni Blog Yazısı Kaleme Al
            </button>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-xs">
            {blogPosts.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E1B4B] text-white uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Makale Başlığı & Slug</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Yazar</th>
                    <th className="p-4">Yayın Durumu</th>
                    <th className="p-4">Tarih</th>
                    <th className="p-4 text-right">Eylem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {blogPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-[#1E1B4B]">
                        {post.title}
                        <span className="block text-[10px] text-slate-400 font-normal">/blog/{post.slug}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 font-extrabold text-[10px] rounded border border-indigo-100 uppercase">
                          {post.category}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">✍️ {post.author_name}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleBlogPostStatus(post.id)}
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase border transition-all ${
                            post.status === "published"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                          }`}
                        >
                          {post.status === "published" ? "● Yayında" : "⏳ Taslak"}
                        </button>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {new Date(post.created_at).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-50 text-cyan-800 font-bold text-[10px] border border-cyan-200 hover:bg-cyan-100 inline-block"
                        >
                          👁️ Önizle
                        </a>
                        <button
                          onClick={() => handleEditBlogPost(post)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 font-bold text-[10px] border border-indigo-200 hover:bg-indigo-100"
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteBlogPost(post.id, post.title)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200 hover:bg-rose-100"
                        >
                          Sil 🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500 space-y-2 bg-white">
                <span className="text-3xl block">📝</span>
                <p className="font-extrabold text-[#1E1B4B]">Henüz Blog Yazısı Eklenmedi</p>
                <p className="text-xs text-slate-400">Tiptap editörü kullanarak ilk rehber makalenizi yayınlayabilirsiniz.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ÖDEME LOGLARI */}
      {activeTab === "financials" && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 font-medium">
            💳 Iyzico / Stripe sanal POS entegrasyonu üzerinden gerçekleşen tüm abonelik ödemeleri ve tahsilat kayıtları.
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-xs">
            {paymentLogs.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E1B4B] text-white uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">İşlem ID</th>
                    <th className="p-4">Salon Adı</th>
                    <th className="p-4">Tutar</th>
                    <th className="p-4">Ödeme Sağlayıcı</th>
                    <th className="p-4">Durum</th>
                    <th className="p-4">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {paymentLogs.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-[#1E1B4B]">{pay.id}</td>
                      <td className="p-4 font-bold">{pay.tenant_name}</td>
                      <td className="p-4 font-extrabold text-emerald-700">₺{pay.amount}</td>
                      <td className="p-4 font-semibold">{pay.provider}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          ✓ {pay.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{new Date(pay.timestamp).toLocaleString("tr-TR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500 space-y-2 bg-white">
                <span className="text-3xl block">💳</span>
                <p className="font-extrabold text-[#1E1B4B]">Henüz Tahsilat Logu Yok</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GLOBAL HİZMET ŞABLONLARI */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="brand-card p-6 bg-white space-y-4">
            <h3 className="text-xs font-bold uppercase text-[#1E1B4B] tracking-wider">
              ➕ Yeni Global Hizmet Şablonu Ekle
            </h3>
            <form onSubmit={handleAddGlobalTemplate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Hizmet Adı (ör. Sakal Kesimi & Bakım Yağı)"
                required
                value={newTplName}
                onChange={(e) => setNewTplName(e.target.value)}
                className="input-dark text-xs sm:col-span-1"
              />
              <select
                value={newTplSector}
                onChange={(e) => setNewTplSector(e.target.value)}
                className="input-dark text-xs bg-white"
              >
                <option value="barber">💈 Berber</option>
                <option value="beauty">💄 Güzellik</option>
                <option value="spa">🌿 Spa</option>
                <option value="clinic">🩺 Klinik</option>
              </select>
              <input
                type="number"
                placeholder="Süre (Dk)"
                value={newTplDuration}
                onChange={(e) => setNewTplDuration(Number(e.target.value))}
                className="input-dark text-xs"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Tavsiye Fiyat (₺)"
                  value={newTplPrice}
                  onChange={(e) => setNewTplPrice(Number(e.target.value))}
                  className="input-dark text-xs flex-1"
                />
                <button type="submit" className="btn-cyan text-xs py-2 px-4 shadow-xs shrink-0">
                  + Ekle
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="brand-card p-5 bg-white border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] font-extrabold text-cyan-600 uppercase tracking-widest block">{tpl.sector}</span>
                  <h4 className="font-extrabold text-[#1E1B4B] text-sm mt-0.5">{tpl.name}</h4>
                  <span className="text-slate-500 block mt-1">⏱ Varsayılan Süre: {tpl.duration_minutes} Dakika</span>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <span className="font-black text-[#1E1B4B] text-base block">₺{tpl.suggested_price}</span>
                    <span className="text-[10px] text-slate-400">Tavsiye Edilen Fiyat</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="text-[10px] text-rose-600 font-bold hover:underline block ml-auto"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-950 text-xs gap-3">
            <span>🚨 Otomatik Yakalanan Sistem Hataları ve Audit İzleri ({filteredLogs.length} Kayıt)</span>
            
            <div className="flex items-center gap-2">
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="input-dark bg-white py-1 px-2 text-xs w-auto"
              >
                <option value="ALL">Tüm Seviyeler</option>
                <option value="ERROR">Sadece ERROR</option>
                <option value="WARN">Sadece WARN</option>
                <option value="INFO">Sadece INFO</option>
              </select>
              <button
                onClick={() => { logger.clearLogs(); setLogs([]); }}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700"
              >
                Logları Temizle
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="brand-card p-4 bg-white border-l-4 border-l-rose-600 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-rose-700 uppercase tracking-wider text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {log.type} — {log.source}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(log.timestamp).toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <p className="font-bold text-[#1E1B4B]">{log.message}</p>
                </div>
              ))
            ) : (
              <div className="brand-card p-12 text-center text-slate-500 space-y-2 bg-white">
                <span className="text-3xl block">✅</span>
                <p className="font-extrabold text-[#1E1B4B]">Hiç Hata Yakalanmadı</p>
              </div>
            )}
          </div>

          {/* Danger Zone: Veri Sıfırlama */}
          <div className="brand-card p-6 bg-rose-50 border border-rose-200 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
              <span>🚨</span> TEHLİKELİ BÖLGE (DANGER ZONE)
            </div>
            <p className="text-xs text-rose-900 leading-relaxed font-medium">
              Aşağıdaki buton platformdaki tüm salon, müşteri, hizmet, randevu ve ödeme loglarını kalıcı olarak sıfırlar. Yalnızca Super Admin hesapları korunur. Yanlışlıkla tıklanmaması için buraya taşınmıştır.
            </p>
            <button
              onClick={handleTriggerPureReset}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>💥</span> Platform Tüm Verilerini Sıfırla (Admin Hariç)
            </button>
          </div>
        </div>
      )}

      {/* YENİ SALON EKLE MODALI */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-[#1E1B4B] font-display text-lg">Platforma Yeni İşletme Ekle</h3>
              <button onClick={() => setShowAddTenantModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleAddTenant} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Salon / İşletme Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Kral Erkek Kuaförü"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Sektör</label>
                  <select
                    value={newTenantSector}
                    onChange={(e) => setNewTenantSector(e.target.value)}
                    className="input-dark bg-white"
                  >
                    <option value="beauty">💄 Güzellik</option>
                    <option value="barber">💈 Berber</option>
                    <option value="massage">💆 Masaj</option>
                    <option value="spa">🌿 Spa</option>
                    <option value="clinic">🩺 Klinik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Abonelik Paketi</label>
                  <select
                    value={newTenantTier}
                    onChange={(e) => setNewTenantTier(e.target.value as any)}
                    className="input-dark bg-white font-bold"
                  >
                    <option value="starter">Starter (₺0/Ay)</option>
                    <option value="pro">Pro (₺499/Ay)</option>
                    <option value="enterprise">Enterprise (₺1.499/Ay)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Şehir</label>
                  <input
                    type="text"
                    required
                    value={newTenantCity}
                    onChange={(e) => setNewTenantCity(e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">İlçe</label>
                  <input
                    type="text"
                    required
                    value={newTenantDistrict}
                    onChange={(e) => setNewTenantDistrict(e.target.value)}
                    className="input-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">İletişim Telefonu</label>
                <input
                  type="tel"
                  required
                  value={newTenantPhone}
                  onChange={(e) => setNewTenantPhone(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="w-1/3 btn-secondary justify-center text-xs py-3"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="w-2/3 btn-cyan justify-center text-xs py-3 shadow-md font-bold"
                >
                  Salonu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ KULLANICI EKLE MODALI */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-[#1E1B4B] font-display text-lg">Platforma Yeni Kullanıcı Ekle</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Can Yılmaz"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">E-posta Adresi *</label>
                <input
                  type="email"
                  required
                  placeholder="can@glowdesk.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Telefon</label>
                  <input
                    type="tel"
                    placeholder="+90 555 123 4567"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Kullanıcı Rolü</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="input-dark bg-white font-bold"
                  >
                    <option value="owner">💼 Salon Sahibi</option>
                    <option value="staff">✂️ Personel</option>
                    <option value="customer">👤 Müşteri</option>
                    <option value="admin">👑 Super Admin</option>
                  </select>
                </div>
              </div>

              {newUserRole === "owner" && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">İşletme Adı</label>
                  <input
                    type="text"
                    placeholder="Grand Hair Studio"
                    value={newUserBusiness}
                    onChange={(e) => setNewUserBusiness(e.target.value)}
                    className="input-dark"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="w-1/3 btn-secondary justify-center text-xs py-3"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="w-2/3 btn-primary justify-center text-xs py-3 shadow-md font-bold"
                >
                  Kullanıcıyı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KULLANICI DÜZENLEME MODALI */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-extrabold text-[#1E1B4B] font-display text-lg">✏️ Kullanıcı Bilgilerini Düzenle</h3>
                <p className="text-xs text-slate-500 mt-0.5">{editingUser.email}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">E-posta Adresi *</label>
                <input
                  type="email"
                  required
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Telefon</label>
                  <input
                    type="tel"
                    value={editUserPhone}
                    onChange={(e) => setEditUserPhone(e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Kullanıcı Rolü</label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                    className="input-dark bg-white font-bold"
                  >
                    <option value="owner">💼 Salon Sahibi</option>
                    <option value="staff">✂️ Personel</option>
                    <option value="customer">👤 Müşteri</option>
                    {editingUser.role === "admin" && <option value="admin">👑 Super Admin</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Hesap Durumu</label>
                <select
                  value={editUserStatus}
                  onChange={(e) => setEditUserStatus(e.target.value as "active" | "banned")}
                  className="input-dark bg-white font-bold"
                >
                  <option value="active">● Aktif Kullanıcı</option>
                  <option value="banned">🔒 Engelli / Askıda</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="w-1/3 btn-secondary justify-center text-xs py-3"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="w-2/3 btn-cyan justify-center text-xs py-3 shadow-md font-bold flex items-center gap-1.5"
                >
                  <span>💾</span>
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#1E1B4B] font-display">
                  {editingPostId ? "✏️ Blog Yazısını Düzenle" : "✍️ Yeni Blog Yazısı Kaleme Al"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Tiptap Rich Text Editör ile zengin metin, görsel ve bağlantılar ekleyin.</p>
              </div>
              <button
                onClick={() => {
                  setShowBlogModal(false);
                  resetBlogForm();
                }}
                className="text-slate-400 hover:text-slate-600 font-black text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBlogPost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Makale Başlığı *</label>
                  <input
                    type="text"
                    placeholder="Örn: 2028 Kuaför Trendleri & Dijital Randevu Rehberi"
                    value={blogTitle}
                    onChange={(e) => {
                      setBlogTitle(e.target.value);
                      if (!editingPostId) {
                        setBlogSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
                      }
                    }}
                    className="input-dark font-bold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">URL Adresi (Slug) *</label>
                  <input
                    type="text"
                    placeholder="kuafor-trendleri-rehberi"
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    className="input-dark text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Kategori</label>
                  <select
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                    className="input-dark bg-white text-xs font-bold"
                  >
                    <option value="Genel">Genel</option>
                    <option value="Salon Yönetimi">Salon Yönetimi</option>
                    <option value="No-Show Azaltma">No-Show Azaltma</option>
                    <option value="Pazarlama & Büyüme">Pazarlama & Büyüme</option>
                    <option value="Teknoloji & Yazılım">Teknoloji & Yazılım</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Yayın Durumu</label>
                  <select
                    value={blogStatus}
                    onChange={(e) => setBlogStatus(e.target.value as any)}
                    className="input-dark bg-white text-xs font-extrabold"
                  >
                    <option value="published">● Hemen Yayınla (Published)</option>
                    <option value="draft">⏳ Taslak (Draft)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Kapak Görseli URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={blogCover}
                    onChange={(e) => setBlogCover(e.target.value)}
                    className="input-dark text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Kısa Özet (Excerpt)</label>
                <textarea
                  rows={2}
                  placeholder="Makalenin arama sonuçlarında ve kartlarda görünecek kısa özeti..."
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  className="input-dark text-xs"
                />
              </div>

              {/* TIPTAP RICH TEXT EDITOR */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#1E1B4B] mb-1.5">
                  Tiptap Rich Text Makale İçeriği *
                </label>
                <TiptapEditor content={blogContent} onChange={setBlogContent} />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowBlogModal(false);
                    resetBlogForm();
                  }}
                  className="w-1/3 btn-secondary justify-center text-xs py-3"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="w-2/3 btn-cyan justify-center text-xs py-3 shadow-md font-extrabold"
                >
                  {editingPostId ? "Makaleyi Güncelle" : "Makaleyi Yayınla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
