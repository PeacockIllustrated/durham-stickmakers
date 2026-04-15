import { getSiteConfig } from '@/lib/site-config';
import { SettingsForm, type SettingsFormInitial } from './SettingsForm';

export const metadata = { title: 'Settings' };

export default async function AdminSettingsPage() {
  const config = await getSiteConfig();

  const initial: SettingsFormInitial = {
    charity_number: config.charity_number,
    charity_name: config.charity_name,
    contact_email: config.contact_email,
    hero_headline: config.hero_headline,
    hero_subtitle: config.hero_subtitle,
    donation_cta: config.donation_cta,
    address_line1: config.workshop_address.line1,
    address_line2: config.workshop_address.line2 ?? '',
    address_town: config.workshop_address.town,
    address_county: config.workshop_address.county,
    address_postcode: config.workshop_address.postcode,
    social_instagram: config.social_links.instagram ?? '',
    social_facebook: config.social_links.facebook ?? '',
    sessions: config.opening_hours.regular_sessions.map((s) => ({
      day: s.day,
      start: s.start.slice(0, 5),
      end: s.end.slice(0, 5),
    })),
    opening_note: config.opening_hours.note ?? '',
    shipping_standard: (config.shipping_rates.standard_pence / 100).toFixed(2),
    shipping_oversized: (config.shipping_rates.oversized_pence / 100).toFixed(2),
    shipping_free_threshold: (config.shipping_rates.free_threshold_pence / 100).toFixed(2),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-h1">Site settings</h1>
        <p className="text-stick-driftwood text-small mt-1">
          Everything here flows through to the public site. Changes are live as soon as you save.
        </p>
      </div>
      <SettingsForm initial={initial} />
    </div>
  );
}
