'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { bookWorkshop, type BookingResult } from './actions';

const initialState: BookingResult | null = null;

function SubmitButton({ priceLabel }: { priceLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? 'Booking…' : `Book a place · ${priceLabel}`}
    </button>
  );
}

export function BookingForm({
  workshopId,
  priceLabel,
  maxSpotsPerBooking,
  spotsRemaining,
}: {
  workshopId: string;
  priceLabel: string;
  maxSpotsPerBooking: number;
  spotsRemaining: number;
}) {
  const [state, formAction] = useFormState(bookWorkshop, initialState);

  if (state?.ok) {
    const count = state.attendees ?? 1;
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-card border border-stick-fell/30 bg-stick-fell/5 p-5"
      >
        <p className="font-heading text-h3 text-stick-fell">
          {count === 1 ? 'Your spot is booked.' : `${count} spots booked.`}
        </p>
        <p className="mt-2 text-small text-stick-shale leading-relaxed">
          We&rsquo;ll email you a confirmation shortly. If you don&rsquo;t hear from us
          within a couple of days, get in touch and we&rsquo;ll check the list.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="workshop_id" value={workshopId} />

      {state?.error && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Honeypot */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="booking-name" className="input-label">Your name <span className="text-stick-brass">*</span></label>
        <input id="booking-name" name="name" type="text" autoComplete="name" required className="input" />
      </div>
      <div>
        <label htmlFor="booking-email" className="input-label">Email <span className="text-stick-brass">*</span></label>
        <input id="booking-email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label htmlFor="booking-phone" className="input-label">Phone <span className="text-stick-driftwood text-xs font-normal">(optional)</span></label>
        <input id="booking-phone" name="phone" type="tel" autoComplete="tel" className="input" />
      </div>
      <div>
        <label htmlFor="booking-attendees" className="input-label">How many places?</label>
        <select
          id="booking-attendees"
          name="attendees"
          defaultValue="1"
          className="input"
        >
          {Array.from(
            { length: Math.min(maxSpotsPerBooking, spotsRemaining) },
            (_, i) => i + 1
          ).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <SubmitButton priceLabel={priceLabel} />

      <p className="text-xs text-stick-driftwood">
        We&rsquo;ll only use your details for this booking.
      </p>
    </form>
  );
}
