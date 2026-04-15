import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { syncProductToStripe } from '@/lib/stripe-sync';
import type { ProductType, ProductStatus, ShippingClass } from '@/types/stick';

interface ImagePayload {
  id?: string;
  storage_path: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

interface CreateBody {
  title: string;
  description: string | null;
  price_pence: number;
  product_type: ProductType;
  status: ProductStatus;
  category_id: string | null;
  maker_id: string | null;
  handle_material: string | null;
  shank_material: string | null;
  collar_material: string | null;
  length_inches: number | null;
  weight_description: string | null;
  stock_count: number;
  is_featured: boolean;
  shipping_class: ShippingClass;
  images: ImagePayload[];
}

export async function POST(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 });
  }
  if (!Number.isFinite(body.price_pence) || body.price_pence < 0) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  const { data: product, error: insertErr } = await supabase
    .from('stick_products')
    .insert({
      title: body.title.trim(),
      description: body.description,
      price_pence: body.price_pence,
      product_type: body.product_type,
      status: body.status,
      category_id: body.category_id,
      maker_id: body.maker_id,
      handle_material: body.handle_material,
      shank_material: body.shank_material,
      collar_material: body.collar_material,
      length_inches: body.length_inches,
      weight_description: body.weight_description,
      stock_count: body.stock_count,
      is_featured: body.is_featured,
      shipping_class: body.shipping_class,
    })
    .select()
    .single();

  if (insertErr || !product) {
    return NextResponse.json({ error: insertErr?.message ?? 'Insert failed' }, { status: 500 });
  }

  // Insert images
  if (body.images.length > 0) {
    const rows = body.images.map((img) => ({
      product_id: product.id,
      storage_path: img.storage_path,
      alt_text: img.alt_text,
      display_order: img.display_order,
      is_primary: img.is_primary,
    }));
    const { error: imgErr } = await supabase.from('stick_product_images').insert(rows);
    if (imgErr) {
      return NextResponse.json({ error: imgErr.message }, { status: 500 });
    }
  }

  // Stripe sync only when publishing
  if (product.status === 'published') {
    try {
      const primary = body.images.find((i) => i.is_primary) ?? body.images[0];
      const synced = await syncProductToStripe({
        id: product.id,
        title: product.title,
        description: product.description,
        price_pence: product.price_pence,
        stripe_product_id: null,
        stripe_price_id: null,
        primary_image_path: primary?.storage_path ?? null,
      });
      if (synced.stripe_product_id) {
        await supabase
          .from('stick_products')
          .update({
            stripe_product_id: synced.stripe_product_id,
            stripe_price_id: synced.stripe_price_id,
          })
          .eq('id', product.id);
      }
    } catch (err) {
      // Non-fatal: product is saved, admin can retry publish
      console.error('Stripe sync failed', err);
    }
  }

  return NextResponse.json({ id: product.id });
}
