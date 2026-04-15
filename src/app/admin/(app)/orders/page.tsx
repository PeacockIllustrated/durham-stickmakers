import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { OrderRow } from './OrderRow';
import { cn } from '@/lib/utils';
import type { OrderStatus, StickOrder } from '@/types/stick';

export const metadata = { title: 'Orders' };

const STATUSES: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createSupabaseServerClient();
  const filter = (searchParams.status ?? 'all') as OrderStatus | 'all';

  let query = supabase
    .from('stick_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('status', filter);
  }

  const { data, error } = await query;
  const orders = (data as StickOrder[] | null) ?? [];

  const totalRevenuePence = orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_pence, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1">Orders</h1>
          <p className="text-stick-driftwood text-small mt-1">
            {orders.length === 0
              ? 'No orders yet. Stripe webhooks will create rows here when payments complete.'
              : `${orders.length} ${filter === 'all' ? 'total' : filter} · £${(totalRevenuePence / 100).toFixed(2)} revenue`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={s.value === 'all' ? '/admin/orders' : `/admin/orders?status=${s.value}`}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider no-underline transition-colors',
              filter === s.value
                ? 'bg-stick-walnut text-stick-linen'
                : 'bg-stick-cream text-stick-driftwood hover:bg-stick-stone'
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load orders: {error.message}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-stick-stone bg-white p-10 text-center text-stick-driftwood">
          <p className="font-heading text-h3 text-stick-walnut">No orders yet</p>
          <p className="mt-2 text-small">
            When a customer completes checkout, the Stripe webhook at{' '}
            <code className="text-stick-walnut">/api/webhook/stripe</code> creates an order here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => <OrderRow key={o.id} order={o} />)}
        </ul>
      )}
    </div>
  );
}
