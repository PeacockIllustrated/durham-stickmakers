import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { syncProductToStripe } from '@/lib/stripe-sync';
import type { StickProduct, StickProductImage } from '@/types/stick';

function getSiteUrl(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return /^https?:\/\//i.test(envUrl) ? envUrl : `https://${envUrl}`;
  }
  // Fall back to request origin
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
  }

  let body: { productId?: string };
  try {
    body = (await request.json()) as { productId?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: product } = await supabase
    .from('stick_products')
    .select('*, images:stick_product_images(*)')
    .eq('id', body.productId)
    .maybeSingle();

  const typed = product as (StickProduct & { images: StickProductImage[] }) | null;
  if (!typed) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  if (typed.status !== 'published') {
    return NextResponse.json({ error: 'This product is not available' }, { status: 409 });
  }
  if (typed.stock_count <= 0) {
    return NextResponse.json({ error: 'Out of stock' }, { status: 409 });
  }

  // Ensure Stripe product + price exist and are in sync with current title/price.
  // syncProductToStripe creates a new immutable price if price_pence changed.
  const primary =
    typed.images?.find((i) => i.is_primary) ?? typed.images?.[0] ?? null;

  const synced = await syncProductToStripe({
    id: typed.id,
    title: typed.title,
    description: typed.description,
    price_pence: typed.price_pence,
    stripe_product_id: typed.stripe_product_id,
    stripe_price_id: typed.stripe_price_id,
    primary_image_path: primary?.storage_path ?? null,
  });

  if (!synced.stripe_price_id) {
    return NextResponse.json({ error: 'Could not prepare payment' }, { status: 500 });
  }

  // Persist back any new IDs so repeat purchases reuse them
  if (
    synced.stripe_product_id !== typed.stripe_product_id ||
    synced.stripe_price_id !== typed.stripe_price_id
  ) {
    await supabase
      .from('stick_products')
      .update({
        stripe_product_id: synced.stripe_product_id,
        stripe_price_id: synced.stripe_price_id,
      })
      .eq('id', typed.id);
  }

  const siteUrl = getSiteUrl(request);
  const stripe = getStripe();

  // Shipping rate lookup from site config
  const { data: shippingRow } = await supabase
    .from('stick_site_config')
    .select('value')
    .eq('key', 'shipping_rates')
    .maybeSingle();

  const shippingRates = (shippingRow?.value as {
    standard_pence?: number;
    oversized_pence?: number;
    collection_pence?: number;
  } | null) ?? null;

  const shippingPence =
    typed.shipping_class === 'collection'
      ? 0
      : typed.shipping_class === 'oversized'
        ? (shippingRates?.oversized_pence ?? 1495)
        : typed.shipping_class === 'digital'
          ? 0
          : (shippingRates?.standard_pence ?? 895);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: synced.stripe_price_id,
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/shop/${typed.slug}?cancelled=1`,
    shipping_address_collection:
      typed.shipping_class === 'digital' || typed.shipping_class === 'collection'
        ? undefined
        : { allowed_countries: ['GB'] },
    shipping_options:
      shippingPence > 0
        ? [
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: { amount: shippingPence, currency: 'gbp' },
                display_name:
                  typed.shipping_class === 'oversized'
                    ? 'Oversized parcel (walking stick)'
                    : 'Standard UK delivery',
              },
            },
          ]
        : undefined,
    metadata: {
      stick_product_id: typed.id,
      stick_product_title: typed.title,
      stick_product_slug: typed.slug,
      stick_product_type: typed.product_type,
    },
    payment_intent_data: {
      metadata: {
        stick_product_id: typed.id,
      },
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: 'Stripe did not return a session URL' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
