import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BookingForm } from './BookingForm';
import { ABOUT_TEASER_IMAGE } from '@/lib/site-images';
import { formatDate, formatPence, formatTime, stickImageUrl } from '@/lib/utils';
import type { StickWorkshop } from '@/types/stick';

interface PageProps {
  params: { slug: string };
}

async function fetchWorkshop(slug: string): Promise<StickWorkshop | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('stick_workshops')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return (data as StickWorkshop | null) ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const w = await fetchWorkshop(params.slug);
  if (!w) return { title: 'Workshop not found' };
  return {
    title: w.title,
    description: w.description?.slice(0, 160) ?? undefined,
    alternates: { canonical: `/workshops/${w.slug}` },
  };
}

export default async function WorkshopDetailPage({ params }: PageProps) {
  const workshop = await fetchWorkshop(params.slug);
  if (!workshop) notFound();

  const imageSrc = workshop.featured_image_path
    ? stickImageUrl(workshop.featured_image_path)
    : ABOUT_TEASER_IMAGE.src;

  const soldOut =
    workshop.status === 'fully_booked' || workshop.spots_remaining <= 0;
  const isPast = workshop.status === 'completed';
  const isCancelled = workshop.status === 'cancelled';
  const bookable = !soldOut && !isPast && !isCancelled;
  const priceLabel = workshop.price_pence === 0 ? 'Free' : formatPence(workshop.price_pence);

  return (
    <>
      <section className="section">
        <div className="container-wide">
          <nav className="text-small text-stick-driftwood mb-6">
            <Link href="/workshops" className="hover:text-stick-brass">Workshops</Link>
            {' / '}
            <span className="text-stick-shale">{workshop.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-stick-stone">
                {imageSrc && (
                  <Image
                    src={imageSrc}
                    alt={workshop.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 45vw, 90vw"
                    className="object-cover"
                  />
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {bookable && <span className="pill-fell">Booking open</span>}
                {soldOut && !isPast && !isCancelled && (
                  <span className="pill bg-stick-walnut text-stick-linen">Fully booked</span>
                )}
                {isCancelled && <span className="pill bg-red-100 text-red-800">Cancelled</span>}
                {isPast && <span className="pill">Past</span>}
              </div>

              <h1 className="font-heading text-hero leading-tight">{workshop.title}</h1>

              <dl className="grid grid-cols-2 gap-4 border-y border-stick-stone py-4">
                <div>
                  <dt className="label-caps">When</dt>
                  <dd className="mt-1 text-stick-walnut">
                    {formatDate(workshop.date)}<br />
                    <span className="text-stick-shale">
                      {formatTime(workshop.start_time)}–{formatTime(workshop.end_time)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="label-caps">Where</dt>
                  <dd className="mt-1 text-stick-walnut">{workshop.location}</dd>
                </div>
                <div>
                  <dt className="label-caps">Price</dt>
                  <dd className="mt-1 font-heading text-h3 text-stick-walnut">
                    {priceLabel}
                  </dd>
                </div>
                <div>
                  <dt className="label-caps">Spots</dt>
                  <dd className="mt-1 text-stick-walnut">
                    {soldOut
                      ? 'Fully booked'
                      : `${workshop.spots_remaining} / ${workshop.capacity} remaining`}
                  </dd>
                </div>
              </dl>

              {workshop.description && (
                <div className="whitespace-pre-wrap text-stick-shale leading-relaxed">
                  {workshop.description}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Booking section */}
      <section className="section pt-0">
        <div className="container-wide">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-4">
              <h2 className="font-heading text-h1">Book your place</h2>
              {bookable ? (
                <>
                  <p className="text-stick-shale max-w-prose">
                    Reserve your spot below. We&rsquo;ll email you a confirmation and any
                    last-minute details as the date approaches.
                    {workshop.price_pence > 0 && (
                      <>
                        {' '}Payment is taken when you arrive - or by bank transfer after we
                        confirm; we&rsquo;ll be in touch.
                      </>
                    )}
                  </p>
                </>
              ) : isCancelled ? (
                <p className="text-stick-shale">
                  This workshop was cancelled. Please{' '}
                  <Link href="/contact" className="text-stick-walnut hover:text-stick-brass">get in touch</Link>{' '}
                  and we&rsquo;ll let you know when the next one is scheduled.
                </p>
              ) : isPast ? (
                <p className="text-stick-shale">This workshop has already been held.</p>
              ) : (
                <p className="text-stick-shale">
                  All spots are taken. Drop us a line to be added to the waiting list -
                  occasionally a place opens up.
                </p>
              )}
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-card border border-stick-stone bg-stick-surface p-6">
                {bookable ? (
                  <BookingForm
                    workshopId={workshop.id}
                    priceLabel={priceLabel}
                    maxSpotsPerBooking={4}
                    spotsRemaining={workshop.spots_remaining}
                  />
                ) : (
                  <div>
                    <p className="font-heading text-h3 text-stick-walnut">
                      {isPast ? 'Workshop over' : isCancelled ? 'Workshop cancelled' : 'Fully booked'}
                    </p>
                    <Link href="/contact" className="btn-outline mt-4 w-full">Get in touch</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildEventJsonLd(workshop) }}
      />
    </>
  );
}

function buildEventJsonLd(w: StickWorkshop): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? (/^https?:\/\//.test(process.env.NEXT_PUBLIC_SITE_URL)
        ? process.env.NEXT_PUBLIC_SITE_URL
        : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
    : 'http://localhost:3000';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: w.title,
    description: w.description ?? undefined,
    startDate: `${w.date}T${w.start_time}:00`,
    endDate: `${w.date}T${w.end_time}:00`,
    location: {
      '@type': 'Place',
      name: w.location,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'GB',
      },
    },
    eventStatus:
      w.status === 'cancelled'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    offers: {
      '@type': 'Offer',
      price: (w.price_pence / 100).toFixed(2),
      priceCurrency: 'GBP',
      availability:
        w.spots_remaining > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
      url: `${siteUrl}/workshops/${w.slug}`,
    },
    url: `${siteUrl}/workshops/${w.slug}`,
    organizer: { '@type': 'Organization', name: 'Durham Stick Makers' },
  };
  return JSON.stringify(data);
}
