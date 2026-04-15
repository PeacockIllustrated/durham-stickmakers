import Link from 'next/link';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSiteConfig } from '@/lib/site-config';
import { ProductCard } from '@/components/ProductCard';
import { formatDate, formatPence, formatTime } from '@/lib/utils';
import type { StickProduct, StickWorkshop } from '@/types/stick';

export const metadata: Metadata = {
  title: 'Durham Stick Makers — Heritage walking sticks, handmade in County Durham',
  description:
    'A registered charity preserving the endangered craft of stick making. Shop handmade shepherds crooks, thumbsticks, and walking sticks, or join a workshop in Fencehouses.',
  alternates: { canonical: '/' },
};

async function fetchFeaturedProducts(): Promise<StickProduct[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('stick_products')
      .select('*, maker:stick_makers(id, name), images:stick_product_images(*)')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('updated_at', { ascending: false })
      .limit(4);
    return (data as StickProduct[] | null) ?? [];
  } catch {
    return [];
  }
}

async function fetchNextWorkshop(): Promise<StickWorkshop | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = createSupabaseServerClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('stick_workshops')
      .select('*')
      .eq('status', 'upcoming')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle();
    return data as StickWorkshop | null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [config, featured, nextWorkshop] = await Promise.all([
    getSiteConfig(),
    fetchFeaturedProducts(),
    fetchNextWorkshop(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-walnut-gradient text-stick-linen">
        <div className="container-wide py-20 md:py-28 grid gap-10 md:grid-cols-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <span className="label-caps text-stick-brass">Fencehouses, County Durham</span>
            <h1 className="font-heading text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] text-stick-linen">
              {config.hero_headline}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-stick-linen/80">
              {config.hero_subtitle}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/shop" className="btn-primary bg-stick-brass text-stick-walnut hover:bg-stick-linen hover:text-stick-walnut">
                Browse the shop
              </Link>
              <Link
                href="/workshops"
                className="btn-outline border-stick-linen text-stick-linen hover:bg-stick-linen hover:text-stick-walnut"
              >
                Visit the workshop
              </Link>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card border border-stick-linen/10 bg-stick-walnut/60">
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-stick-linen/50 text-sm">
                Workshop photography placeholder<br />
                <span className="text-xs text-stick-linen/40 mt-2 block">
                  Replace with a hand-shaping-horn image
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured sticks */}
      <section className="section">
        <div className="container-wide">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="label-caps">From the workshop</span>
              <h2 className="mt-2 font-heading text-h1">Featured sticks</h2>
              <p className="mt-2 max-w-prose text-stick-shale">
                Each stick is one of a kind — dressed by hand by a Durham Stick Makers member.
              </p>
            </div>
            <Link href="/shop" className="btn-ghost">Browse all →</Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-stick-stone bg-stick-stone/40 p-10 text-center text-stick-driftwood">
              <p className="font-heading text-h3 text-stick-walnut">Shop opening soon</p>
              <p className="mt-2 text-small">
                Featured sticks will appear here once the first listings are published.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Next workshop */}
      <section className="section bg-stick-cream/50">
        <div className="container-wide grid gap-10 md:grid-cols-2 items-center">
          <div>
            <span className="label-caps">Next up at the workshop</span>
            {nextWorkshop ? (
              <>
                <h2 className="mt-2 font-heading text-h1">{nextWorkshop.title}</h2>
                <p className="mt-3 text-stick-shale">
                  {formatDate(nextWorkshop.date)} · {formatTime(nextWorkshop.start_time)}–{formatTime(nextWorkshop.end_time)}
                </p>
                {nextWorkshop.description && (
                  <p className="mt-4 max-w-prose text-stick-shale">{nextWorkshop.description}</p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link href={`/workshops/${nextWorkshop.slug}`} className="btn-primary">
                    Book a place
                  </Link>
                  <span className="text-small text-stick-driftwood">
                    {nextWorkshop.spots_remaining} {nextWorkshop.spots_remaining === 1 ? 'spot' : 'spots'} remaining ·
                    {' '}{nextWorkshop.price_pence === 0 ? 'Free' : formatPence(nextWorkshop.price_pence)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-2 font-heading text-h1">Drop in on a Monday or Tuesday</h2>
                <p className="mt-4 max-w-prose text-stick-shale">
                  We meet at Fencehouses Community Centre every Monday and Tuesday evening from
                  6pm–9pm. Drop-in welcome — the kettle is always on.
                </p>
                <div className="mt-6">
                  <Link href="/workshops" className="btn-primary">See all workshops</Link>
                </div>
              </>
            )}
          </div>
          <div className="rounded-card bg-stick-linen p-8 shadow-[0_1px_0_#EDEAE4]">
            <p className="label-caps">Regular sessions</p>
            <ul className="mt-4 space-y-3 text-stick-shale">
              {config.opening_hours.regular_sessions.map((s) => (
                <li key={s.day} className="flex items-baseline justify-between border-b border-stick-stone pb-3 last:border-0 last:pb-0">
                  <span className="font-heading text-h4 text-stick-walnut">{s.day}</span>
                  <span>{formatTime(s.start)}–{formatTime(s.end)}</span>
                </li>
              ))}
            </ul>
            {config.opening_hours.note && (
              <p className="mt-4 text-small italic text-stick-driftwood">{config.opening_hours.note}</p>
            )}
          </div>
        </div>
      </section>

      {/* Mission / donation CTA */}
      <section className="section">
        <div className="container-wide">
          <div className="rounded-card bg-stick-walnut px-6 py-12 md:px-16 md:py-16 text-stick-linen">
            <div className="grid gap-10 md:grid-cols-5 items-center">
              <div className="md:col-span-3">
                <span className="label-caps text-stick-brass">Support the craft</span>
                <h2 className="mt-3 font-heading text-h1 text-stick-linen">
                  Keep a heritage craft alive
                </h2>
                <p className="mt-4 max-w-prose text-stick-linen/80">
                  {config.donation_cta}
                </p>
              </div>
              <div className="md:col-span-2 md:text-right">
                <Link
                  href="/support-us#donate"
                  className="btn-primary bg-stick-brass text-stick-walnut hover:bg-stick-linen"
                >
                  Donate
                </Link>
                <p className="mt-3 text-small text-stick-linen/60">
                  Registered Charity {config.charity_number} · Gift Aid eligible
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="section pt-0">
        <div className="container-wide grid gap-8 md:grid-cols-2 items-start">
          <div>
            <span className="label-caps">Who we are</span>
            <h2 className="mt-2 font-heading text-h1">A workshop, not just a shop</h2>
          </div>
          <div className="space-y-4 text-stick-shale">
            <p>
              Durham Stick Makers is a small charity of heritage craftsmen based in County Durham.
              We make and sell handmade walking sticks — shepherds crooks, thumbsticks, market
              sticks and more — shaped from hazel, holly, ram horn and antler using techniques
              passed down through generations.
            </p>
            <p>
              Every penny raised goes back into preserving the craft: teaching workshops,
              providing sticks free of charge to those who need them, and keeping a bench,
              a vice and a kettle warm in Fencehouses.
            </p>
            <Link href="/about" className="btn-ghost -ml-4 mt-2">Learn more about us →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
