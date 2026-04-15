import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { WorkshopForm, type WorkshopFormInitial } from '@/components/WorkshopForm';
import type { StickWorkshop, StickWorkshopBooking } from '@/types/stick';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Edit workshop' };

export default async function EditWorkshopPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();

  const [{ data: workshop }, { data: bookings }] = await Promise.all([
    supabase.from('stick_workshops').select('*').eq('id', params.id).maybeSingle(),
    supabase
      .from('stick_workshop_bookings')
      .select('*')
      .eq('workshop_id', params.id)
      .order('created_at', { ascending: false }),
  ]);

  if (!workshop) notFound();
  const w = workshop as StickWorkshop;
  const bookingRows = (bookings as StickWorkshopBooking[] | null) ?? [];

  const initial: WorkshopFormInitial = {
    id: w.id,
    title: w.title,
    description: w.description ?? '',
    date: w.date,
    start_time: w.start_time?.slice(0, 5) ?? '18:00',
    end_time: w.end_time?.slice(0, 5) ?? '21:00',
    capacity: w.capacity.toString(),
    spots_remaining: w.spots_remaining.toString(),
    price_gbp: (w.price_pence / 100).toFixed(2),
    location: w.location,
    status: w.status,
    featured_image_path: w.featured_image_path,
  };

  const totalAttendees = bookingRows
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.attendees, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/workshops" className="text-xs uppercase tracking-wider text-stick-driftwood hover:text-stick-brass">
          ← Workshops
        </Link>
        <h1 className="mt-2 font-heading text-h1">{w.title}</h1>
        <p className="text-stick-driftwood text-small mt-1">
          {formatDate(w.date)} · {totalAttendees} confirmed{' '}
          {totalAttendees === 1 ? 'attendee' : 'attendees'} · {bookingRows.length}{' '}
          {bookingRows.length === 1 ? 'booking' : 'bookings'}
        </p>
      </div>

      <WorkshopForm mode="edit" initial={initial} />

      {/* Bookings */}
      <section className="rounded-card border border-stick-stone bg-stick-surface p-5 md:p-6">
        <h2 className="font-heading text-h3">Bookings</h2>
        {bookingRows.length === 0 ? (
          <p className="mt-3 text-small text-stick-driftwood">No bookings yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-stick-stone">
            {bookingRows.map((b) => (
              <li key={b.id} className="py-3 flex flex-wrap items-start gap-x-4 gap-y-1 justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-stick-walnut">{b.customer_name}</div>
                  <div className="text-small text-stick-driftwood">
                    <a href={`mailto:${b.customer_email}`} className="hover:text-stick-brass">
                      {b.customer_email}
                    </a>
                    {b.customer_phone && <> · {b.customer_phone}</>}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-small">
                  <span className="text-stick-shale">
                    {b.attendees} {b.attendees === 1 ? 'place' : 'places'}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      b.status === 'confirmed'
                        ? 'bg-stick-fell/15 text-stick-fell'
                        : b.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-stick-stone text-stick-driftwood'
                    }`}
                  >
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
