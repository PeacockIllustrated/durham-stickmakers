import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COURSES, formatCoursePrice, getCourse, telHref, type Course } from '@/lib/courses';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const course = getCourse(params.slug);
  if (!course) return { title: 'Course not found' };
  return {
    title: `${course.title} | Stick making course`,
    description: course.summary,
    alternates: { canonical: `/workshops/courses/${course.slug}` },
    openGraph: {
      title: course.title,
      description: course.summary,
      images: [{ url: course.image.src, alt: course.image.alt }],
    },
  };
}

export default function CoursePage({ params }: PageProps) {
  const course = getCourse(params.slug);
  if (!course) notFound();

  const price = formatCoursePrice(course.price_pence);

  return (
    <>
      <section className="section">
        <div className="container-wide">
          <nav className="text-small text-stick-driftwood mb-6">
            <Link href="/workshops" className="hover:text-stick-brass">Workshops</Link>
            {' / '}
            <span className="text-stick-shale">{course.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-stick-stone">
              <Image
                src={course.image.src}
                alt={course.image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
            </div>

            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="pill-brass">{course.schedule}</span>
                {course.giftVouchers && <span className="pill">Gift vouchers available</span>}
              </div>

              <h1 className="font-heading text-hero leading-tight">{course.title}</h1>
              <p className="text-lg text-stick-shale leading-relaxed">{course.intro}</p>

              <dl className="grid grid-cols-2 gap-4 border-y border-stick-stone py-4">
                <div>
                  <dt className="label-caps">How long</dt>
                  <dd className="mt-1 text-stick-walnut">{course.duration}</dd>
                </div>
                <div>
                  <dt className="label-caps">Where</dt>
                  <dd className="mt-1 text-stick-walnut">{course.location}</dd>
                </div>
                <div>
                  <dt className="label-caps">Price</dt>
                  <dd className="mt-1">
                    <span className="font-heading text-h3 text-stick-walnut">{price}</span>
                    <span className="block text-small text-stick-driftwood">{course.priceNote}</span>
                  </dd>
                </div>
                <div>
                  <dt className="label-caps">When</dt>
                  <dd className="mt-1 text-stick-walnut">{course.schedule}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3">
                <a href={telHref(course.contact.phone)} className="btn-primary">
                  Call {course.contact.name} · {course.contact.phone}
                </a>
                {course.flyer && (
                  <a href={course.flyer.href} className="btn-outline" download>
                    {course.flyer.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-wide grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="font-heading text-h1">The course</h2>
            <ol className="mt-6 space-y-6">
              {course.steps.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-2 border-stick-brass font-heading text-h4 text-stick-walnut"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-h3 text-stick-walnut">{step.title}</h3>
                    <p className="mt-1 text-stick-shale">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <h2 className="mt-12 font-heading text-h2">Everything included</h2>
            <ul className="mt-4 space-y-2 text-stick-shale">
              {course.included.map((item) => (
                <li key={item} className="flex items-baseline gap-3">
                  <span aria-hidden="true" className="h-1.5 w-1.5 flex-none translate-y-[-2px] rounded-full bg-stick-brass" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:col-span-2">
            <div className="rounded-card bg-stick-walnut p-6 text-stick-linen md:p-8 lg:sticky lg:top-24">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-stick-brass">
                Book your place
              </p>
              <p className="mt-3 font-heading text-h2 leading-tight">
                Call {course.contact.name} to arrange a date
              </p>
              <p className="mt-3 text-stick-stone">
                Courses run on dates to suit you. Give {course.contact.name} a ring to find dates
                and reserve your place.
              </p>
              <a
                href={telHref(course.contact.phone)}
                className="mt-6 block font-heading text-h1 text-stick-linen no-underline hover:text-stick-brass"
              >
                {course.contact.phone}
              </a>
              {course.contact.email && (
                <a
                  href={`mailto:${course.contact.email}?subject=${encodeURIComponent(course.title)}`}
                  className="mt-2 block break-all text-stick-stone hover:text-stick-brass"
                >
                  {course.contact.email}
                </a>
              )}
              <div className="mt-6 border-t border-stick-linen/15 pt-5">
                <p>
                  <span className="font-heading text-h3">{price}</span>{' '}
                  <span className="text-small text-stick-stone">{course.priceNote}</span>
                </p>
                {course.giftVouchers && (
                  <p className="mt-2 text-small text-stick-stone">
                    Gift vouchers available. The ideal present for anyone who loves the
                    countryside.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildCourseJsonLd(course) }}
      />
    </>
  );
}

function buildCourseJsonLd(c: Course): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const siteUrl = raw ? (/^https?:\/\//.test(raw) ? raw : `https://${raw}`) : 'http://localhost:3000';
  const url = `${siteUrl}/workshops/courses/${c.slug}`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: c.title,
    description: c.summary,
    url,
    image: `${siteUrl}${c.image.src}`,
    provider: { '@type': 'Organization', name: 'Durham Stick Makers', sameAs: siteUrl },
    offers: {
      '@type': 'Offer',
      category: 'Paid',
      price: (c.price_pence / 100).toFixed(2),
      priceCurrency: 'GBP',
      url,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Onsite',
      location: { '@type': 'Place', name: c.location, address: { '@type': 'PostalAddress', addressCountry: 'GB' } },
    },
  });
}
