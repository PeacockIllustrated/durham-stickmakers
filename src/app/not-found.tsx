import Link from 'next/link';
import Image from 'next/image';
import { ABOUT_TEASER_IMAGE } from '@/lib/site-images';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-stick-stone bg-stick-linen/95">
        <div className="container-wide h-16 flex items-center">
          <Link href="/" className="font-heading text-[1.5rem] leading-none text-stick-walnut no-underline">
            Durham Stick Makers
          </Link>
        </div>
      </header>

      <main className="flex-1 section">
        <div className="container-wide grid gap-10 md:grid-cols-2 items-center">
          <div>
            <span className="label-caps">404</span>
            <h1 className="mt-2 font-heading text-hero">We can&rsquo;t find that page</h1>
            <p className="mt-5 text-stick-shale text-lg">
              The link might be out of date, or the stick might have moved on. Try the homepage,
              the shop, or head to the workshop page for what&rsquo;s coming up.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="btn-primary">Back to the homepage</Link>
              <Link href="/shop" className="btn-outline">Browse the shop</Link>
              <Link href="/contact" className="btn-ghost">Get in touch</Link>
            </div>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-card bg-stick-stone">
            <Image
              src={ABOUT_TEASER_IMAGE.src}
              alt={ABOUT_TEASER_IMAGE.alt}
              fill
              sizes="(min-width: 768px) 45vw, 90vw"
              priority
              className="object-cover"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
