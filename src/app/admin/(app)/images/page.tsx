import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import {
  IMAGE_FLAG_LABELS,
  IMAGE_FLAG_REASONS,
  type ImageFlagReason,
  type StickImageFlag,
} from '@/types/stick';
import { ImageFlagCard, type FlagUsage } from './ImageFlagCard';

export const metadata = { title: 'Image tasks' };

type Supabase = ReturnType<typeof createSupabaseServerClient>;

/**
 * Work out where each flagged image is actually used.
 *
 * Flags key on storage_path, which is deliberately independent of any one
 * table, so usage has to be resolved by looking the path up across every
 * place an image can be attached. An image with no match is still shown —
 * an orphaned upload is worth knowing about too.
 */
async function resolveUsage(
  supabase: Supabase,
  paths: string[]
): Promise<Map<string, FlagUsage>> {
  const usage = new Map<string, FlagUsage>();
  if (paths.length === 0) return usage;

  const [productImages, gallery, makers, posts, workshops] = await Promise.all([
    supabase.from('stick_product_images').select('storage_path, product_id').in('storage_path', paths),
    supabase.from('stick_gallery_images').select('storage_path, title').in('storage_path', paths),
    supabase.from('stick_makers').select('id, name, photo_path').in('photo_path', paths),
    supabase
      .from('stick_blog_posts')
      .select('id, title, featured_image_path')
      .in('featured_image_path', paths),
    supabase
      .from('stick_workshops')
      .select('id, title, featured_image_path')
      .in('featured_image_path', paths),
  ]);

  // Product titles need a second lookup — a nested join returns an awkward
  // shape here and the id list is tiny
  const productRows = (productImages.data ?? []) as { storage_path: string; product_id: string }[];
  const productIds = [...new Set(productRows.map((row) => row.product_id))];
  const products = productIds.length
    ? (
        (await supabase.from('stick_products').select('id, title').in('id', productIds)).data ?? []
      ) as { id: string; title: string }[]
    : [];
  const productTitle = new Map(products.map((p) => [p.id, p.title]));

  for (const row of productRows) {
    usage.set(row.storage_path, {
      label: `Product — ${productTitle.get(row.product_id) ?? 'Untitled'}`,
      href: `/admin/products/${row.product_id}/edit`,
    });
  }
  for (const row of (gallery.data ?? []) as { storage_path: string; title: string | null }[]) {
    usage.set(row.storage_path, { label: `Gallery — ${row.title ?? 'Untitled'}`, href: null });
  }
  for (const row of (makers.data ?? []) as { id: string; name: string; photo_path: string }[]) {
    usage.set(row.photo_path, {
      label: `Member — ${row.name}`,
      href: `/admin/makers/${row.id}/edit`,
    });
  }
  for (const row of (posts.data ?? []) as {
    id: string;
    title: string;
    featured_image_path: string;
  }[]) {
    usage.set(row.featured_image_path, {
      label: `Blog — ${row.title}`,
      href: `/admin/blog/${row.id}/edit`,
    });
  }
  for (const row of (workshops.data ?? []) as {
    id: string;
    title: string;
    featured_image_path: string;
  }[]) {
    usage.set(row.featured_image_path, {
      label: `Workshop — ${row.title}`,
      href: `/admin/workshops/${row.id}/edit`,
    });
  }

  return usage;
}

export default async function AdminImagesPage({
  searchParams,
}: {
  searchParams: { show?: string };
}) {
  const showDone = searchParams.show === 'done';

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('stick_image_flags')
    .select('*')
    .order('created_at', { ascending: false });

  const allFlags = (data as StickImageFlag[] | null) ?? [];
  const outstanding = allFlags.filter((f) => !f.resolved);
  const done = allFlags.filter((f) => f.resolved);
  const shown = showDone ? done : outstanding;

  const usage = await resolveUsage(
    supabase,
    shown.map((f) => f.storage_path)
  );

  // Counts per reason, for the summary strip
  const counts = IMAGE_FLAG_REASONS.map((reason) => ({
    reason,
    count: outstanding.filter((f) => f.reason === reason).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-h1">Image tasks</h1>
        <p className="mt-1 text-small text-stick-driftwood">
          Every image flagged as needing work, from anywhere on the site. Flag images
          as you go using the picker under each photo in a product, member, blog or
          workshop form.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load image tasks: {error.message}
        </div>
      )}

      {/* Summary — what is outstanding, by reason */}
      {outstanding.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {counts.map(({ reason, count }) => (
            <div
              key={reason}
              className={cn(
                'rounded-card border bg-stick-surface px-4 py-3',
                count > 0 ? 'border-stick-brass/50' : 'border-stick-stone'
              )}
            >
              <p className="font-heading text-h2 leading-none text-stick-walnut">{count}</p>
              <p className="mt-1 text-small text-stick-driftwood">
                {IMAGE_FLAG_LABELS[reason as ImageFlagReason]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Outstanding / done toggle */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/images"
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium no-underline transition-colors',
            !showDone
              ? 'bg-stick-walnut text-stick-linen'
              : 'text-stick-walnut hover:bg-stick-stone'
          )}
        >
          Outstanding ({outstanding.length})
        </Link>
        <Link
          href="/admin/images?show=done"
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium no-underline transition-colors',
            showDone ? 'bg-stick-walnut text-stick-linen' : 'text-stick-walnut hover:bg-stick-stone'
          )}
        >
          Done ({done.length})
        </Link>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-card border border-dashed border-stick-stone bg-stick-surface p-10 text-center text-stick-driftwood">
          <p className="font-heading text-h3 text-stick-walnut">
            {showDone ? 'Nothing marked done yet' : 'No images need work'}
          </p>
          <p className="mt-2 text-small">
            {showDone
              ? 'Images you mark as done will be listed here.'
              : 'Flag an image from any product, member, blog or workshop form and it will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((flag) => (
            <ImageFlagCard
              key={flag.id}
              flag={flag}
              usage={usage.get(flag.storage_path) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
