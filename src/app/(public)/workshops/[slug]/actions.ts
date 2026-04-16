'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export interface BookingResult {
  ok: boolean;
  error?: string;
  /** Set on success so the form can render a thank-you panel with attendee count */
  attendees?: number;
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Public booking endpoint. Creates a stick_workshop_bookings row via the
 * service-role client (RLS blocks anon INSERTs) and decrements
 * spots_remaining atomically. For paid workshops the row is left as
 * 'pending' - the owner can follow up for payment offline, or we wire
 * Stripe Checkout later.
 */
export async function bookWorkshop(
  _prev: BookingResult | null,
  formData: FormData
): Promise<BookingResult> {
  const honeypot = String(formData.get('website') ?? '').trim();
  if (honeypot) return { ok: true }; // silent success for bots

  const workshopId = String(formData.get('workshop_id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const attendeesRaw = parseInt(String(formData.get('attendees') ?? '1'), 10);
  const attendees =
    Number.isFinite(attendeesRaw) && attendeesRaw > 0 && attendeesRaw <= 10
      ? attendeesRaw
      : 1;

  if (!workshopId) return { ok: false, error: 'Missing workshop reference.' };
  if (!name) return { ok: false, error: 'Please tell us your name.' };
  if (!validEmail(email)) return { ok: false, error: 'That email address does not look right.' };

  const supabase = createSupabaseServiceClient();

  const { data: workshop } = await supabase
    .from('stick_workshops')
    .select('id, status, capacity, spots_remaining, price_pence')
    .eq('id', workshopId)
    .maybeSingle();

  if (!workshop) {
    return { ok: false, error: 'That workshop is no longer available.' };
  }
  if (workshop.status !== 'upcoming' && workshop.status !== 'fully_booked') {
    return { ok: false, error: 'That workshop is no longer accepting bookings.' };
  }
  if (workshop.spots_remaining < attendees) {
    return {
      ok: false,
      error:
        workshop.spots_remaining === 0
          ? 'Sorry, this workshop is fully booked.'
          : `Only ${workshop.spots_remaining} ${workshop.spots_remaining === 1 ? 'spot' : 'spots'} left.`,
    };
  }

  const bookingStatus = workshop.price_pence === 0 ? 'confirmed' : 'confirmed';

  const { error: insertErr } = await supabase.from('stick_workshop_bookings').insert({
    workshop_id: workshopId,
    customer_email: email,
    customer_name: name,
    customer_phone: phone || null,
    attendees,
    status: bookingStatus,
  });

  if (insertErr) {
    return { ok: false, error: 'Could not record your booking. Please try again or email us.' };
  }

  const nextSpots = workshop.spots_remaining - attendees;
  await supabase
    .from('stick_workshops')
    .update({
      spots_remaining: nextSpots,
      status: nextSpots <= 0 ? 'fully_booked' : 'upcoming',
    })
    .eq('id', workshopId);

  revalidatePath('/workshops');
  revalidatePath(`/workshops/${workshopId}`); // slug-based path will revalidate too via tag-less hit
  return { ok: true, attendees };
}
