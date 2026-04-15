import type { MetadataRoute } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return 'http://localhost:3000';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '/',            changeFrequency: 'weekly', priority: 1.0 },
  { path: '/shop',        changeFrequency: 'weekly', priority: 0.9 },
  { path: '/workshops',   changeFrequency: 'weekly', priority: 0.9 },
  { path: '/gallery',     changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about',       changeFrequency: 'monthly', priority: 0.7 },
  { path: '/the-craft',   changeFrequency: 'monthly', priority: 0.7 },
  { path: '/support-us',  changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact',     changeFrequency: 'yearly',  priority: 0.6 },
  { path: '/privacy',     changeFrequency: 'yearly',  priority: 0.3 },
  { path: '/terms',       changeFrequency: 'yearly',  priority: 0.3 },
  { path: '/delivery',    changeFrequency: 'yearly',  priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createSupabaseServerClient();
      const [products, workshops, posts] = await Promise.all([
        supabase
          .from('stick_products')
          .select('slug, updated_at')
          .in('status', ['published', 'sold']),
        supabase
          .from('stick_workshops')
          .select('slug, updated_at')
          .in('status', ['upcoming', 'fully_booked', 'completed']),
        supabase
          .from('stick_blog_posts')
          .select('slug, updated_at')
          .eq('status', 'published'),
      ]);

      for (const p of (products.data ?? []) as Array<{ slug: string; updated_at: string }>) {
        dynamicEntries.push({
          url: `${base}/shop/${p.slug}`,
          lastModified: new Date(p.updated_at),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }

      for (const w of (workshops.data ?? []) as Array<{ slug: string; updated_at: string }>) {
        dynamicEntries.push({
          url: `${base}/workshops/${w.slug}`,
          lastModified: new Date(w.updated_at),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }

      for (const b of (posts.data ?? []) as Array<{ slug: string; updated_at: string }>) {
        dynamicEntries.push({
          url: `${base}/blog/${b.slug}`,
          lastModified: new Date(b.updated_at),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    } catch {
      // Tolerate — static sitemap is still valid
    }
  }

  return [...staticEntries, ...dynamicEntries];
}
