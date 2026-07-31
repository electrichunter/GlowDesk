// GlowDesk — TypeScript Domain Interface Definitions

import type { VerticalKey } from './verticals/types';

export type { VerticalKey };

export type BusinessSector = 'beauty' | 'spa' | 'clinic' | 'barber' | 'massage' | 'hukuk' | 'restoran' | 'salon';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export type UserRole = 'owner' | 'staff' | 'customer';

export interface Workstation {
  id: string;
  name: string; // e.g. "1. Koltuk / Masa", "2. Koltuk / Masa", "VİP Bakım Odası A"
  type?: 'chair' | 'room' | 'table';
  staff_name?: string;
  is_active: boolean;
}

export interface LunchBreak {
  enabled: boolean;
  start: string; // e.g. "12:30"
  end: string;   // e.g. "13:30"
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  district: string;
  neighborhood?: string;
  street?: string;
  address?: string;
  phone?: string;
  is_main?: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
}

export interface TenantSettings {
  description?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  street?: string;
  lat?: number;
  lng?: number;
  logo_url?: string;
  rating?: number;
  review_count?: number;
  gender_focus?: 'male' | 'female' | 'unisex';
  staff_count?: number;
  workstations?: Workstation[];
  lunch_break?: LunchBreak;
  branches?: Branch[];
  sms_sender_header?: string;
  api_keys?: ApiKey[];
  webhook_url?: string;
  parking_available?: boolean;
  instagram?: string;
  working_hours?: {
    [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']?: {
      open: boolean;
      start: string;
      end: string;
    };
  };
}

export interface Tenant {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  sector: BusinessSector;
  vertical?: VerticalKey;
  subscription_tier: SubscriptionTier;
  free_until?: string; // e.g. "2028-01-01"
  settings: TenantSettings;
}

export interface RoleDefinition {
  id: string;
  name: UserRole | string;
  display_name: string;
  description?: string;
  permissions?: string[];
  created_at?: string;
}

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
  role_id?: string;
  role_detail?: RoleDefinition;
  tenant_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  notes?: string;
  imported_from?: 'excel' | 'manual' | 'contacts';
  is_blacklisted?: boolean;
  appointment_count?: number;
  no_show_count?: number;
  created_at: string;
  updated_at: string;
  last_appointment?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  author_name: string;
  category: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  duration_minutes: number;
  price?: number;
  currency?: string;
  created_at: string;
  is_active?: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Appointment {
  id: string;
  tenant_id: string;
  customer_id: string;
  service_id?: string;
  vertical?: VerticalKey;
  sector_data?: Record<string, any>;
  guest_count?: number;
  deposit_paid?: boolean;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  customer?: Customer;
  service?: Service;
  service_name?: string;
  date?: string;
  time?: string;
  price?: number;
}

export interface WaitlistEntry {
  id: string;
  tenant_id: string;
  customer_id?: string;
  customer: {
    full_name: string;
    phone?: string;
  };
  preferred_date: string;
  preferred_time_start: string;
  preferred_time_end: string;
  service_id?: string;
  service?: Service;
  status: 'waiting' | 'offered' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface DashboardStats {
  today_appointments: number;
  today_confirmed: number;
  today_no_show: number;
  today_empty_slots: number;
  monthly_revenue: number;
  monthly_appointments: number;
  no_show_rate: number;
  waitlist_count: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'appointment_created' | 'appointment_cancelled' | 'appointment_reminder' | 'waitlist_offer';
  title: string;
  message: string;
  related_appointment_id?: string;
  read: boolean;
  created_at: string;
}
