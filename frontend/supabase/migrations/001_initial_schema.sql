-- ==============================================================================
-- GlowDesk — Tam Supabase PostgreSQL Şeması (Üretim Hazır)
-- Supabase Dashboard → SQL Editor → Yapıştır → Run
-- ==============================================================================

-- 0. TEMİZLİK (eğer yeniden kuruluyorsa eski tabloları sil)
drop table if exists public.payment_logs cascade;
drop table if exists public.appointments cascade;
drop table if exists public.services cascade;
drop table if exists public.customers cascade;
drop table if exists public.posts cascade;
drop table if exists public.profiles cascade;
drop table if exists public.tenants cascade;

-- 1. EKLENTİLER
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. UPDATED_AT OTOMATİK FONKSİYONU
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 3. ANA TABLOLAR
-- ==============================================================================

-- A) İşletmeler (Tenants)
create table public.tenants (
  id           text primary key default ('tenant-' || extract(epoch from now())::bigint::text || '-' || left(gen_random_uuid()::text,8)),
  name         text not null,
  slug         text not null unique,
  sector       text not null default 'beauty',        -- beauty | barber | massage | spa | clinic
  phone        text,
  city         text default 'İstanbul',
  district     text default 'Merkez',
  address      text,
  subscription_tier text not null default 'starter', -- starter | pro | enterprise
  free_until   date,
  status       text not null default 'active',        -- active | suspended | onboarding
  settings     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- A.0) Rol Tanımları (Roles)
create table public.roles (
  id           text primary key,
  name         text not null unique,
  display_name text not null,
  description  text,
  permissions  jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

-- Seed Default Roles
insert into public.roles (id, name, display_name, description, permissions) values
  ('role-admin', 'admin', 'Platform Admin', 'Sistem genelinde tam yetkili yöneticidir.', '["*"]'::jsonb),
  ('role-owner', 'owner', 'İşletme Sahibi', 'Salon/İşletme ayarlarını, personel ve finansal verileri yönetir.', '["manage_tenant", "manage_staff", "manage_appointments", "manage_services", "view_reports"]'::jsonb),
  ('role-editor', 'editor', 'İçerik Editörü', 'Blog, duyuru ve makale içeriklerini düzenler.', '["manage_blog", "view_reports"]'::jsonb),
  ('role-staff', 'staff', 'Personel', 'Randevuları ve müşteri işlemlerini takip eder.', '["view_appointments", "update_appointments", "view_customers"]'::jsonb),
  ('role-customer', 'customer', 'Müşteri / Danışan', 'Randevu oluşturur ve kendi geçmişini görüntüler.', '["book_appointment", "view_my_appointments"]'::jsonb)
on conflict (id) do update set display_name=excluded.display_name, permissions=excluded.permissions;

-- B) Kullanıcı Profilleri (Profiles) — Şifre bcrypt (pgcrypto) ile saklanır
create table public.profiles (
  id            text primary key default ('usr-' || extract(epoch from now())::bigint::text || '-' || left(gen_random_uuid()::text,8)),
  tenant_id     text references public.tenants(id) on delete set null,
  role_id       text references public.roles(id) on delete set null default 'role-customer',
  full_name     text not null,
  email         text not null unique,
  phone         text,
  password_hash text,                                  -- bcrypt hash ile saklanan şifre
  role          text not null default 'customer',      -- admin | owner | editor | staff | customer
  status        text not null default 'active',        -- active | banned
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- C) Müşteri CRM (Customers)
create table public.customers (
  id                 text primary key default ('cust-' || extract(epoch from now())::bigint::text || '-' || left(gen_random_uuid()::text,8)),
  tenant_id          text not null default 'global',
  profile_id         text references public.profiles(id) on delete set null,
  full_name          text not null,
  phone              text,
  email              text,
  notes              text,
  is_blacklisted     boolean not null default false,
  no_show_count      integer not null default 0,
  appointment_count  integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- D) Hizmet Kataloğu (Services)
create table public.services (
  id               text primary key default ('svc-' || extract(epoch from now())::bigint::text || '-' || left(gen_random_uuid()::text,8)),
  tenant_id        text not null references public.tenants(id) on delete cascade,
  name             text not null,
  duration_minutes integer not null default 30,
  price            numeric(10,2) not null default 0,
  currency         text not null default 'TRY',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- E) Randevu Takvimi (Appointments)
create table public.appointments (
  id           text primary key default ('apt-' || extract(epoch from now())::bigint::text || '-' || left(gen_random_uuid()::text,8)),
  tenant_id    text not null references public.tenants(id) on delete cascade,
  customer_id  text references public.customers(id) on delete set null,
  service_id   text references public.services(id) on delete set null,
  service_name text,
  start_time   timestamptz not null,
  end_time     timestamptz not null,
  price        numeric(10,2),
  status       text not null default 'pending',   -- pending | confirmed | cancelled | completed | no_show
  notes        text,
  created_at   timestamptz not null default now()
);

-- F) Blog / İçerik Sistemi (Posts) — Tiptap ile oluşturulan içerikler
create table public.posts (
  id           text primary key default ('post-' || extract(epoch from now())::bigint::text || '-' || left(gen_random_uuid()::text,8)),
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content      text not null default '',
  cover_image  text,
  author_name  text not null default 'GlowDesk Editör',
  author_role  text not null default 'editor',         -- admin | editor
  category     text not null default 'Genel',
  status       text not null default 'published',      -- draft | published
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- G) Ödeme ve Abonelik Logları (Payment Logs)
create table public.payment_logs (
  id             text primary key default ('pay-' || extract(epoch from now())::bigint::text || '-' || left(gen_random_uuid()::text,8)),
  tenant_id      text references public.tenants(id) on delete set null,
  tenant_name    text,
  amount         numeric(10,2) not null,
  plan           text,
  payment_method text not null default 'iyzico_credit_card',
  status         text not null default 'success',      -- success | failed | pending
  created_at     timestamptz not null default now()
);

-- ==============================================================================
-- 4. İNDEKSLER (Performans)
-- ==============================================================================
create index idx_tenants_slug        on public.tenants(slug);
create index idx_tenants_city        on public.tenants(city);
create index idx_tenants_status      on public.tenants(status);
create index idx_profiles_email      on public.profiles(email);
create index idx_profiles_tenant     on public.profiles(tenant_id);
create index idx_profiles_role       on public.profiles(role);
create index idx_customers_tenant    on public.customers(tenant_id);
create index idx_appointments_tenant on public.appointments(tenant_id);
create index idx_appointments_status on public.appointments(status);
create index idx_posts_slug          on public.posts(slug);
create index idx_posts_status        on public.posts(status);

-- ==============================================================================
-- 5. UPDATED_AT TETİKLEYİCİLERİ (Otomatik tarih güncelleme)
-- ==============================================================================
create trigger trg_tenants_updated_at  before update on public.tenants  for each row execute procedure public.handle_updated_at();
create trigger trg_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger trg_customers_updated_at before update on public.customers for each row execute procedure public.handle_updated_at();
create trigger trg_posts_updated_at    before update on public.posts     for each row execute procedure public.handle_updated_at();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) — Tam Açık API Erişimi (Anon Key ile)
-- ==============================================================================
alter table public.tenants       enable row level security;
alter table public.profiles      enable row level security;
alter table public.customers     enable row level security;
alter table public.services      enable row level security;
alter table public.appointments  enable row level security;
alter table public.posts         enable row level security;
alter table public.payment_logs  enable row level security;

-- Tüm tablolara tam CRUD erişimi (anon key ile frontend tarafından yönetilir)
create policy "tenants_all"      on public.tenants       for all using (true) with check (true);
create policy "profiles_all"     on public.profiles      for all using (true) with check (true);
create policy "customers_all"    on public.customers     for all using (true) with check (true);
create policy "services_all"     on public.services      for all using (true) with check (true);
create policy "appointments_all" on public.appointments  for all using (true) with check (true);
create policy "posts_all"        on public.posts         for all using (true) with check (true);
create policy "payment_logs_all" on public.payment_logs  for all using (true) with check (true);

-- ==============================================================================
-- 7. GÜVENLİ ŞİFRE RPC FONKSİYONLARI (BCRYPT / PGCRYPTO)
-- ==============================================================================

-- A) Şifre Doğrulama RPC
create or replace function public.verify_password(input_password text, hashed_password text)
returns boolean as $$
begin
  if hashed_password is null or input_password is null then
    return false;
  end if;
  return hashed_password = crypt(input_password, hashed_password);
end;
$$ language plpgsql security definer;

-- B) Güvenli Kullanıcı Kaydı RPC (Şifreyi Hash'leyerek Yazar)
create or replace function public.register_user_with_password(
  p_id text,
  p_tenant_id text,
  p_full_name text,
  p_email text,
  p_phone text,
  p_role text,
  p_password text
)
returns jsonb as $$
declare
  new_profile public.profiles%rowtype;
begin
  insert into public.profiles (
    id, tenant_id, full_name, email, phone, role, password_hash, status
  ) values (
    p_id, p_tenant_id, p_full_name, p_email, p_phone, p_role, crypt(p_password, gen_salt('bf', 10)), 'active'
  )
  returning * into new_profile;

  return to_jsonb(new_profile);
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 8. VARSAYILAN SUPER ADMIN HESABI (Seed Data)
-- E-posta: admin@glowdesk.com
-- Şifre: Admin1234! (bcrypt hash)
-- ==============================================================================
insert into public.profiles (
  id,
  full_name,
  email,
  password_hash,
  role,
  status
) values (
  'usr-superadmin-glowdesk',
  'GlowDesk Super Admin',
  'admin@glowdesk.com',
  crypt('Admin1234!', gen_salt('bf', 10)),
  'admin',
  'active'
) on conflict (email) do update
  set role   = 'admin',
      status = 'active',
      password_hash = crypt('Admin1234!', gen_salt('bf', 10));
