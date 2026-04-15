-- Durham Stickmakers — Seed Data
-- Migration: 20260415120002_stick-seed-data.sql

-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO stick_categories (name, slug, description, display_order) VALUES
  ('Shepherds Crooks',  'shepherds-crooks',  'The classic crook shape, traditionally dressed from ram or buffalo horn on a hazel shank. Used by shepherds for centuries to catch sheep by the neck.', 1),
  ('Thumbsticks',       'thumbsticks',       'A V-shaped head that sits between thumb and forefinger. Popular with walkers, shooters, and country folk. Often made with a natural fork or horn V.', 2),
  ('Derby Walkers',     'derby-walkers',     'The curved derby handle — elegant, comfortable, and easy to hook over an arm. A classic gentleman''s walking stick shape.', 3),
  ('Knob Sticks',       'knob-sticks',       'A simple rounded knob head, often turned from wood or topped with antler. Clean, understated, and very comfortable to grip.', 4),
  ('Market Sticks',     'market-sticks',     'Similar to a shepherds crook but with a wider, flatter nose. Originally used at livestock markets. A beautiful dressed stick.', 5),
  ('Walking Staffs',    'walking-staffs',    'A taller stick for serious walkers and hikers. Often with an antler or wooden top and a spiked ferrule for rough terrain.', 6),
  ('Carved Sticks',     'carved-sticks',     'Sticks with hand-carved animal heads, birds, fish, or decorative motifs. The pinnacle of the stickmaker''s art.', 7),
  ('Stick-Making Supplies', 'supplies',      'Shanks, horns, blanks, ferrules, collars, tools, and materials for fellow stickmakers.', 8);

-- ============================================================
-- MATERIALS
-- ============================================================

-- Shank woods
INSERT INTO stick_materials (name, material_type, description) VALUES
  ('Hazel',     'shank', 'The most traditional shank wood. Strong, straight-grained, and takes a beautiful finish. Grows abundantly in County Durham.'),
  ('Holly',     'shank', 'A dense, hard wood with a pale colour and fine grain. Makes a very strong, elegant shank.'),
  ('Chestnut',  'shank', 'Sweet chestnut — a durable wood with attractive grain. Slightly heavier than hazel.'),
  ('Ash',       'shank', 'A tough, flexible wood with a long grain. Excellent for staffs and hiking sticks.'),
  ('Blackthorn','shank', 'A dark, dense wood prized for its character. The traditional Irish shillelagh wood.');

-- Handle materials
INSERT INTO stick_materials (name, material_type, description) VALUES
  ('Ram Horn',      'handle', 'The traditional crook material. Each horn is unique in colour — from pale cream to deep amber with dark veining.'),
  ('Buffalo Horn',  'handle', 'Black buffalo horn — an increasingly popular alternative to ram horn. Dense, polishes beautifully, very strong.'),
  ('Deer Antler',   'handle', 'Roe buck or red deer antler. Natural, textured, and distinctive. Each piece is completely unique.'),
  ('Stag Horn',     'handle', 'Red deer stag antler — larger and more dramatic than roe buck. Excellent for thumbstick heads and knob tops.'),
  ('Carved Wood',   'handle', 'Hand-carved from seasoned hardwood. Allows the maker to create animals, birds, and decorative forms.');

-- Collar materials
INSERT INTO stick_materials (name, material_type, description) VALUES
  ('Brass',   'collar', 'Polished brass collar — the traditional choice. Develops a warm patina with age.'),
  ('Nickel',  'collar', 'Bright nickel silver collar — a clean, contemporary look.'),
  ('Copper',  'collar', 'Polished copper collar — warm toned, develops a distinctive green patina over time.'),
  ('Horn',    'collar', 'A collar turned from horn — a more subtle, natural-looking joint between handle and shank.');

-- ============================================================
-- SITE CONFIG
-- ============================================================

INSERT INTO stick_site_config (key, value) VALUES
  ('charity_number', '"1212357"'),
  ('charity_name', '"Durham Stick Makers"'),
  ('contact_email', '"info@durham-stickmakers.com"'),
  ('workshop_address', '{"line1": "Fencehouses Community Centre", "line2": "Fencehouses", "town": "Houghton le Spring", "county": "County Durham", "postcode": "DH4 6DS"}'::jsonb),
  ('opening_hours', '{"regular_sessions": [{"day": "Monday", "start": "18:00", "end": "21:00"}, {"day": "Tuesday", "start": "18:00", "end": "21:00"}], "note": "Drop-in welcome. Kettle is always on."}'::jsonb),
  ('social_links', '{"instagram": "https://instagram.com/durham_stickmakers", "facebook": "https://facebook.com/Durham Stickmakers"}'::jsonb),
  ('shipping_rates', '{"standard_pence": 895, "oversized_pence": 1495, "collection_pence": 0, "free_threshold_pence": 15000}'::jsonb),
  ('donation_cta', '"Help us preserve an endangered heritage craft and provide walking sticks to those who need them most."'),
  ('hero_headline', '"Shaped by hand. Rooted in tradition."'),
  ('hero_subtitle', '"Preserving the endangered art of stick making — teaching, making, and giving sticks to those who need them most."');
