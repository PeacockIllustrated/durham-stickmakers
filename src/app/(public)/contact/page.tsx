import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';
import { getSiteConfig } from '@/lib/site-config';
import { formatTime } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Durham Stick Makers - commission a stick, ask about a repair, book a workshop, or just say hello.',
};

export default async function ContactPage() {
  const config = await getSiteConfig();

  return (
    <section className="section">
      <div className="container-wide">
        <div className="max-w-2xl">
          <span className="label-caps">Contact</span>
          <h1 className="mt-2 font-heading text-hero">Get in touch</h1>
          <p className="mt-4 text-stick-shale text-lg">
            Drop us a line about a commission, a repair, a workshop, or anything else - we
            read every message.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-card border border-stick-stone bg-stick-surface p-6 md:p-8">
              <h2 className="font-heading text-h2">Send us a message</h2>
              <p className="mt-2 text-small text-stick-driftwood">
                All fields marked <span className="text-stick-brass">*</span> are required.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>

          <aside className="lg:col-span-2 space-y-6">
            <div className="rounded-card border border-stick-stone bg-stick-cream/40 p-6">
              <h3 className="font-heading text-h3">Visit the workshop</h3>
              <address className="mt-3 not-italic text-stick-shale leading-relaxed">
                {config.workshop_address.line1}<br />
                {config.workshop_address.line2 && (<>{config.workshop_address.line2}<br /></>)}
                {config.workshop_address.town}<br />
                {config.workshop_address.county}<br />
                {config.workshop_address.postcode}
              </address>
            </div>

            <div className="rounded-card border border-stick-stone bg-stick-cream/40 p-6">
              <h3 className="font-heading text-h3">Regular sessions</h3>
              <ul className="mt-3 space-y-2 text-stick-shale">
                {config.opening_hours.regular_sessions.map((s) => (
                  <li
                    key={s.day}
                    className="flex items-baseline justify-between border-b border-stick-stone/70 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="font-medium text-stick-walnut">{s.day}</span>
                    <span>{formatTime(s.start)}–{formatTime(s.end)}</span>
                  </li>
                ))}
              </ul>
              {config.opening_hours.note && (
                <p className="mt-4 text-small italic text-stick-driftwood">
                  {config.opening_hours.note}
                </p>
              )}
            </div>

            <div className="rounded-card border border-stick-stone bg-stick-cream/40 p-6">
              <h3 className="font-heading text-h3">Email</h3>
              <a
                href={`mailto:${config.contact_email}`}
                className="mt-3 block text-stick-walnut hover:text-stick-brass break-all"
              >
                {config.contact_email}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
