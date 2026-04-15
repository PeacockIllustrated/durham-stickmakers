import Stripe from 'stripe';

let cachedStripe: Stripe | null = null;

/**
 * Lazy-initialised Stripe server client. Throws if STRIPE_SECRET_KEY is missing
 * at the point of first use, so the app boots without Stripe configured.
 */
export function getStripe(): Stripe {
  if (cachedStripe) return cachedStripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  cachedStripe = new Stripe(key, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
    appInfo: { name: 'durham-stickmakers', version: '0.1.0' },
  });
  return cachedStripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
