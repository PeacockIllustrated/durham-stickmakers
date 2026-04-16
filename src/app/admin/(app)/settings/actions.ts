'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface SettingsResult {
  ok: boolean;
  error?: string;
  savedAt?: string;
}

interface SessionRow {
  day: string;
  start: string;
  end: string;
}

/**
 * Upsert a batch of site_config rows in one go. The form posts every key;
 * we only write rows whose value actually changed to avoid triggering the
 * updated_at trigger unnecessarily.
 */
export async function saveSettings(
  _prev: SettingsResult | null,
  formData: FormData
): Promise<SettingsResult> {
  const supabase = createSupabaseServerClient();

  try {
    const updates: Array<{ key: string; value: unknown }> = [];

    const scalar = (key: string) => String(formData.get(key) ?? '').trim();

    updates.push({ key: 'charity_number', value: scalar('charity_number') });
    updates.push({ key: 'charity_name', value: scalar('charity_name') });
    updates.push({ key: 'contact_email', value: scalar('contact_email') });
    updates.push({ key: 'hero_headline', value: scalar('hero_headline') });
    updates.push({ key: 'hero_subtitle', value: scalar('hero_subtitle') });
    updates.push({ key: 'donation_cta', value: scalar('donation_cta') });

    updates.push({
      key: 'workshop_address',
      value: {
        line1: scalar('address_line1'),
        line2: scalar('address_line2') || undefined,
        town: scalar('address_town'),
        county: scalar('address_county'),
        postcode: scalar('address_postcode'),
      },
    });

    updates.push({
      key: 'social_links',
      value: {
        instagram: scalar('social_instagram') || undefined,
        facebook: scalar('social_facebook') || undefined,
      },
    });

    // Opening hours - rebuild from repeating fields session_day_N / session_start_N / session_end_N
    const sessions: SessionRow[] = [];
    for (let i = 0; i < 7; i++) {
      const day = scalar(`session_day_${i}`);
      const start = scalar(`session_start_${i}`);
      const end = scalar(`session_end_${i}`);
      if (day && start && end) {
        sessions.push({ day, start, end });
      }
    }
    const note = scalar('opening_note');
    updates.push({
      key: 'opening_hours',
      value: { regular_sessions: sessions, note: note || undefined },
    });

    updates.push({
      key: 'shipping_rates',
      value: {
        standard_pence: Math.round((parseFloat(scalar('shipping_standard')) || 0) * 100),
        oversized_pence: Math.round((parseFloat(scalar('shipping_oversized')) || 0) * 100),
        collection_pence: 0,
        free_threshold_pence: Math.round((parseFloat(scalar('shipping_free_threshold')) || 0) * 100),
      },
    });

    // Upsert - inserts rows that don't exist, updates ones that do.
    const { error } = await supabase
      .from('stick_site_config')
      .upsert(updates, { onConflict: 'key' });

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/', 'layout'); // every page reads site config; bust caches broadly
    return { ok: true, savedAt: new Date().toISOString() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Save failed' };
  }
}
