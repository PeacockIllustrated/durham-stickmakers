import { getStripe, isStripeConfigured } from './stripe';
import { stickImageUrl } from './utils';
import type { StickProduct } from '@/types/stick';

type ProductForSync = Pick<
  StickProduct,
  'id' | 'title' | 'description' | 'price_pence' | 'stripe_product_id' | 'stripe_price_id'
> & { primary_image_path?: string | null };

/**
 * Ensure a Stripe product + price exists and matches this record.
 * Creates a new Price if price_pence changed (Stripe prices are immutable).
 * Skips silently if Stripe is not configured — lets the admin work offline.
 *
 * Returns the IDs to persist back to stick_products.
 */
export async function syncProductToStripe(product: ProductForSync): Promise<{
  stripe_product_id: string | null;
  stripe_price_id: string | null;
}> {
  if (!isStripeConfigured()) {
    return {
      stripe_product_id: product.stripe_product_id,
      stripe_price_id: product.stripe_price_id,
    };
  }

  const stripe = getStripe();
  const imageUrl = product.primary_image_path ? stickImageUrl(product.primary_image_path) : null;

  let productId = product.stripe_product_id;
  if (productId) {
    await stripe.products.update(productId, {
      name: product.title,
      description: product.description ?? undefined,
      images: imageUrl ? [imageUrl] : undefined,
      active: true,
      metadata: { stick_product_id: product.id },
    });
  } else {
    const created = await stripe.products.create({
      name: product.title,
      description: product.description ?? undefined,
      images: imageUrl ? [imageUrl] : undefined,
      metadata: { stick_product_id: product.id },
    });
    productId = created.id;
  }

  let priceId = product.stripe_price_id;
  let needNewPrice = !priceId;
  if (priceId) {
    try {
      const existing = await stripe.prices.retrieve(priceId);
      if (existing.unit_amount !== product.price_pence || existing.currency !== 'gbp') {
        await stripe.prices.update(priceId, { active: false });
        needNewPrice = true;
      }
    } catch {
      needNewPrice = true;
    }
  }

  if (needNewPrice) {
    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: product.price_pence,
      currency: 'gbp',
    });
    priceId = newPrice.id;
  }

  return { stripe_product_id: productId, stripe_price_id: priceId };
}

/**
 * Deactivate a Stripe product (used when archiving). Never deletes — Stripe
 * retains historical prices/orders even when product is inactive.
 */
export async function deactivateStripeProduct(stripeProductId: string | null): Promise<void> {
  if (!stripeProductId || !isStripeConfigured()) return;
  try {
    const stripe = getStripe();
    await stripe.products.update(stripeProductId, { active: false });
  } catch {
    // Swallow — archival should not fail because of a Stripe sync hiccup.
  }
}
