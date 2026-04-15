-- Durham Stickmakers — Core Schema
-- All tables prefixed with stick_ to coexist on shared Supabase instance
-- Migration: 20260415120000_stick-core-schema.sql

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE stick_product_type AS ENUM (
  'one_of_a_kind',
  'supply',
  'gift_voucher',
  'workshop'
);

CREATE TYPE stick_product_status AS ENUM (
  'draft',
  'published',
  'sold',
  'archived'
);

CREATE TYPE stick_order_status AS ENUM (
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE stick_workshop_status AS ENUM (
  'upcoming',
  'fully_booked',
  'completed',
  'cancelled'
);

CREATE TYPE stick_blog_status AS ENUM (
  'draft',
  'published'
);

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE stick_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- MATERIALS (reference table for filtering)
-- ============================================================

CREATE TABLE stick_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  material_type TEXT NOT NULL CHECK (material_type IN ('shank', 'handle', 'collar')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- MAKERS (member attribution)
-- ============================================================

CREATE TABLE stick_makers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  photo_path TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PRODUCTS (core shop listing)
-- ============================================================

CREATE TABLE stick_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_pence INT NOT NULL CHECK (price_pence >= 0),
  product_type stick_product_type NOT NULL DEFAULT 'one_of_a_kind',
  status stick_product_status NOT NULL DEFAULT 'draft',
  category_id UUID REFERENCES stick_categories(id) ON DELETE SET NULL,
  maker_id UUID REFERENCES stick_makers(id) ON DELETE SET NULL,
  handle_material TEXT,
  shank_material TEXT,
  collar_material TEXT,
  length_inches INT,
  weight_description TEXT,
  stock_count INT DEFAULT 1 CHECK (stock_count >= 0),
  is_featured BOOLEAN DEFAULT false,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  shipping_class TEXT DEFAULT 'standard' CHECK (shipping_class IN ('standard', 'oversized', 'digital', 'collection')),
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stick_products_status ON stick_products(status);
CREATE INDEX idx_stick_products_category ON stick_products(category_id);
CREATE INDEX idx_stick_products_type ON stick_products(product_type);
CREATE INDEX idx_stick_products_featured ON stick_products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_stick_products_slug ON stick_products(slug);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

CREATE TABLE stick_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES stick_products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stick_product_images_product ON stick_product_images(product_id);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE stick_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  total_pence INT NOT NULL,
  shipping_pence INT DEFAULT 0,
  status stick_order_status DEFAULT 'pending',
  shipping_address JSONB,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stick_orders_status ON stick_orders(status);
CREATE INDEX idx_stick_orders_email ON stick_orders(customer_email);

-- ============================================================
-- DONATIONS
-- ============================================================

CREATE TABLE stick_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  donor_email TEXT,
  donor_name TEXT,
  amount_pence INT NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  gift_aid BOOLEAN DEFAULT false,
  gift_aid_name TEXT,
  gift_aid_address JSONB,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- WORKSHOPS
-- ============================================================

CREATE TABLE stick_workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INT NOT NULL DEFAULT 10,
  spots_remaining INT NOT NULL DEFAULT 10,
  price_pence INT NOT NULL DEFAULT 0,
  location TEXT DEFAULT 'Fencehouses Community Centre, DH4 6DS',
  status stick_workshop_status DEFAULT 'upcoming',
  stripe_price_id TEXT,
  featured_image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stick_workshops_date ON stick_workshops(date);
CREATE INDEX idx_stick_workshops_status ON stick_workshops(status);

-- ============================================================
-- WORKSHOP BOOKINGS
-- ============================================================

CREATE TABLE stick_workshop_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES stick_workshops(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  attendees INT DEFAULT 1,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'no_show')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stick_bookings_workshop ON stick_workshop_bookings(workshop_id);

-- ============================================================
-- BLOG POSTS
-- ============================================================

CREATE TABLE stick_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image_path TEXT,
  author TEXT,
  category TEXT,
  status stick_blog_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stick_blog_status ON stick_blog_posts(status);
CREATE INDEX idx_stick_blog_published ON stick_blog_posts(published_at DESC);

-- ============================================================
-- STATIC PAGES (CMS-lite)
-- ============================================================

CREATE TABLE stick_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  meta_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SITE CONFIG (key-value store)
-- ============================================================

CREATE TABLE stick_site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- GALLERY (standalone images not tied to products)
-- ============================================================

CREATE TABLE stick_gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT,
  maker_id UUID REFERENCES stick_makers(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CONTACT SUBMISSIONS
-- ============================================================

CREATE TABLE stick_contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION stick_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER stick_categories_updated BEFORE UPDATE ON stick_categories FOR EACH ROW EXECUTE FUNCTION stick_set_updated_at();
CREATE TRIGGER stick_makers_updated BEFORE UPDATE ON stick_makers FOR EACH ROW EXECUTE FUNCTION stick_set_updated_at();
CREATE TRIGGER stick_products_updated BEFORE UPDATE ON stick_products FOR EACH ROW EXECUTE FUNCTION stick_set_updated_at();
CREATE TRIGGER stick_orders_updated BEFORE UPDATE ON stick_orders FOR EACH ROW EXECUTE FUNCTION stick_set_updated_at();
CREATE TRIGGER stick_workshops_updated BEFORE UPDATE ON stick_workshops FOR EACH ROW EXECUTE FUNCTION stick_set_updated_at();
CREATE TRIGGER stick_blog_posts_updated BEFORE UPDATE ON stick_blog_posts FOR EACH ROW EXECUTE FUNCTION stick_set_updated_at();
CREATE TRIGGER stick_site_config_updated BEFORE UPDATE ON stick_site_config FOR EACH ROW EXECUTE FUNCTION stick_set_updated_at();

-- ============================================================
-- AUTO-GENERATE SLUG FROM TITLE
-- ============================================================

CREATE OR REPLACE FUNCTION stick_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(regexp_replace(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
    -- Append short random suffix to avoid collisions
    NEW.slug = NEW.slug || '-' || substr(gen_random_uuid()::text, 1, 4);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stick_products_slug BEFORE INSERT ON stick_products FOR EACH ROW EXECUTE FUNCTION stick_generate_slug();
CREATE TRIGGER stick_workshops_slug BEFORE INSERT ON stick_workshops FOR EACH ROW EXECUTE FUNCTION stick_generate_slug();
CREATE TRIGGER stick_blog_posts_slug BEFORE INSERT ON stick_blog_posts FOR EACH ROW EXECUTE FUNCTION stick_generate_slug();
