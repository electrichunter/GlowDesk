-- ==============================================================================
-- GlowDesk — Multi-Vertical Migration (002_multi_vertical.sql)
-- Restoran, Hukuk ve Salon dikeyleri için veritabanı esnekliği ve hibrit şema
-- ==============================================================================

-- 1. APPOINTMENTS TABLOSUNA SEKTÖREL ALANLAR EKLENMESİ
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS
  vertical text NOT NULL DEFAULT 'salon';

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS
  sector_data jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2. GENERATED COLUMNS (Sık sorgulanan JSONB alanları için indexlenebilir yüzey)
-- Restoran: Kişi sayısı
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS
  guest_count integer GENERATED ALWAYS AS ((sector_data->>'guestCount')::integer) STORED;

-- Hukuk / Restoran: Ön Ödeme & Depozito Durumu
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS
  deposit_paid boolean GENERATED ALWAYS AS ((sector_data->>'depositPaid')::boolean) STORED;

-- 3. YENİ TABLOLAR

-- A) Restoran: Masa Yönetimi
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id            text PRIMARY KEY DEFAULT ('tbl-' || extract(epoch from now())::bigint::text || '-' || left(gen_random_uuid()::text,8)),
  tenant_id     text NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  label         text NOT NULL,          -- örn: "Teras VIP 1", "Pencere Kenarı 4"
  capacity      integer NOT NULL DEFAULT 4,
  is_active     boolean NOT NULL DEFAULT true,
  location_hint text,                   -- örn: "Teras", "İç Mekan", "Bahçe"
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- B) Hukuk: Dava Kategori ve Danışmanlık Türleri
CREATE TABLE IF NOT EXISTS public.legal_case_types (
  id               text PRIMARY KEY DEFAULT ('ctype-' || extract(epoch from now())::bigint::text || '-' || left(gen_random_uuid()::text,8)),
  tenant_id        text NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name             text NOT NULL,       -- örn: "İş Hukuku Danışmanlığı", "Aile Hukuku"
  base_fee         numeric(10,2) NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- C) Hukuk: Randevulara Ait Yüklenen Belgeler
CREATE TABLE IF NOT EXISTS public.appointment_documents (
  id             text PRIMARY KEY DEFAULT ('doc-' || extract(epoch from now())::bigint::text || '-' || left(gen_random_uuid()::text,8)),
  appointment_id text NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  file_url       text NOT NULL,
  file_name      text NOT NULL,
  uploaded_at    timestamptz NOT NULL DEFAULT now()
);

-- 4. İNDEKSLER (Performans ve Partial Index)
CREATE INDEX IF NOT EXISTS idx_appointments_vertical   ON public.appointments(vertical);
CREATE INDEX IF NOT EXISTS idx_appointments_sector     ON public.appointments USING GIN (sector_data);
CREATE INDEX IF NOT EXISTS idx_appointments_guest      ON public.appointments(guest_count) WHERE guest_count IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_deposit    ON public.appointments(deposit_paid) WHERE deposit_paid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_tenant ON public.restaurant_tables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_legal_case_types_tenant  ON public.legal_case_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointment_docs_apt    ON public.appointment_documents(appointment_id);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.restaurant_tables    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_case_types     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurant_tables_all"    ON public.restaurant_tables    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "legal_case_types_all"     ON public.legal_case_types     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "appointment_documents_all" ON public.appointment_documents FOR ALL USING (true) WITH CHECK (true);
