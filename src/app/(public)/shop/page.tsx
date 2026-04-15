import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/ProductCard';
import { HOMEPAGE_SHOWCASE } from '@/lib/site-images';
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

  const previewImage = HOMEPAGE_SHOWCASE[0];

  return (
    <section className="section">
      <div className="container-wide">
        <div className="max-w-2xl">
          <span className="label-caps">Shop</span>
          <h1 className="mt-2 font-heading text-hero">Handmade sticks &amp; supplies</h1>
          <p className="mt-4 text-stick-shale text-lg">
            Each finished stick is unique — dressed by hand by a Durham Stick Makers member.
            Proceeds support the charity&rsquo;s work preserving the craft.
          </p>
        </div>

        <div className="mt-12">
          {products.length === 0 ? (
            <div className="grid gap-0 lg:grid-cols-5 overflow-hidden rounded-card border border-stick-stone bg-white">
              <div className="relative aspect-[4/3] lg:aspect-auto lg:col-span-3 bg-stick-stone">
                <Image
                  src={previewImage.src}
                  alt={previewImage.alt}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-10 lg:col-span-2">
                <p className="font-heading text-h2 text-stick-walnut">The shop is opening soon</p>
                <p className="mt-3 text-stick-shale">
                  Our first listings are being photographed and written up. In the meantime,
                  drop in to a workshop to see sticks in the making, or browse the gallery for
                  a feel of the work.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/gallery" className="btn-primary">See the gallery</Link>
                  <Link href="/workshops" className="btn-outline">Visit a workshop</Link>
                </div>
              </div>
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
