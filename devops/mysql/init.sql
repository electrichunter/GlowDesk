-- GlowDesk Full MySQL 8.0 Database Schema Initializer
-- Üretim Ortamı Ana Veritabanı Şeması
CREATE DATABASE IF NOT EXISTS glowdesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE glowdesk;

-- 1. Table: roles (Sistem ve İşletme Rolleri)
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,       -- admin | owner | editor | staff | customer
    display_name VARCHAR(100) NOT NULL,      -- Platform Admin | İşletme Sahibi | Editör | Personel | Müşteri
    description TEXT,
    permissions JSON,                       -- Hibrit İzin Listesi (ör: ["manage_tenants", "manage_appointments"])
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Roles Data
INSERT INTO roles (id, name, display_name, description, permissions) VALUES
('role-admin', 'admin', 'Platform Admin', 'Sistem genelinde tam yetkili yöneticidir.', '["*"]'),
('role-owner', 'owner', 'İşletme Sahibi', 'Salon/İşletme ayarlarını, personel ve finansal verileri yönetir.', '["manage_tenant", "manage_staff", "manage_appointments", "manage_services", "view_reports"]'),
('role-editor', 'editor', 'İçerik Editörü', 'Blog, duyuru ve makale içeriklerini düzenler.', '["manage_blog", "view_reports"]'),
('role-staff', 'staff', 'Personel', 'Randevuları ve müşteri işlemlerini takip eder.', '["view_appointments", "update_appointments", "view_customers"]'),
('role-customer', 'customer', 'Müşteri / Danışan', 'Randevu oluşturur ve kendi geçmişini görüntüler.', '["book_appointment", "view_my_appointments"]')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name), permissions=VALUES(permissions);

-- 2. Table: tenants (İşletmeler / Salonlar)
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sector VARCHAR(50) NOT NULL DEFAULT 'beauty',        -- beauty | barber | massage | spa | clinic | restaurant | legal
    phone VARCHAR(50),
    email VARCHAR(255),
    city VARCHAR(100) DEFAULT 'İstanbul',
    district VARCHAR(100) DEFAULT 'Merkez',
    neighborhood VARCHAR(100),
    street VARCHAR(255),
    address TEXT,
    staff_count VARCHAR(50) DEFAULT '1-3',
    workstation_count VARCHAR(50) DEFAULT '1-3',
    lat VARCHAR(50),
    lng VARCHAR(50),
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'pro', -- starter | pro | enterprise
    free_until DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',        -- active | suspended | onboarding
    settings JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenants_slug (slug),
    INDEX idx_tenants_city (city),
    INDEX idx_tenants_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: users / profiles (Kullanıcılar - Super Admin, Owner, Editor, Staff, Customer)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64),
    role_id VARCHAR(64) DEFAULT 'role-customer',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',        -- admin | owner | editor | staff | customer (Geriye uyumluluk)
    status VARCHAR(50) NOT NULL DEFAULT 'active',      -- active | banned
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_tenant (tenant_id),
    INDEX idx_users_role (role),
    INDEX idx_users_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: customers (Müşteri CRM)
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'global',
    profile_id VARCHAR(64),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    is_blacklisted TINYINT(1) NOT NULL DEFAULT 0,
    no_show_count INT NOT NULL DEFAULT 0,
    appointment_count INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_customers_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: services (Hizmet Kataloğu)
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    duration_minutes INT NOT NULL DEFAULT 30,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'TRY',
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_services_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: appointments (Randevu Takvimi - Multi-Vertical Uyumlu)
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    customer_id VARCHAR(64),
    staff_id VARCHAR(64),
    service_id VARCHAR(64),
    service_name VARCHAR(255),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_price DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',   -- scheduled | confirmed | cancelled | completed | no_show
    notes TEXT,
    vertical VARCHAR(50) NOT NULL DEFAULT 'salon',     -- salon | restoran | hukuk
    sector_data JSON,                                  -- Hibrit JSON verisi (guestCount, depositPaid vb.)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    INDEX idx_appointments_tenant (tenant_id),
    INDEX idx_appointments_status (status),
    INDEX idx_appointments_date (appointment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: posts (Blog ve İçerik Yönetimi)
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    cover_image TEXT,
    author_name VARCHAR(100) NOT NULL DEFAULT 'GlowDesk Editör',
    author_role VARCHAR(50) NOT NULL DEFAULT 'editor',
    category VARCHAR(100) NOT NULL DEFAULT 'Genel',
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_posts_slug (slug),
    INDEX idx_posts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table: payment_logs (Ödeme Logları)
CREATE TABLE IF NOT EXISTS payment_logs (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64),
    tenant_name VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    plan VARCHAR(50),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'iyzico_credit_card',
    status VARCHAR(50) NOT NULL DEFAULT 'success',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table: restaurant_tables (Restoran Masa Yönetimi)
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    label VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    location_hint VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_tables_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table: legal_case_types (Hukuk Dava & Danışmanlık Türleri)
CREATE TABLE IF NOT EXISTS legal_case_types (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    base_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    duration_minutes INT NOT NULL DEFAULT 60,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_case_types_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Table: appointment_documents (Dava / Randevu Yüklenen Belgeleri)
CREATE TABLE IF NOT EXISTS appointment_documents (
    id VARCHAR(64) PRIMARY KEY,
    appointment_id VARCHAR(64) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_docs_appointment (appointment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. SEED DATA (Super Admin Kullanıcısı)
-- E-posta: admin@glowdesk.com
-- Şifre: Admin1234! (Bcrypt hash: $2b$12$K896lCgK5z... / FastAPI bcrypt uyumlu)
INSERT INTO users (id, full_name, email, password_hash, role, role_id, status, is_active)
VALUES (
    'usr-superadmin-glowdesk',
    'GlowDesk Super Admin',
    'admin@glowdesk.com',
    '$2b$12$e68Y27vTbhBbh4wB3yLllO3gA.D0E25oQ1gP6wFqjK1W0n3gM.p4u', -- Admin1234!
    'admin',
    'role-admin',
    'active',
    1
) ON DUPLICATE KEY UPDATE role='admin', role_id='role-admin', status='active', is_active=1;
