# Durham Stickmakers — Phase 1 Build Prompt

Read CLAUDE.md thoroughly before starting. This is Phase 1: Foundation + Admin Core.

## What to build in this phase

### 1. Project Initialisation
- `npx create-next-app@14 durham-stickmakers --typescript --tailwind --eslint --app --src-dir`
- Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `@stripe/stripe-js`
- Copy `tailwind.config.ts` from init kit (has all design tokens)
- Set up `next/font/google` with DM Serif Display (heading) and Inter (body) — export as CSS variables `--font-dm-serif` and `--font-inter`
- Copy `src/types/stick.ts` from init kit
- Create `src/lib/supabase.ts` (server client + browser client using `@supabase/ssr`)
- Create `src/lib/stripe.ts` (server-side Stripe instance)
- Create `.env.local.example` with all required env vars listed

### 2. Run Migrations
- Apply all four migration files from `supabase/migrations/` to the shared Supabase instance
- Verify all tables exist with `stick_` prefix
- Verify seed data (categories, materials, site config) is populated
- Verify storage bucket `stick-images` is created with correct policies

### 3. Layout Shell
Build the public layout (`src/app/layout.tsx` and `src/app/(public)/layout.tsx`):

**Navigation bar:**
- Logo: "Durham Stick Makers" in DM Serif Display, `stick-walnut` colour
- Links: The Craft, Gallery, Shop, Workshops, Support Us, Contact
- Active link highlighted in `stick-brass`
- Mobile: hamburger menu with slide-out drawer
- Background: white (`stick-linen`), subtle bottom border in `stick-stone`

**Footer:**
- Charity number: "Registered Charity Number 1212357" (legal requirement)
- Quick links: Shop, Workshops, Contact, Donate
- Social links: Instagram, Facebook
- Workshop address
- Newsletter signup placeholder (email input + submit)
- Copyright line

**Admin layout** (`src/app/admin/layout.tsx`):
- Simple sidebar: Dashboard, Products, Workshops, Orders, Donations, Blog, Messages, Settings
- Protected by Supabase auth — redirect to `/admin/login` if not authenticated
- Clean, functional UI — no design flourishes needed, this is a working tool

### 4. Homepage
Build `src/app/(public)/page.tsx`:

- **Hero section:** Dark walnut background, DM Serif Display headline ("Shaped by hand. Rooted in tradition."), Inter subtitle, two CTAs: "Browse the shop" (brass bg) + "Visit the workshop" (outline). When real photography is available, this becomes a background image.
- **Featured sticks:** Horizontal scroll or grid of 3–4 featured products from `stick_products` where `is_featured = true`. Product card component: image, title (DM Serif), maker name (Inter, driftwood), price, "One of a kind" badge.
- **Next workshop:** Pull next upcoming workshop from `stick_workshops`. Show date, title, spots remaining, "Book a place" CTA.
- **Mission block:** Pull `donation_cta` from `stick_site_config`. "Support the Craft" heading, brief text, Donate CTA.
- **About teaser:** 2–3 lines of intro, "Learn more about us" link.

### 5. Admin — Product Management (THE KEY FEATURE)
Build the complete product CRUD:

**Product list** (`/admin/products`):
- Table/grid of all products (all statuses)
- Columns: thumbnail, title, category, price, status badge, type, date
- Filter by status (draft/published/sold/archived)
- "New listing" button (prominent, top right)
- Click row → edit page

**New product form** (`/admin/products/new`):
- Single-page form, no wizard/steps — keep it simple
- Fields (see CLAUDE.md for full list): title, product_type, category (select), price (£ input), description (textarea), handle_material, shank_material, collar_material, length_inches, maker (select from stick_makers), stock_count
- **Image upload zone:** Drag-and-drop area, click to select, up to 6 images
  - On drop: immediately upload to Supabase Storage `stick-images/products/{product_id}/{filename}`
  - Show thumbnail preview with delete button
  - Drag to reorder (sets display_order)
  - First image = primary (is_primary flag)
- Two save buttons: "Save as draft" and "Publish"
- On publish: call Stripe API to create Product + Price, store IDs back to stick_products

**Edit product** (`/admin/products/[id]/edit`):
- Same form, pre-populated
- Can change status (draft → published, published → sold/archived)
- Can add/remove/reorder images
- Shows existing Stripe sync status

### 6. Auth
- `/admin/login` page with email/password form
- Supabase Auth `signInWithPassword`
- Middleware to protect all `/admin/*` routes
- No public registration — owner account created manually in Supabase dashboard

## Quality checklist
- [ ] All database tables prefixed with `stick_`
- [ ] Tailwind uses the `stick-*` colour tokens throughout — no hardcoded hex values in components
- [ ] DM Serif Display for all headings, Inter for all body/UI text
- [ ] Product cards show maker attribution
- [ ] Image upload works end-to-end (drop → storage → preview → saved to stick_product_images)
- [ ] Admin pages are auth-protected
- [ ] Homepage pulls real data from Supabase (featured products, next workshop, site config)
- [ ] Mobile responsive: nav collapses, product grid stacks, forms are usable on phone
- [ ] No TypeScript errors, no console warnings
