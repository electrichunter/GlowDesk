-- Migration: Add roles table and role_id column to users
USE glowdesk;

DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,       -- admin | owner | editor | staff | customer
    display_name VARCHAR(100) NOT NULL,      -- Platform Admin | İşletme Sahibi | Editör | Personel | Müşteri
    description TEXT,
    permissions JSON,                       -- Hibrit İzin Listesi (ör: ["manage_tenants", "manage_appointments"])
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed Roles Data
INSERT INTO roles (id, name, display_name, description, permissions) VALUES
('role-admin', 'admin', 'Platform Admin', 'Sistem genelinde tam yetkili yöneticidir.', '["*"]'),
('role-owner', 'owner', 'İşletme Sahibi', 'Salon/İşletme ayarlarını, personel ve finansal verileri yönetir.', '["manage_tenant", "manage_staff", "manage_appointments", "manage_services", "view_reports"]'),
('role-editor', 'editor', 'İçerik Editörü', 'Blog, duyuru ve makale içeriklerini düzenler.', '["manage_blog", "view_reports"]'),
('role-staff', 'staff', 'Personel', 'Randevuları ve müşteri işlemlerini takip eder.', '["view_appointments", "update_appointments", "view_customers"]'),
('role-customer', 'customer', 'Müşteri / Danışan', 'Randevu oluşturur ve kendi geçmişini görüntüler.', '["book_appointment", "view_my_appointments"]')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name), permissions=VALUES(permissions);

-- Execute ALTER TABLE dynamically
SET @dropdown_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'glowdesk' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'role_id'
);

SET @query = IF(@dropdown_exists = 0,
    'ALTER TABLE users ADD COLUMN role_id VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT "role-customer" AFTER tenant_id, ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL',
    'SELECT "role_id column already exists"'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update Super Admin role_id
UPDATE users SET role_id = 'role-admin' WHERE role = 'admin' OR email = 'admin@glowdesk.com';
