-- Durham Stickmakers — Storage Bucket
-- Migration: 20260415120003_stick-storage-bucket.sql

-- Create storage bucket for product/gallery/blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stick-images',
  'stick-images',
  true,
  10485760, -- 10MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);

-- Public read access
CREATE POLICY stick_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'stick-images');

-- Authenticated write access
CREATE POLICY stick_images_auth_insert ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'stick-images' AND auth.role() = 'authenticated');

CREATE POLICY stick_images_auth_update ON storage.objects
  FOR UPDATE USING (bucket_id = 'stick-images' AND auth.role() = 'authenticated');

CREATE POLICY stick_images_auth_delete ON storage.objects
  FOR DELETE USING (bucket_id = 'stick-images' AND auth.role() = 'authenticated');
