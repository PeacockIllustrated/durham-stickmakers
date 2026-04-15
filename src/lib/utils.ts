/**
 * Tiny className joiner — like `clsx` but zero-dependency.
 * Accepts strings, undefined, false, and arrays.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ');
}

/** Format a number of pence as a £ string, e.g. 12500 → "£125.00". */
export function formatPence(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100);
}

/** Format a UK date string (YYYY-MM-DD) as "Thu 14 May 2026". */
export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Format a time string ("HH:MM") as "6:00pm". */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d
    .toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(' ', '')
    .toLowerCase();
}

/**
 * Build a public storage URL for the `stick-images` bucket.
 * Used for product images, gallery images, maker photos, etc.
 */
export function stickImageUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/stick-images/${storagePath}`;
}

/** Slugify a title for URL use. DB has a trigger, but we echo client-side for previews. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
