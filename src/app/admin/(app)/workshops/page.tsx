import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatDate, formatPence, formatTime, cn } from '@/lib/utils';
import type { StickWorkshop, WorkshopStatus } from '@/types/stick';

export const metadata = { title: 'Workshops' };

const STATUSES: Array<{ value: WorkshopStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'fully_booked', label: 'Fully booked' },
  { value: 'completed', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLOURS: Record<WorkshopStatus, string> = {
  upcoming: 'bg-stick-fell/15 text-stick-fell',
  fully_booked: 'bg-stick-walnut text-stick-linen',
  completed: 'bg-stick-stone text-stick-driftwood',
  cancelled: 'bg-red-100 text-red-800',
};

export default async function AdminWorkshopsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createSupabaseServerClient();
  const filter = (searchParams.status ?? 'all') as WorkshopStatus | 'all';

  let query = supabase
    .from('stick_workshops')
    .select('*')
    .order('date', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('status', filter);
  }

  const { data, error } = await query;
  const workshops = (data as StickWorkshop[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1">Workshops</h1>
          <p className="text-stick-driftwood text-small mt-1">
            Schedule single sessions and courses.
          </p>
        </div>
        <Link href="/admin/workshops/new" className="btn-primary">
          + New workshop
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={s.value === 'all' ? '/admin/workshops' : `/admin/workshops?status=${s.value}`}
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
          Could not load workshops: {error.message}
        </div>
      )}

      {workshops.length === 0 ? (
        <div className="rounded-card border border-dashed border-stick-stone bg-stick-surface p-10 text-center text-stick-driftwood">
          <p className="font-heading text-h3 text-stick-walnut">No workshops yet</p>
          <p className="mt-2 text-small">Schedule your first one to let people book.</p>
          <Link href="/admin/workshops/new" className="btn-primary mt-5">+ New workshop</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-stick-stone bg-stick-surface">
          <table className="w-full text-sm">
            <thead className="bg-stick-cream/60 text-left text-xs uppercase tracking-wider text-stick-driftwood">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Spots</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stick-stone">
              {workshops.map((w) => (
                <tr key={w.id} className="hover:bg-stick-cream/40">
                  <td className="px-4 py-3 text-stick-shale whitespace-nowrap">
                    {formatDate(w.date)}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/workshops/${w.id}/edit`} className="font-medium text-stick-walnut hover:text-stick-brass">
                      {w.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stick-shale whitespace-nowrap">
                    {formatTime(w.start_time)}–{formatTime(w.end_time)}
                  </td>
                  <td className="px-4 py-3 text-stick-shale">
                    {w.spots_remaining} / {w.capacity}
                  </td>
                  <td className="px-4 py-3 text-stick-walnut font-medium">
                    {w.price_pence === 0 ? 'Free' : formatPence(w.price_pence)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize', STATUS_COLOURS[w.status])}>
                      {w.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
