-- Durham Stickmakers — Row Level Security Policies
-- Migration: 20260415120001_stick-rls-policies.sql

-- Enable RLS on all tables
ALTER TABLE stick_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_makers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_workshop_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE stick_contact_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC READ POLICIES (anon + authenticated)
-- ============================================================

-- Categories: always public
CREATE POLICY stick_categories_select_policy ON stick_categories FOR SELECT USING (true);

-- Materials: always public
CREATE POLICY stick_materials_select_policy ON stick_materials FOR SELECT USING (true);

-- Makers: active only
CREATE POLICY stick_makers_select_policy ON stick_makers FOR SELECT USING (is_active = true);

-- Products: published only for public
CREATE POLICY stick_products_select_public ON stick_products FOR SELECT
  USING (status IN ('published', 'sold'));

-- Product images: public if product is published/sold
CREATE POLICY stick_product_images_select_policy ON stick_product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stick_products
      WHERE stick_products.id = stick_product_images.product_id
      AND stick_products.status IN ('published', 'sold')
    )
  );

-- Workshops: upcoming or completed
CREATE POLICY stick_workshops_select_policy ON stick_workshops FOR SELECT
  USING (status IN ('upcoming', 'fully_booked', 'completed'));

-- Blog posts: published only
CREATE POLICY stick_blog_posts_select_policy ON stick_blog_posts FOR SELECT
  USING (status = 'published');

-- Pages: always public
CREATE POLICY stick_pages_select_policy ON stick_pages FOR SELECT USING (true);

-- Site config: always public
CREATE POLICY stick_site_config_select_policy ON stick_site_config FOR SELECT USING (true);

-- Gallery: always public
CREATE POLICY stick_gallery_images_select_policy ON stick_gallery_images FOR SELECT USING (true);

-- ============================================================
-- ADMIN WRITE POLICIES (authenticated only)
-- ============================================================

-- Helper: all admin write policies use auth.role() = 'authenticated'

-- Categories
CREATE POLICY stick_categories_insert_policy ON stick_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY stick_categories_update_policy ON stick_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY stick_categories_delete_policy ON stick_categories FOR DELETE USING (auth.role() = 'authenticated');

-- Materials
CREATE POLICY stick_materials_insert_policy ON stick_materials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY stick_materials_update_policy ON stick_materials FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY stick_materials_delete_policy ON stick_materials FOR DELETE USING (auth.role() = 'authenticated');

-- Makers (admin sees all, including inactive)
CREATE POLICY stick_makers_select_admin ON stick_makers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY stick_makers_insert_policy ON stick_makers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY stick_makers_update_policy ON stick_makers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY stick_makers_delete_policy ON stick_makers FOR DELETE USING (auth.role() = 'authenticated');

-- Products (admin sees all statuses)
CREATE POLICY stick_products_select_admin ON stick_products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY stick_products_insert_policy ON stick_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY stick_products_update_policy ON stick_products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY stick_products_delete_policy ON stick_products FOR DELETE USING (auth.role() = 'authenticated');

-- Product images (admin sees all)
CREATE POLICY stick_product_images_select_admin ON stick_product_images FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY stick_product_images_insert_policy ON stick_product_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY stick_product_images_update_policy ON stick_product_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY stick_product_images_delete_policy ON stick_product_images FOR DELETE USING (auth.role() = 'authenticated');

-- Orders (admin read/update, anon insert via webhooks handled by service role)
CREATE POLICY stick_orders_select_policy ON stick_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY stick_orders_update_policy ON stick_orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Donations (admin read only)
CREATE POLICY stick_donations_select_policy ON stick_donations FOR SELECT USING (auth.role() = 'authenticated');

-- Workshops
CREATE POLICY stick_workshops_select_admin ON stick_workshops FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY stick_workshops_insert_policy ON stick_workshops FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY stick_workshops_update_policy ON stick_workshops FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY stick_workshops_delete_policy ON stick_workshops FOR DELETE USING (auth.role() = 'authenticated');

-- Workshop bookings
CREATE POLICY stick_bookings_select_policy ON stick_workshop_bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY stick_bookings_update_policy ON stick_workshop_bookings FOR UPDATE USING (auth.role() = 'authenticated');

-- Blog posts (admin sees drafts too)
CREATE POLICY stick_blog_select_admin ON stick_blog_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY stick_blog_insert_policy ON stick_blog_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY stick_blog_update_policy ON stick_blog_posts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY stick_blog_delete_policy ON stick_blog_posts FOR DELETE USING (auth.role() = 'authenticated');

-- Pages
CREATE POLICY stick_pages_insert_policy ON stick_pages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY stick_pages_update_policy ON stick_pages FOR UPDATE USING (auth.role() = 'authenticated');

-- Site config
CREATE POLICY stick_site_config_insert_policy ON stick_site_config FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY stick_site_config_update_policy ON stick_site_config FOR UPDATE USING (auth.role() = 'authenticated');

-- Gallery
CREATE POLICY stick_gallery_insert_policy ON stick_gallery_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY stick_gallery_update_policy ON stick_gallery_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY stick_gallery_delete_policy ON stick_gallery_images FOR DELETE USING (auth.role() = 'authenticated');

-- Contact submissions
CREATE POLICY stick_contact_insert_policy ON stick_contact_submissions FOR INSERT WITH CHECK (true); -- anyone can submit
CREATE POLICY stick_contact_select_policy ON stick_contact_submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY stick_contact_update_policy ON stick_contact_submissions FOR UPDATE USING (auth.role() = 'authenticated');
