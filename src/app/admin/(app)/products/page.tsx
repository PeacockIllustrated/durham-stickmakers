import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatPence, stickImageUrl, cn } from '@/lib/utils';
import type { StickProduct, ProductStatus } from '@/types/stick';

const STATUSES: Array<{ value: ProductStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
  { value: 'sold', label: 'Sold' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_COLOURS: Record<ProductStatus, string> = {
  draft: 'bg-stick-cream text-stick-driftwood',
  published: 'bg-stick-fell/15 text-stick-fell',
  sold: 'bg-stick-walnut text-stick-linen',
  archived: 'bg-stick-stone text-stick-driftwood',
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createSupabaseServerClient();
  const filter = (searchParams.status ?? 'all') as ProductStatus | 'all';

  let query = supabase
    .from('stick_products')
    .select('*, category:stick_categories(name), images:stick_product_images(storage_path, is_primary, display_order)')
    .order('updated_at', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('status', filter);
  }

  const { data, error } = await query;
  const products = (data as StickProduct[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1">Products</h1>
          <p className="text-stick-driftwood text-small mt-1">
            Manage stick listings, supplies, and vouchers.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + New listing
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={s.value === 'all' ? '/admin/products' : `/admin/products?status=${s.value}`}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider no-underline transition-colors',
              filter === s.value
                ? 'bg-stick-walnut text-stick-linen'
                : 'bg-stick-cream text-stick-driftwood hover:bg-stick-stone'
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load products: {error.message}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-card border border-dashed border-stick-stone bg-white p-10 text-center text-stick-driftwood">
          <p className="font-heading text-h3 text-stick-walnut">No products yet</p>
          <p className="mt-2 text-small">Add your first stick to get the shop started.</p>
          <Link href="/admin/products/new" className="btn-primary mt-5">+ New listing</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-stick-stone bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stick-cream/60 text-left text-xs uppercase tracking-wider text-stick-driftwood">
              <tr>
                <th className="px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stick-stone">
              {products.map((p) => {
                const primary = p.images?.find((i) => i.is_primary) ?? p.images?.[0];
                const thumbUrl = primary ? stickImageUrl(primary.storage_path) : null;
                return (
                  <tr key={p.id} className="hover:bg-stick-cream/40">
                    <td className="px-4 py-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-md bg-stick-stone">
                        {thumbUrl ? (
                          <Image src={thumbUrl} alt="" fill sizes="56px" className="object-cover" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-wider text-stick-driftwood">
                            No img
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="font-medium text-stick-walnut hover:text-stick-brass">
                        {p.title}
                      </Link>
                      {p.is_featured && (
                        <span className="ml-2 text-xs uppercase tracking-wider text-stick-brass">Featured</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stick-shale">{p.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-stick-shale capitalize">{p.product_type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-stick-walnut font-medium">{formatPence(p.price_pence)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize', STATUS_COLOURS[p.status])}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stick-driftwood text-xs">
                      {new Date(p.updated_at).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
