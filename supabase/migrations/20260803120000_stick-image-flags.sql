-- Durham Stickmakers — Image quality flags
-- Migration: 20260803120000_stick-image-flags.sql
--
-- Lets the owner mark any image as still needing work, so the admin has one
-- list of what has to be upscaled, remade or replaced.
--
-- Flags key on storage_path rather than on a row in any one table, so a single
-- flag covers an image wherever it is used — product images, gallery images,
-- member photos, blog and workshop featured images all live in the same
-- stick-images bucket and share the same path space. It also means a flag
-- survives a product image being reordered or re-attached.

CREATE TYPE stick_image_flag_reason AS ENUM ('upscale', 'remake', 'replace', 'retouch');

CREATE TABLE stick_image_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL UNIQUE,
  reason stick_image_flag_reason NOT NULL DEFAULT 'upscale',
  note TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- The admin list filters on resolved and groups by reason
CREATE INDEX idx_stick_image_flags_resolved ON stick_image_flags(resolved, reason);

CREATE TRIGGER stick_image_flags_updated BEFORE UPDATE ON stick_image_flags
  FOR EACH ROW EXECUTE FUNCTION stick_set_updated_at();

-- ============================================================
-- RLS — admin only, no public read
-- ============================================================
-- These are internal production notes ("this one is too soft to print"), not
-- content. Unlike the other stick_ tables there is deliberately no anon SELECT.

ALTER TABLE stick_image_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY stick_image_flags_select_policy ON stick_image_flags FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY stick_image_flags_insert_policy ON stick_image_flags FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY stick_image_flags_update_policy ON stick_image_flags FOR UPDATE
  USING (auth.role() = 'authenticated');
CREATE POLICY stick_image_flags_delete_policy ON stick_image_flags FOR DELETE
  USING (auth.role() = 'authenticated');
