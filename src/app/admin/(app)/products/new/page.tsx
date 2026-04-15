import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProductForm, DEFAULT_PRODUCT_FORM } from '@/components/ProductForm';
import type { StickCategory, StickMaker, StickMaterial } from '@/types/stick';

export const metadata = { title: 'New product' };

export default async function NewProductPage() {
  const supabase = createSupabaseServerClient();
  const [cats, makers, mats] = await Promise.all([
    supabase.from('stick_categories').select('*').order('display_order'),
    supabase.from('stick_makers').select('*').eq('is_active', true).order('display_order'),
    supabase.from('stick_materials').select('*'),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="text-xs uppercase tracking-wider text-stick-driftwood hover:text-stick-brass">
          ← Products
        </Link>
        <h1 className="mt-2 font-heading text-h1">New listing</h1>
        <p className="text-stick-driftwood text-small mt-1">
          Add a new stick, supply, voucher, or workshop product.
        </p>
      </div>
      <ProductForm
        mode="create"
        initial={DEFAULT_PRODUCT_FORM}
        categories={(cats.data as StickCategory[] | null) ?? []}
        makers={(makers.data as StickMaker[] | null) ?? []}
        materials={(mats.data as StickMaterial[] | null) ?? []}
      />
    </div>
  );
}
