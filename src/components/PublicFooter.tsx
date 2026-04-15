import Link from 'next/link';
import type { SiteConfig } from '@/lib/site-config';

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.8 1.8-1.8H17V2.3C16.5 2.2 15.3 2 14 2c-2.7 0-4.5 1.7-4.5 4.7v2.8H7V13h2.5v9h4z" />
    </svg>
  );
}

export function PublicFooter({ config }: { config: SiteConfig }) {
  return (
    <footer className="mt-section bg-stick-walnut text-stick-linen/85">
      <div className="container-wide py-12 md:py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-heading text-h3 text-stick-linen leading-tight">
            {config.charity_name}
          </p>
          <p className="mt-3 text-small text-stick-linen/70">
            Preserving the heritage craft of stick making in County Durham. Workshops, shop, and a
            charitable mission to put a stick in the hand of anyone who needs one.
          </p>
          <p className="mt-4 text-xs tracking-wider text-stick-linen/60">
            Registered Charity Number {config.charity_number}
          </p>
        </div>

        <div>
          <p className="label-caps text-stick-linen/60">Visit</p>
          <address className="mt-3 not-italic text-small leading-relaxed text-stick-linen/80">
            {config.workshop_address.line1}<br />
            {config.workshop_address.line2 && (<>{config.workshop_address.line2}<br /></>)}
            {config.workshop_address.town}<br />
            {config.workshop_address.county}<br />
            {config.workshop_address.postcode}
          </address>
          <div className="mt-4 text-small text-stick-linen/80">
            {config.opening_hours.regular_sessions.map((s) => (
              <div key={s.day}>
                {s.day} {s.start}–{s.end}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="label-caps text-stick-linen/60">Explore</p>
          <ul className="mt-3 space-y-2 text-small">
            <li><Link href="/shop" className="text-stick-linen/80 no-underline hover:text-stick-brass">Shop</Link></li>
            <li><Link href="/workshops" className="text-stick-linen/80 no-underline hover:text-stick-brass">Workshops</Link></li>
            <li><Link href="/the-craft" className="text-stick-linen/80 no-underline hover:text-stick-brass">The Craft</Link></li>
            <li><Link href="/support-us#donate" className="text-stick-linen/80 no-underline hover:text-stick-brass">Donate</Link></li>
            <li><Link href="/contact" className="text-stick-linen/80 no-underline hover:text-stick-brass">Contact</Link></li>
          </ul>
          <div className="mt-5 flex items-center gap-3 text-stick-linen/70">
            {config.social_links.instagram && (
              <a
                href={config.social_links.instagram}
                className="rounded-full p-2 text-stick-linen/80 hover:bg-stick-linen/10 hover:text-stick-brass"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </a>
            )}
            {config.social_links.facebook && (
              <a
                href={config.social_links.facebook}
                className="rounded-full p-2 text-stick-linen/80 hover:bg-stick-linen/10 hover:text-stick-brass"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-stick-linen/10">
        <div className="container-wide py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stick-linen/60">
          <p>© {new Date().getFullYear()} {config.charity_name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-stick-linen/60 no-underline hover:text-stick-brass">Privacy</Link>
            <Link href="/terms" className="text-stick-linen/60 no-underline hover:text-stick-brass">Terms</Link>
            <Link href="/delivery" className="text-stick-linen/60 no-underline hover:text-stick-brass">Delivery</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
