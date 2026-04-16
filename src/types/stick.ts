// Durham Stickmakers - TypeScript Types
// Generated to match stick_ prefixed Supabase schema

export type ProductType = 'one_of_a_kind' | 'supply' | 'gift_voucher' | 'workshop';
export type ProductStatus = 'draft' | 'published' | 'sold' | 'archived';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type WorkshopStatus = 'upcoming' | 'fully_booked' | 'completed' | 'cancelled';
export type BlogStatus = 'draft' | 'published';
export type ShippingClass = 'standard' | 'oversized' | 'digital' | 'collection';
export type MaterialType = 'shank' | 'handle' | 'collar';

export interface StickCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface StickMaterial {
  id: string;
  name: string;
  material_type: MaterialType;
  description: string | null;
  created_at: string;
}

export interface StickMaker {
  id: string;
  name: string;
  bio: string | null;
  photo_path: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface StickProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_pence: number;
  product_type: ProductType;
  status: ProductStatus;
  category_id: string | null;
  maker_id: string | null;
  handle_material: string | null;
  shank_material: string | null;
  collar_material: string | null;
  length_inches: number | null;
  weight_description: string | null;
  stock_count: number;
  is_featured: boolean;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  shipping_class: ShippingClass;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations (optional, populated by queries)
  category?: StickCategory;
  maker?: StickMaker;
  images?: StickProductImage[];
}

export interface StickProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface StickOrder {
  id: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  total_pence: number;
  shipping_pence: number;
  status: OrderStatus;
  shipping_address: ShippingAddress | null;
  items: OrderItem[];
  notes: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export interface OrderItem {
  product_id: string;
  title: string;
  price_pence: number;
  quantity: number;
  image_url?: string;
}

export interface StickDonation {
  id: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  donor_email: string | null;
  donor_name: string | null;
  amount_pence: number;
  is_recurring: boolean;
  gift_aid: boolean;
  gift_aid_name: string | null;
  gift_aid_address: ShippingAddress | null;
  message: string | null;
  created_at: string;
}

export interface StickWorkshop {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  spots_remaining: number;
  price_pence: number;
  location: string;
  status: WorkshopStatus;
  stripe_price_id: string | null;
  featured_image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface StickWorkshopBooking {
  id: string;
  workshop_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  attendees: number;
  stripe_session_id: string | null;
  status: 'confirmed' | 'cancelled' | 'no_show';
  created_at: string;
  workshop?: StickWorkshop;
}

export interface StickBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image_path: string | null;
  author: string | null;
  category: string | null;
  status: BlogStatus;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StickPage {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_description: string | null;
  updated_at: string;
}

export interface StickSiteConfig {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface StickGalleryImage {
  id: string;
  storage_path: string;
  title: string | null;
  description: string | null;
  category: string | null;
  maker_id: string | null;
  display_order: number;
  created_at: string;
  maker?: StickMaker;
}

export interface StickContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ============================================================
// Utility types
// ============================================================

/** Format pence as £ string */
export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

/** Get public URL for a storage path */
export function getImageUrl(storagePath: string, supabaseUrl: string): string {
  return `${supabaseUrl}/storage/v1/object/public/stick-images/${storagePath}`;
}

/** Product type display labels */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  one_of_a_kind: 'One of a kind',
  supply: 'Supply',
  gift_voucher: 'Gift voucher',
  workshop: 'Workshop',
};

/** Order status display labels */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};
