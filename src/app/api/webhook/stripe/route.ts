import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import type { OrderItem, ShippingAddress } from '@/types/stick';

export const runtime = 'nodejs';
// Stripe requires the raw body to verify signatures
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const raw = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'invalid';
    return NextResponse.json({ error: `Signature verification failed: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case 'charge.refunded': {
        await handleRefund(event.data.object as Stripe.Charge);
        break;
      }
      // Silently ignore the rest — keeps the webhook endpoint tolerant
      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createSupabaseServiceClient();

  // Idempotency — if we've already created an order for this session, skip.
  const { data: existing } = await supabase
    .from('stick_orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle();
  if (existing) return;

  const productId = session.metadata?.stick_product_id ?? null;
  const productTitle = session.metadata?.stick_product_title ?? 'Unknown';
  const productType = session.metadata?.stick_product_type ?? 'one_of_a_kind';

  const totalPence = session.amount_total ?? 0;
  const shippingPence = session.shipping_cost?.amount_total ?? 0;
  const subtotalPence = (session.amount_subtotal ?? 0);

  const address = session.shipping_details?.address ?? session.customer_details?.address ?? null;
  const shippingAddress: ShippingAddress | null = address
    ? {
        line1: address.line1 ?? '',
        line2: address.line2 ?? undefined,
        city: address.city ?? '',
        county: address.state ?? undefined,
        postcode: address.postal_code ?? '',
        country: address.country ?? 'GB',
      }
    : null;

  const items: OrderItem[] = productId
    ? [
        {
          product_id: productId,
          title: productTitle,
          price_pence: subtotalPence,
          quantity: 1,
        },
      ]
    : [];

  const { error: orderErr } = await supabase.from('stick_orders').insert({
    stripe_session_id: session.id,
    stripe_payment_intent:
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
    customer_email: session.customer_details?.email ?? session.customer_email ?? '',
    customer_name: session.customer_details?.name ?? null,
    customer_phone: session.customer_details?.phone ?? null,
    total_pence: totalPence,
    shipping_pence: shippingPence,
    status: 'paid',
    shipping_address: shippingAddress,
    items,
  });

  if (orderErr) {
    console.error('Failed to create stick_orders row', orderErr);
    return;
  }

  // For one-of-a-kind sticks: mark as sold to remove from shop.
  if (productId && productType === 'one_of_a_kind') {
    await supabase
      .from('stick_products')
      .update({ status: 'sold', stock_count: 0 })
      .eq('id', productId);
  } else if (productId) {
    // For supplies: decrement stock_count by 1 (guard against going below 0).
    const { data: row } = await supabase
      .from('stick_products')
      .select('stock_count')
      .eq('id', productId)
      .maybeSingle();
    if (row) {
      const next = Math.max(0, (row.stock_count ?? 0) - 1);
      await supabase
        .from('stick_products')
        .update({ stock_count: next })
        .eq('id', productId);
    }
  }
}

async function handleRefund(charge: Stripe.Charge) {
  const supabase = createSupabaseServiceClient();
  const intent =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id ?? null;
  if (!intent) return;

  await supabase
    .from('stick_orders')
    .update({ status: 'refunded' })
    .eq('stripe_payment_intent', intent);
}
