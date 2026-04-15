import Link from 'next/link';
import type { Metadata } from 'next';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

export const metadata: Metadata = {
  title: 'Thank you',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: { session_id?: string };
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const sessionId = searchParams.session_id;

  let customerName: string | null = null;
  let customerEmail: string | null = null;
  let amountPaid: number | null = null;

  if (sessionId && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      customerName = session.customer_details?.name ?? null;
      customerEmail = session.customer_details?.email ?? null;
      amountPaid = session.amount_total ?? null;
    } catch {
      // Non-fatal — show generic success message
    }
  }

  return (
    <section className="section">
      <div className="container-wide max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stick-fell/15 text-stick-fell">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="label-caps">Order confirmed</span>
        <h1 className="mt-3 font-heading text-hero">
          Thank you{customerName ? `, ${customerName.split(' ')[0]}` : ''}.
        </h1>
        <p className="mt-5 text-stick-shale text-lg leading-relaxed">
          Your order is on its way to the bench. We&rsquo;ll email{' '}
          {customerEmail ? (
            <span className="text-stick-walnut">{customerEmail}</span>
          ) : (
            'you'
          )}{' '}
          when it ships.
        </p>

        {amountPaid !== null && (
          <p className="mt-3 text-small text-stick-driftwood">
            Paid: £{(amountPaid / 100).toFixed(2)}
          </p>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary">Keep browsing</Link>
          <Link href="/contact" className="btn-outline">Get in touch</Link>
        </div>

        <p className="mt-10 text-xs text-stick-driftwood">
          Any questions?{' '}
          <Link href="/contact" className="text-stick-walnut hover:text-stick-brass">
            Contact us
          </Link>{' '}
          and we&rsquo;ll reply as soon as we can.
        </p>
      </div>
    </section>
  );
}
