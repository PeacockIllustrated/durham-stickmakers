import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { stickImageUrl, cn } from '@/lib/utils';
import type { StickMaker } from '@/types/stick';

export const metadata = { title: 'Members' };

export default async function AdminMakersPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('stick_makers')
    .select('*')
    .order('display_order', { ascending: true });

  const makers = (data as StickMaker[] | null) ?? [];
  const active = makers.filter((m) => m.is_active);
  const inactive = makers.filter((m) => !m.is_active);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1">Members</h1>
          <p className="text-stick-driftwood text-small mt-1">
            Manage the makers shown on the About page and credited on products.
          </p>
        </div>
        <Link href="/admin/makers/new" className="btn-primary">
          + Add member
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load members: {error.message}
        </div>
      )}

      {makers.length === 0 ? (
        <div className="rounded-card border border-dashed border-stick-stone bg-stick-surface p-10 text-center text-stick-driftwood">
          <p className="font-heading text-h3 text-stick-walnut">No members yet</p>
          <p className="mt-2 text-small">
            Add a member so they appear on the About page and can be credited on products.
          </p>
          <Link href="/admin/makers/new" className="btn-primary mt-5">+ Add member</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...active, ...inactive].map((maker) => {
            const photoUrl = maker.photo_path ? stickImageUrl(maker.photo_path) : null;
            return (
              <Link
                key={maker.id}
                href={`/admin/makers/${maker.id}/edit`}
                className={cn(
                  'group block rounded-card border bg-stick-surface overflow-hidden no-underline hover:border-stick-brass transition-colors',
                  maker.is_active ? 'border-stick-stone' : 'border-stick-stone opacity-60'
                )}
              >
                <div className="relative aspect-[4/3] bg-stick-stone">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={`Portrait of ${maker.name}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stick-driftwood text-xs tracking-wider uppercase">
                      No photo
                    </div>
                  )}
                  {!maker.is_active && (
                    <span className="absolute left-3 top-3 pill bg-stick-stone text-stick-driftwood">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-heading text-h4 text-stick-walnut">{maker.name}</p>
                  {maker.bio && (
                    <p className="mt-1 text-small text-stick-shale line-clamp-2">{maker.bio}</p>
                  )}
                  <p className="mt-2 text-xs text-stick-driftwood">
                    Order: {maker.display_order}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
