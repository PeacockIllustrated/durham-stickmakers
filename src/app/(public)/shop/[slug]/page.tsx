import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/ProductCard';
import { ProductImageGallery } from '@/components/ProductImageGallery';
import { BuyButton } from '@/components/BuyButton';
import { formatPence, cn } from '@/lib/utils';
import type { StickProduct } from '@/types/stick';

interface PageProps {
  params: { slug: string };
}

async function fetchProduct(slug: string): Promise<StickProduct | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('stick_products')
    .select('*, maker:stick_makers(*), category:stick_categories(*), images:stick_product_images(*)')
    .eq('slug', slug)
    .in('status', ['published', 'sold'])
    .maybeSingle();
  return (data as StickProduct | null) ?? null;
}

async function fetchRelated(categoryId: string | null, excludeId: string): Promise<StickProduct[]> {
  if (!categoryId || !process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('stick_products')
    .select('*, maker:stick_makers(id, name), images:stick_product_images(*)')
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .order('updated_at', { ascending: false })
    .limit(3);
  return (data as StickProduct[] | null) ?? [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await fetchProduct(params.slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.meta_title ?? product.title,
    description: product.meta_description ?? product.description?.slice(0, 160) ?? undefined,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: { title: product.title, description: product.description ?? undefined },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await fetchProduct(params.slug);
  if (!product) notFound();

  const related = await fetchRelated(product.category_id, product.id);
  const isSold = product.status === 'sold';
  const isOneOfAKind = product.product_type === 'one_of_a_kind';

  const spec: Array<{ label: string; value: string }> = [];
  if (product.category?.name) spec.push({ label: 'Category', value: product.category.name });
  if (product.handle_material) spec.push({ label: 'Handle', value: product.handle_material });
  if (product.shank_material) spec.push({ label: 'Shank', value: product.shank_material });
  if (product.collar_material) spec.push({ label: 'Collar', value: product.collar_material });
  if (product.length_inches) spec.push({ label: 'Length', value: `${product.length_inches}"` });
  if (product.weight_description) spec.push({ label: 'Weight', value: product.weight_description });

  return (
    <>
      <section className="section">
        <div className="container-wide">
          <nav className="text-small text-stick-driftwood mb-6">
            <Link href="/shop" className="hover:text-stick-brass">Shop</Link>
            {' / '}
            {product.category && (
              <>
                <span>{product.category.name}</span>
                {' / '}
              </>
            )}
            <span className="text-stick-shale">{product.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <ProductImageGallery images={product.images ?? []} title={product.title} />
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {isOneOfAKind && <span className="pill-brass">One of a kind</span>}
                {isSold && <span className="pill bg-stick-walnut text-stick-linen">Sold</span>}
                {product.category && !isSold && (
                  <span className="pill">{product.category.name}</span>
                )}
              </div>

              <h1 className="font-heading text-hero leading-tight">{product.title}</h1>

              {product.maker?.name && (
                <p className="text-stick-driftwood text-small">
                  Made by <span className="text-stick-walnut">{product.maker.name}</span>
                </p>
              )}

              <p className={cn(
                'font-heading text-h1 text-stick-walnut',
                isSold && 'line-through opacity-60'
              )}>
                {formatPence(product.price_pence)}
              </p>

              {product.description && (
                <div className="prose prose-stick whitespace-pre-wrap text-stick-shale leading-relaxed">
                  {product.description}
                </div>
              )}

              {spec.length > 0 && (
                <dl className="grid grid-cols-2 gap-y-3 gap-x-6 border-t border-stick-stone pt-5">
                  {spec.map((s) => (
                    <div key={s.label}>
                      <dt className="label-caps">{s.label}</dt>
                      <dd className="mt-1 text-stick-walnut">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="pt-4">
                <BuyButton
                  productId={product.id}
                  disabled={isSold || product.stock_count === 0}
                  disabledLabel={isSold ? 'Sold' : 'Out of stock'}
                  label={isOneOfAKind ? 'Buy this stick' : 'Add to basket'}
                />
                <p className="mt-3 text-xs text-stick-driftwood">
                  Secure checkout via Stripe · Questions?{' '}
                  <Link href="/contact" className="text-stick-walnut hover:text-stick-brass">
                    Get in touch
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section pt-0">
          <div className="container-wide">
            <h2 className="font-heading text-h1 mb-8">More like this</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildProductJsonLd(product) }}
      />
    </>
  );
}

function buildProductJsonLd(product: StickProduct): string {
  const primary = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? (/^https?:\/\//.test(process.env.NEXT_PUBLIC_SITE_URL)
        ? process.env.NEXT_PUBLIC_SITE_URL
        : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
    : 'http://localhost:3000';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description ?? undefined,
    image: primary
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/stick-images/${primary.storage_path}`
      : undefined,
    url: `${siteUrl}/shop/${product.slug}`,
    brand: { '@type': 'Organization', name: 'Durham Stick Makers' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: (product.price_pence / 100).toFixed(2),
      availability:
        product.status === 'sold'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
      url: `${siteUrl}/shop/${product.slug}`,
    },
  };
  return JSON.stringify(data);
}
