import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProductForm, type ProductFormInitial } from '@/components/ProductForm';
import type {
  StickProduct,
  StickProductImage,
  StickCategory,
  StickMaker,
  StickMaterial,
} from '@/types/stick';

export const metadata = { title: 'Edit product' };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();

  const { data: product } = await supabase
    .from('stick_products')
    .select('*, images:stick_product_images(*)')
    .eq('id', params.id)
    .maybeSingle();

  if (!product) notFound();

  const [cats, makers, mats] = await Promise.all([
    supabase.from('stick_categories').select('*').order('display_order'),
    supabase.from('stick_makers').select('*').eq('is_active', true).order('display_order'),
    supabase.from('stick_materials').select('*'),
  ]);

  const typedProduct = product as StickProduct & { images: StickProductImage[] };
  const sortedImages = [...(typedProduct.images ?? [])].sort(
    (a, b) => a.display_order - b.display_order
  );

  const initial: ProductFormInitial = {
    id: typedProduct.id,
    title: typedProduct.title,
    description: typedProduct.description ?? '',
    price_gbp: (typedProduct.price_pence / 100).toFixed(2),
    product_type: typedProduct.product_type,
    status: typedProduct.status,
    category_id: typedProduct.category_id,
    maker_id: typedProduct.maker_id,
    handle_material: typedProduct.handle_material ?? '',
    shank_material: typedProduct.shank_material ?? '',
    collar_material: typedProduct.collar_material ?? '',
    length_inches: typedProduct.length_inches?.toString() ?? '',
    weight_description: typedProduct.weight_description ?? '',
    stock_count: typedProduct.stock_count.toString(),
    is_featured: typedProduct.is_featured,
    shipping_class: typedProduct.shipping_class,
    stripe_product_id: typedProduct.stripe_product_id,
    stripe_price_id: typedProduct.stripe_price_id,
    images: sortedImages.map((img, i) => ({
      id: img.id,
      storage_path: img.storage_path,
      alt_text: img.alt_text,
      display_order: i,
      is_primary: i === 0,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="text-xs uppercase tracking-wider text-stick-driftwood hover:text-stick-brass">
          ← Products
        </Link>
        <h1 className="mt-2 font-heading text-h1">Edit listing</h1>
        <p className="text-stick-driftwood text-small mt-1">
          {typedProduct.status === 'published' ? 'Live in the shop.' : `Status: ${typedProduct.status}`}
        </p>
      </div>
      <ProductForm
        mode="edit"
        initial={initial}
        categories={(cats.data as StickCategory[] | null) ?? []}
        makers={(makers.data as StickMaker[] | null) ?? []}
        materials={(mats.data as StickMaterial[] | null) ?? []}
      />
    </div>
  );
}
