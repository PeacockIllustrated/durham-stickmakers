# Durham Stickmakers — Website Rebuild

## Project Overview

A website rebuild for **Durham Stick Makers** (Registered Charity 1212357), a County Durham charity dedicated to preserving the endangered heritage craft of stick making. The rebuild replaces a basic Webador brochure site with a full Next.js application including an online shop, donation support, workshop booking, and an owner-managed product listing system.

The site serves three audiences: **visitors** who want to learn about the craft, buy sticks, or attend workshops; **the charity owner** who needs a simple admin interface to add/manage shop listings with photos; and **search engines** where local SEO for walking stick/heritage craft queries in the North East is critical.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (shared instance — ALL migrations MUST use the `stick-` prefix for table names)
- **Auth:** Supabase Auth (owner login only — no public user accounts)
- **Payments:** Stripe Checkout (shop purchases + donations)
- **Image Storage:** Supabase Storage (bucket: `stick-images`)
- **Hosting:** Vercel
- **Styling:** Tailwind CSS v3 with custom design tokens (see Design System below)
- **Fonts:** DM Serif Display (headings) + Inter (body) via `next/font/google`

## Critical Constraint: Database Table Prefix

This project shares a Supabase instance with other Onesign projects. **Every single table, function, trigger, policy, and migration file MUST be prefixed with `stick-` or `stick_`.**

Migration file naming: `YYYYMMDDHHMMSS_stick-<description>.sql`
Table naming: `stick_products`, `stick_categories`, `stick_images`, etc.
RLS policy naming: `stick_<table>_<action>_policy`

**Never create unprefixed tables. Never reference tables from other projects.**

## Database Schema

See `supabase/migrations/` for the full schema. Key tables:

### stick_categories
Stick types: Shepherds Crook, Thumbstick, Derby Walker, Knob Stick, Market Stick, Staff, etc.

### stick_materials
Materials used: Hazel, Holly, Chestnut, Ash (shanks); Ram Horn, Buffalo Horn, Antler, Wood (handles); Brass, Nickel, Copper (collars).

### stick_makers
Members who make sticks. Name, bio, photo_url. Used for attribution on product listings.

### stick_products
The core shop listing table. Each product is a one-of-a-kind item (or a supply with stock count).

Key fields:
- `title`, `slug` (auto-generated), `description`
- `price_pence` (integer, stored in pence to avoid float issues)
- `category_id` → stick_categories
- `maker_id` → stick_makers (nullable for supplies)
- `product_type`: enum `'one_of_a_kind' | 'supply' | 'gift_voucher' | 'workshop'`
- `status`: enum `'draft' | 'published' | 'sold' | 'archived'`
- `is_featured` (boolean, for homepage carousel)
- `handle_material`, `shank_material`, `collar_material` (text fields for filtering)
- `length_inches` (nullable integer)
- `stock_count` (integer, default 1 for one-of-a-kind items)
- `stripe_price_id` (nullable, synced on publish)

### stick_product_images
Multiple images per product. Fields: `product_id`, `storage_path`, `alt_text`, `display_order`, `is_primary`.

### stick_orders
Order tracking. Fields: `stripe_session_id`, `customer_email`, `customer_name`, `total_pence`, `status`, `shipping_address` (jsonb), `items` (jsonb array of product snapshots).

### stick_donations
Donation tracking. Fields: `stripe_session_id`, `donor_email`, `donor_name`, `amount_pence`, `is_recurring`, `gift_aid` (boolean), `message`.

### stick_workshops
Workshop/event listings. Fields: `title`, `description`, `date`, `start_time`, `end_time`, `capacity`, `spots_remaining`, `price_pence`, `location`, `status`.

### stick_workshop_bookings
Booking records. Fields: `workshop_id`, `customer_email`, `customer_name`, `attendees` (integer), `stripe_session_id`, `status`.

### stick_pages
CMS-lite for static page content (About, The Craft, etc.). Fields: `slug`, `title`, `content` (rich text as HTML), `meta_description`.

### stick_blog_posts
Blog content. Fields: `slug`, `title`, `content`, `excerpt`, `featured_image_path`, `author`, `category`, `status` ('draft' | 'published'), `published_at`.

### stick_site_config
Key-value config store. Fields: `key` (unique), `value` (jsonb). Used for: charity_number, contact_email, workshop_address, social_links, opening_hours, donation_cta_text.

## RLS Policies

- All `stick_*` tables: public `SELECT` for published/active records
- All `stick_*` tables: `INSERT`, `UPDATE`, `DELETE` restricted to authenticated users (owner only)
- `stick_orders`, `stick_donations`, `stick_workshop_bookings`: `INSERT` allowed for anon (created via Stripe webhooks or server actions)
- `stick_product_images`: public `SELECT`, authenticated `INSERT`/`UPDATE`/`DELETE`
- Storage bucket `stick-images`: public read, authenticated write

## Design System

### Colour Tokens (Tailwind extend)

```js
// tailwind.config.js colors
// Palette note: original brown/walnut hues were replaced with slate-blue hues
// pulled from the brand's existing site. Token names are kept for minimal-diff
// migration — "walnut" now refers to a deep slate, "driftwood" to a muted slate, etc.
// Brass (gold/amber) is retained as the accent — slate + brass is a classic heritage combo.
stick: {
  walnut:    '#2F3842',  // Deep slate — headlines, nav, dark UI, primary buttons
  shale:     '#4A5563',  // Medium slate — body text
  linen:     '#FAFAF8',  // Warm off-white — primary background
  brass:     '#C4A265',  // Brass / amber — primary accent, CTAs, links, hover
  stone:     '#E4E7EC',  // Cool pale grey — cards, secondary backgrounds, dividers
  fell:      '#3D5E4A',  // Heritage green — success states, secondary accent
  driftwood: '#7A8593',  // Muted slate — metadata, borders
  cream:     '#EEF0F3',  // Cool pale — tags, badges, subtle fills
}
```

### Typography

```js
// Font pairing
heading: 'DM Serif Display'   // All headings, product titles, hero text
body: 'Inter'                  // Body copy, UI elements, navigation
accent: 'Inter (caps, tracking)' // Labels, category tags, metadata
```

### Design Principles

1. **Clean and warm** — White-dominant (#FAFAF8) backgrounds with warm accents, not a cream/brown immersion
2. **Let photography lead** — Large product images, workshop candids, close-up material textures
3. **Heritage without heaviness** — DM Serif for character, Inter for clarity. No faux-rustic textures
4. **One-of-a-kind feel** — Every product card shows maker attribution and a "One of a kind" badge for handmade items
5. **Charity credibility** — Charity number in footer, donation pathway accessible but not pushy, impact stories not guilt

### Component Patterns

- **Product cards:** Image (aspect 4:3) → Title (DM Serif) → Maker name (Inter, driftwood) → Price (Inter 600) + type badge
- **Hero sections:** Dark walnut background, brass accent text, DM Serif headline, Inter subtitle
- **CTA buttons:** Primary = walnut bg + linen text (hover: brass bg). Secondary = outline with walnut border
- **Category pills:** cream bg (#F0EDE7) + driftwood text
- **Navigation:** Clean white bar, DM Serif logo left, Inter links, brass highlight for active state

## Route Structure

```
/                          → Homepage (hero, featured sticks, next workshop, donation CTA)
/about                     → About the charity, members, mission
/the-craft                 → Educational: stick types, materials, process, anatomy
/the-craft/[slug]          → Individual craft article
/gallery                   → Filterable image gallery
/shop                      → Product grid with category/material filters
/shop/[slug]               → Product detail page
/workshops                 → Workshop calendar and booking
/workshops/[slug]          → Individual workshop detail + booking
/blog                      → Blog listing
/blog/[slug]               → Blog post
/support-us                → Donate, membership, volunteer, Gift Aid
/contact                   → Contact form + map + hours
/privacy                   → Privacy policy
/terms                     → Terms & conditions
/delivery                  → Delivery & returns

/admin                     → Owner dashboard (auth required)
/admin/products            → Product listing management
/admin/products/new        → Add new product (the key flow — see below)
/admin/products/[id]/edit  → Edit existing product
/admin/workshops           → Workshop management
/admin/orders              → Order list + status management
/admin/donations           → Donation log
/admin/blog                → Blog post management
/admin/blog/new            → New blog post
/admin/blog/[id]/edit      → Edit blog post
/admin/settings            → Site config (address, hours, social links)
```

## Admin — Add New Product Flow (Critical UX)

This is the most-used admin feature. The owner needs to add bespoke sticks to the shop quickly and simply. The flow must be:

1. Click "New listing" from admin dashboard or products list
2. Single-page form with:
   - **Title** (text input, required)
   - **Product type** (select: One of a kind / Supply / Gift voucher / Workshop)
   - **Category** (select from stick_categories)
   - **Price** (£ input, converted to pence on save)
   - **Images** (drag-and-drop zone, up to 6 images, reorderable, first = primary)
   - **Description** (rich text editor — keep it simple, no complex WYSIWYG, a textarea with basic markdown preview is fine)
   - **Materials** section: Handle material, Shank material, Collar material (text inputs or selects)
   - **Length** (optional, inches)
   - **Made by** (select from stick_makers, optional for supplies)
   - **Stock count** (default 1 for one-of-a-kind, editable for supplies)
3. Save as Draft or Publish
4. On publish: creates Stripe product + price via API, sets `stripe_price_id`
5. Product appears on shop immediately

**Image upload flow:**
- Drag & drop or click to select
- Images upload to Supabase Storage bucket `stick-images` immediately on drop
- Thumbnail preview shown in the form
- Reorder by drag (display_order field)
- Delete button on each image
- First image in order = primary (shown in shop grid)

## API Routes

```
POST /api/checkout          → Create Stripe Checkout session for shop purchase
POST /api/donate            → Create Stripe Checkout session for donation
POST /api/webhook/stripe    → Handle Stripe webhooks (payment success, etc.)
POST /api/admin/products    → Create product (auth required)
PUT  /api/admin/products/[id] → Update product (auth required)
DELETE /api/admin/products/[id] → Archive product (auth required, soft delete)
POST /api/admin/upload      → Upload image to Supabase Storage (auth required)
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

## SEO Requirements

- All public pages: dynamic `<title>` and `<meta name="description">`
- Product pages: JSON-LD `Product` schema with price, availability, images
- Workshop pages: JSON-LD `Event` schema with date, location, tickets
- Homepage: JSON-LD `Organization` schema with charity details
- Blog posts: JSON-LD `Article` schema
- `sitemap.xml` generated from all published products, workshops, blog posts
- `robots.txt` allowing all public routes, blocking `/admin`
- OpenGraph + Twitter Card meta tags on all pages
- Canonical URLs on all pages

## Build Order

### Phase 1 — Foundation
1. Next.js 14 project init with App Router
2. Tailwind config with design tokens
3. Supabase client setup (server + client)
4. Database migrations (all `stick_` prefixed)
5. Seed data for categories, materials, site config
6. Layout shell: nav, footer, responsive mobile menu
7. Homepage with static content

### Phase 2 — Admin & Shop Core
8. Supabase Auth setup (owner login)
9. Admin layout with sidebar nav
10. Add Product form with image upload
11. Product list management (edit, draft/publish/archive)
12. Public shop page with product grid
13. Product detail page
14. Stripe Checkout integration
15. Stripe webhook handler
16. Order tracking in admin

### Phase 3 — Content & Features
17. Workshop listing + detail + booking
18. Blog CMS (create/edit/publish posts)
19. Donation flow with Gift Aid checkbox
20. Contact form (server action → email)
21. Gallery page with filtering
22. About / The Craft / Support Us pages
23. Search / filter on shop (by category, material, price range)

### Phase 4 — Polish
24. SEO: sitemaps, JSON-LD, meta tags
25. Image optimisation (next/image, Supabase transforms)
26. Loading states, error boundaries
27. Mobile responsiveness audit
28. Accessibility audit (WCAG 2.1 AA)
29. Analytics (GA4) + Facebook Pixel
30. Performance audit (Core Web Vitals)

## File Conventions

- Components: `src/components/<ComponentName>.tsx` (PascalCase)
- Pages: `src/app/<route>/page.tsx`
- Server actions: `src/app/<route>/actions.ts`
- API routes: `src/app/api/<route>/route.ts`
- Types: `src/types/stick.ts` (all Supabase-generated types)
- Lib: `src/lib/supabase.ts`, `src/lib/stripe.ts`, `src/lib/utils.ts`
- Design tokens: defined in `tailwind.config.ts`

## Notes

- The charity is likely below VAT threshold (£85k) — prices are inclusive, no VAT line needed
- Walking sticks require oversized parcel shipping — flat rate shipping by product type is simplest
- All stick products are unique — when sold, status changes to 'sold' and listing shows "Sold" badge
- The owner is not technical — the admin UI must be extremely simple and forgiving
- Mobile-first: many visitors will be on phones, especially from social media links
