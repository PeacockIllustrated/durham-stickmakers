import Link from 'next/link';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/ProductCard';
import type { StickProduct } from '@/types/stick';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Handmade walking sticks, supplies, and gift vouchers from Durham Stick Makers.',
};

export default async function ShopPage() {
  let products: StickProduct[] = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('stick_products')
      .select('*, maker:stick_makers(id, name), category:stick_categories(id, name, slug), images:stick_product_images(*)')
      .in('status', ['published', 'sold'])
      .order('updated_at', { ascending: false });
    products = (data as StickProduct[] | null) ?? [];
  }

  return (
    <section className="section">
      <div className="container-wide">
        <div className="max-w-2xl">
          <span className="label-caps">Shop</span>
          <h1 className="mt-2 font-heading text-hero">Handmade sticks & supplies</h1>
          <p className="mt-4 text-stick-shale text-lg">
            Each finished stick is unique — dressed by hand by a Durham Stick Makers member.
            Proceeds support the charity&rsquo;s work preserving the craft.
          </p>
        </div>

        <div className="mt-12">
          {products.length === 0 ? (
            <div className="rounded-card border border-dashed border-stick-stone bg-stick-stone/40 p-10 text-center">
              <p className="font-heading text-h3 text-stick-walnut">The shop is opening soon</p>
              <p className="mt-2 text-small text-stick-driftwood">
                Our first listings are being photographed and written up. Check back shortly,
                or drop in to a workshop to see sticks in the making.
              </p>
              <Link href="/workshops" className="btn-outline mt-6">See workshops</Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
