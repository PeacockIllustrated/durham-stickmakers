import Link from 'next/link';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSiteConfig } from '@/lib/site-config';
import { WorkshopCard } from '@/components/WorkshopCard';
import { ABOUT_TEASER_IMAGE } from '@/lib/site-images';
import { formatTime } from '@/lib/utils';
import type { StickWorkshop } from '@/types/stick';

export const metadata: Metadata = {
  title: 'Workshops',
  description:
    'Drop-in sessions, taster workshops, and courses with Durham Stick Makers at Fencehouses Community Centre, County Durham.',
};

export default async function WorkshopsPage() {
  const [config, { upcoming, past }] = await Promise.all([
    getSiteConfig(),
    fetchWorkshops(),
  ]);

  return (
    <section className="section">
      <div className="container-wide">
        <div className="max-w-2xl">
          <span className="label-caps">Workshops</span>
          <h1 className="mt-2 font-heading text-hero">Learn alongside us</h1>
          <p className="mt-4 text-stick-shale text-lg">
            Drop in to a regular Monday or Tuesday evening, or book a one-off taster or course.
            Every session is led by members of the charity and runs out of Fencehouses Community
            Centre.
          </p>
        </div>

        {/* Regular sessions */}
        <div className="mt-10 rounded-card border border-stick-stone bg-stick-cream/40 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <span className="label-caps">Regular drop-in sessions</span>
              <h2 className="mt-2 font-heading text-h2">Every week, year-round</h2>
              <p className="mt-3 text-stick-shale leading-relaxed">
                No booking needed. Turn up with a stick to finish, a stick to start, or just
                curious. Tools, timber and tea provided.
              </p>
            </div>
            <ul className="space-y-3">
              {config.opening_hours.regular_sessions.map((s) => (
                <li
                  key={s.day}
                  className="flex items-baseline justify-between border-b border-stick-stone pb-3 last:border-0 last:pb-0"
                >
                  <span className="font-heading text-h4 text-stick-walnut">{s.day}</span>
                  <span className="text-stick-shale">
                    {formatTime(s.start)}–{formatTime(s.end)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upcoming */}
        <div className="mt-14">
          <h2 className="font-heading text-h1">Upcoming workshops</h2>
          <p className="mt-2 text-stick-shale">
            Single sessions, taster days, and scheduled courses.
          </p>

          {upcoming.length === 0 ? (
            <div className="mt-8 rounded-card border border-dashed border-stick-stone bg-stick-cream/40 p-10 text-center text-stick-driftwood">
              <p className="font-heading text-h3 text-stick-walnut">No workshops on the calendar</p>
              <p className="mt-2 text-small">
                None scheduled right now - drop in to a regular session, or
                <Link href="/contact" className="ml-1 text-stick-walnut hover:text-stick-brass">
                  get in touch
                </Link>{' '}
                about a private group booking.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((w) => (
                <WorkshopCard
                  key={w.id}
                  workshop={w}
                  fallbackImage={{ src: ABOUT_TEASER_IMAGE.src, alt: ABOUT_TEASER_IMAGE.alt }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Past (only shown if any exist, muted treatment) */}
        {past.length > 0 && (
          <div className="mt-14">
            <h2 className="font-heading text-h2">Recently held</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((w) => (
                <WorkshopCard
                  key={w.id}
                  workshop={w}
                  fallbackImage={{ src: ABOUT_TEASER_IMAGE.src, alt: ABOUT_TEASER_IMAGE.alt }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

async function fetchWorkshops(): Promise<{ upcoming: StickWorkshop[]; past: StickWorkshop[] }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { upcoming: [], past: [] };
  try {
    const supabase = createSupabaseServerClient();
    const today = new Date().toISOString().slice(0, 10);

    const [upcomingRes, pastRes] = await Promise.all([
      supabase
        .from('stick_workshops')
        .select('*')
        .in('status', ['upcoming', 'fully_booked'])
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(12),
      supabase
        .from('stick_workshops')
        .select('*')
        .or(`status.eq.completed,and(date.lt.${today},status.neq.cancelled)`)
        .order('date', { ascending: false })
        .limit(3),
    ]);

    return {
      upcoming: (upcomingRes.data as StickWorkshop[] | null) ?? [],
      past: (pastRes.data as StickWorkshop[] | null) ?? [],
    };
  } catch {
    return { upcoming: [], past: [] };
  }
}
