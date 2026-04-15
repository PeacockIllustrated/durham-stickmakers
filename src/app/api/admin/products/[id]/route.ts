import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { deactivateStripeProduct, syncProductToStripe } from '@/lib/stripe-sync';
import type { ProductType, ProductStatus, ShippingClass } from '@/types/stick';

interface ImagePayload {
  id?: string;
  storage_path: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

interface UpdateBody {
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  const { data: existing, error: fetchErr } = await supabase
    .from('stick_products')
    .select('id, stripe_product_id, stripe_price_id')
    .eq('id', params.id)
    .maybeSingle();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { error: updateErr } = await supabase
    .from('stick_products')
    .update({
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
    .eq('id', params.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Reconcile images: delete removed rows, upsert incoming.
  const { data: currentImgs } = await supabase
    .from('stick_product_images')
    .select('id')
    .eq('product_id', params.id);

  const incomingIds = new Set(body.images.map((i) => i.id).filter(Boolean) as string[]);
  const toDelete = (currentImgs ?? []).filter((row) => !incomingIds.has(row.id)).map((r) => r.id);

  if (toDelete.length > 0) {
    await supabase.from('stick_product_images').delete().in('id', toDelete);
    // Best-effort storage cleanup for those rows
    const { data: pathsRows } = await createSupabaseServiceClient()
      .from('stick_product_images')
      .select('storage_path')
      .in('id', toDelete);
    const paths = (pathsRows as Array<{ storage_path: string }> | null)?.map((r) => r.storage_path) ?? [];
    if (paths.length > 0) {
      await createSupabaseServiceClient().storage.from('stick-images').remove(paths);
    }
  }

  // Upsert images (insert new, update existing)
  for (const img of body.images) {
    if (img.id) {
      await supabase
        .from('stick_product_images')
        .update({
          alt_text: img.alt_text,
          display_order: img.display_order,
          is_primary: img.is_primary,
        })
        .eq('id', img.id);
    } else {
      await supabase.from('stick_product_images').insert({
        product_id: params.id,
        storage_path: img.storage_path,
        alt_text: img.alt_text,
        display_order: img.display_order,
        is_primary: img.is_primary,
      });
    }
  }

  // Stripe sync when published
  if (body.status === 'published') {
    try {
      const primary = body.images.find((i) => i.is_primary) ?? body.images[0];
      const synced = await syncProductToStripe({
        id: params.id,
        title: body.title,
        description: body.description,
        price_pence: body.price_pence,
        stripe_product_id: existing.stripe_product_id,
        stripe_price_id: existing.stripe_price_id,
        primary_image_path: primary?.storage_path ?? null,
      });
      await supabase
        .from('stick_products')
        .update({
          stripe_product_id: synced.stripe_product_id,
          stripe_price_id: synced.stripe_price_id,
        })
        .eq('id', params.id);
    } catch (err) {
      console.error('Stripe sync failed', err);
    }
  }

  return NextResponse.json({ id: params.id });
}

/** Soft delete: set status='archived' and deactivate Stripe product. */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const supabase = createSupabaseServerClient();

  const { data: existing } = await supabase
    .from('stick_products')
    .select('stripe_product_id')
    .eq('id', params.id)
    .maybeSingle();

  const { error } = await supabase
    .from('stick_products')
    .update({ status: 'archived' })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (existing?.stripe_product_id) {
    await deactivateStripeProduct(existing.stripe_product_id);
  }

  return NextResponse.json({ id: params.id });
}
