'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus, updateTrackingNumber } from './actions';
import { formatPence, cn } from '@/lib/utils';
import type { OrderStatus, StickOrder } from '@/types/stick';

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const STATUS_COLOURS: Record<OrderStatus, string> = {
  pending: 'bg-stick-cream text-stick-driftwood',
  paid: 'bg-stick-brass/20 text-stick-walnut',
  shipped: 'bg-stick-fell/15 text-stick-fell',
  delivered: 'bg-stick-fell text-stick-linen',
  cancelled: 'bg-stick-stone text-stick-driftwood',
  refunded: 'bg-red-100 text-red-800',
};

export function OrderRow({ order }: { order: StickOrder }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [tracking, setTracking] = useState(order.tracking_number ?? '');
  const [pending, startTransition] = useTransition();
  const [savedTracking, setSavedTracking] = useState(false);

  function onStatusChange(next: OrderStatus) {
    setStatus(next);
    startTransition(() => {
      void updateOrderStatus(order.id, next);
    });
  }

  function onTrackingSave() {
    setSavedTracking(false);
    startTransition(() => {
      void updateTrackingNumber(order.id, tracking).then(() => {
        setSavedTracking(true);
        setTimeout(() => setSavedTracking(false), 2000);
      });
    });
  }

  const placed = new Date(order.created_at).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal = order.total_pence - order.shipping_pence;

  return (
    <li className="rounded-card border border-stick-stone bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-4 p-4 md:p-5 text-left"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-medium text-stick-walnut">
              {order.customer_name ?? order.customer_email}
            </span>
            <span className="text-xs text-stick-driftwood">{placed}</span>
          </div>
          <div className="mt-0.5 text-small text-stick-driftwood truncate">
            {order.items.length > 0 ? order.items.map((i) => i.title).join(', ') : 'No items'}
            {' · '}{order.customer_email}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize', STATUS_COLOURS[status])}>
            {status}
          </span>
          <span className="font-medium text-stick-walnut">
            {formatPence(order.total_pence)}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-stick-stone p-4 md:p-5 grid gap-5 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div>
              <p className="label-caps">Items</p>
              <ul className="mt-2 space-y-1 text-sm text-stick-shale">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span>{item.title} × {item.quantity}</span>
                    <span>{formatPence(item.price_pence)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-1 border-t border-stick-stone pt-3 text-sm">
                <div className="flex justify-between text-stick-driftwood">
                  <dt>Subtotal</dt>
                  <dd>{formatPence(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-stick-driftwood">
                  <dt>Shipping</dt>
                  <dd>{formatPence(order.shipping_pence)}</dd>
                </div>
                <div className="flex justify-between font-medium text-stick-walnut">
                  <dt>Total</dt>
                  <dd>{formatPence(order.total_pence)}</dd>
                </div>
              </dl>
            </div>

            {order.shipping_address && (
              <div>
                <p className="label-caps">Ship to</p>
                <address className="mt-2 not-italic text-sm text-stick-shale leading-relaxed">
                  {order.customer_name && <>{order.customer_name}<br /></>}
                  {order.shipping_address.line1}<br />
                  {order.shipping_address.line2 && <>{order.shipping_address.line2}<br /></>}
                  {order.shipping_address.city}<br />
                  {order.shipping_address.county && <>{order.shipping_address.county}<br /></>}
                  {order.shipping_address.postcode}<br />
                  {order.shipping_address.country}
                </address>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor={`status-${order.id}`} className="input-label">Status</label>
              <select
                id={`status-${order.id}`}
                value={status}
                onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
                className="input capitalize"
                disabled={pending}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`tracking-${order.id}`} className="input-label">Tracking</label>
              <div className="flex gap-2">
                <input
                  id={`tracking-${order.id}`}
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  className="input"
                  placeholder="e.g. RM123456789GB"
                />
                <button
                  type="button"
                  onClick={onTrackingSave}
                  disabled={pending}
                  className="btn-outline px-3 py-2 shrink-0"
                >
                  Save
                </button>
              </div>
              {savedTracking && (
                <p className="mt-1 text-xs text-stick-fell">Saved</p>
              )}
            </div>

            <div className="pt-2 border-t border-stick-stone space-y-1 text-xs text-stick-driftwood">
              {order.stripe_session_id && (
                <p className="break-all">Session: {order.stripe_session_id}</p>
              )}
              {order.stripe_payment_intent && (
                <p className="break-all">Intent: {order.stripe_payment_intent}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
