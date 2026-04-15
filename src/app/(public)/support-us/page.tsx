import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ABOUT_TEASER_IMAGE, HOMEPAGE_SHOWCASE } from '@/lib/site-images';

export const metadata: Metadata = {
  title: 'Support us',
  description:
    'Ways to support Durham Stick Makers — buy a stick, join a workshop, commission bespoke work, or just come and say hello.',
};

const WAYS = [
  {
    title: 'Buy a stick',
    body:
      'Every stick sold keeps the bench warm, pays for materials, and helps us gift sticks to people who need them.',
    href: '/shop',
    cta: 'Visit the shop',
  },
  {
    title: 'Book a workshop',
    body:
      'Spend a day or an evening learning how to dress a stick from raw shank to finished piece, with members of the group.',
    href: '/workshops',
    cta: 'See workshops',
  },
  {
    title: 'Commission a piece',
    body:
      'Want a stick shaped to your height and grip, a specific wood, a particular horn? Get in touch and we will make it happen.',
    href: '/contact',
    cta: 'Start a commission',
  },
  {
    title: 'Come and visit',
    body:
      'Monday and Tuesday evenings, 6–9pm, at Fencehouses Community Centre. Drop in — the kettle is always on.',
    href: '/contact',
    cta: 'Find us',
  },
];

export default function SupportUsPage() {
  const heroImage = HOMEPAGE_SHOWCASE[2] ?? ABOUT_TEASER_IMAGE;

  return (
    <>
      <section className="section">
        <div className="container-wide grid gap-10 md:grid-cols-2 items-center">
          <div>
            <span className="label-caps">Support us</span>
            <h1 className="mt-2 font-heading text-hero">
              The best way to support us is to come and find us
            </h1>
            <p className="mt-5 text-stick-shale text-lg leading-relaxed">
              We&rsquo;re a small group of heritage craftspeople in County Durham. What keeps
              the craft going isn&rsquo;t fundraising drives — it&rsquo;s people showing up,
              buying a stick, learning alongside us, or asking for a commission. Every one of
              those things feeds the workshop.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">Get in touch</Link>
              <Link href="/shop" className="btn-outline">Browse the shop</Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-stick-stone">
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              sizes="(min-width: 768px) 45vw, 90vw"
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-wide">
          <h2 className="font-heading text-h1">Ways to get involved</h2>
          <p className="mt-3 max-w-prose text-stick-shale">
            None of this is transactional charity. Pick whatever fits your interest — whether
            that&rsquo;s a finished stick, a workshop, or simply a chat over tea.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {WAYS.map((way) => (
              <article
                key={way.title}
                className="rounded-card border border-stick-stone bg-white p-6 md:p-8 space-y-3 hover:border-stick-brass transition-colors"
              >
                <h3 className="font-heading text-h3">{way.title}</h3>
                <p className="text-stick-shale leading-relaxed">{way.body}</p>
                <Link
                  href={way.href}
                  className="inline-flex text-small font-medium text-stick-brass hover:text-stick-walnut transition-colors"
                >
                  {way.cta} →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-wide">
          <div className="rounded-card border border-stick-stone bg-stick-cream/40 px-6 py-10 md:px-12 md:py-12 text-center">
            <h2 className="font-heading text-h2">Want to help in another way?</h2>
            <p className="mt-3 max-w-prose mx-auto text-stick-shale">
              If you know somebody who would benefit from a stick, or you&rsquo;d like to volunteer
              your time, a photograph, a story, or a donation of tools or materials — please get
              in touch. We&rsquo;ll reply.
            </p>
            <div className="mt-6">
              <Link href="/contact" className="btn-primary">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
