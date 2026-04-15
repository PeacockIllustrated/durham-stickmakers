import { cache } from 'react';
import { createSupabaseServerClient } from './supabase/server';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

export interface SiteConfig {
  charity_number: string;
  charity_name: string;
  contact_email: string;
  workshop_address: {
    line1: string;
    line2?: string;
    town: string;
    county: string;
    postcode: string;
  };
  opening_hours: {
    regular_sessions: Array<{ day: string; start: string; end: string }>;
    note?: string;
  };
  social_links: { instagram?: string; facebook?: string };
  shipping_rates: {
    standard_pence: number;
    oversized_pence: number;
    collection_pence: number;
    free_threshold_pence: number;
  };
  donation_cta: string;
  hero_headline: string;
  hero_subtitle: string;
}

/** Hardcoded defaults — used when Supabase is unreachable or a key is missing. */
const DEFAULTS: SiteConfig = {
  charity_number: '1212357',
  charity_name: 'Durham Stick Makers',
  contact_email: 'info@durham-stickmakers.com',
  workshop_address: {
    line1: 'Fencehouses Community Centre',
    line2: 'Fencehouses',
    town: 'Houghton le Spring',
    county: 'County Durham',
    postcode: 'DH4 6DS',
  },
  opening_hours: {
    regular_sessions: [
      { day: 'Monday', start: '18:00', end: '21:00' },
      { day: 'Tuesday', start: '18:00', end: '21:00' },
    ],
    note: 'Drop-in welcome. Kettle is always on.',
  },
  social_links: {
    instagram: 'https://instagram.com/durham_stickmakers',
    facebook: 'https://facebook.com/Durham Stickmakers',
  },
  shipping_rates: {
    standard_pence: 895,
    oversized_pence: 1495,
    collection_pence: 0,
    free_threshold_pence: 15000,
  },
  donation_cta:
    'Help us preserve an endangered heritage craft and provide walking sticks to those who need them most.',
  hero_headline: 'Shaped by hand. Rooted in tradition.',
  hero_subtitle:
    'Preserving the endangered art of stick making — teaching, making, and giving sticks to those who need them most.',
};

/**
 * Fetch site config, deduped per request. Falls back to DEFAULTS for any
 * key missing from the DB so pages can render before migrations are applied.
 */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return DEFAULTS;
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('stick_site_config').select('key, value');
    if (error || !data) return DEFAULTS;

    const map = new Map<string, JsonValue>(data.map((r) => [r.key, r.value as JsonValue]));
    const get = <K extends keyof SiteConfig>(key: K): SiteConfig[K] =>
      (map.has(key) ? (map.get(key) as SiteConfig[K]) : DEFAULTS[key]);

    return {
      charity_number: get('charity_number'),
      charity_name: get('charity_name'),
      contact_email: get('contact_email'),
      workshop_address: get('workshop_address'),
      opening_hours: get('opening_hours'),
      social_links: get('social_links'),
      shipping_rates: get('shipping_rates'),
      donation_cta: get('donation_cta'),
      hero_headline: get('hero_headline'),
      hero_subtitle: get('hero_subtitle'),
    };
  } catch {
    return DEFAULTS;
  }
});
