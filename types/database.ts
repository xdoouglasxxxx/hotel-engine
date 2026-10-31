export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Room {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  images: string[];
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Booking {
  id: string;
  room_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  total_price: number;
  status: BookingStatus;
  notes: string | null;
  cancel_reason: string | null;
  cancelled_by: 'owner' | 'guest' | null;
  cancelled_at: string | null;
  cancel_token: string;
  created_at: string;
  updated_at: string;
  rooms?: Pick<Room, 'name'>;
}

export interface BlockedDate {
  id: string;
  room_id: string;
  date: string;
  reason: string | null;
  created_at: string;
}

// Linha única de configuração do hotel (migração _site_settings). Lida pelo público (anon).
export interface SiteSettings {
  id: string;
  published: boolean;
  name: string;
  tagline: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  phone_public: string | null;
  email_public: string | null;
  instagram: string | null;
  domain: string | null;
  logo_path: string | null;
  hero_image_path: string | null;
  currency: 'BRL';
  timezone: string;
  checkin_time: string;
  checkout_time: string;
  min_nights: number;
  cancellation_free_days: number | null;
  created_at: string;
  updated_at: string;
}

// SQLSTATE levantados pelo trigger enforce_booking_policy (migração _booking_policy).
export const BOOKING_POLICY_ERROR = {
  MIN_NIGHTS: 'HE001',
  CANCEL_WINDOW_CLOSED: 'HE002',
} as const;

export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
  active: boolean;
  created_at: string;
}
