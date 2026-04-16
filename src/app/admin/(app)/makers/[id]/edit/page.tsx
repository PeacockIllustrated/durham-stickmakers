import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MakerForm, type MakerFormInitial } from '@/components/MakerForm';
import type { StickMaker } from '@/types/stick';

export const metadata = { title: 'Edit member' };

export default async function EditMakerPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: maker } = await supabase
    .from('stick_makers')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!maker) notFound();
  const m = maker as StickMaker;

  const initial: MakerFormInitial = {
    id: m.id,
    name: m.name,
    bio: m.bio ?? '',
    photo_path: m.photo_path,
    is_active: m.is_active,
    display_order: m.display_order.toString(),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/makers" className="text-xs uppercase tracking-wider text-stick-driftwood hover:text-stick-brass">
          ← Members
        </Link>
        <h1 className="mt-2 font-heading text-h1">{m.name}</h1>
        <p className="text-stick-driftwood text-small mt-1">
          {m.is_active ? 'Active member' : 'Inactive - hidden from the About page and product dropdowns'}
        </p>
      </div>
      <MakerForm mode="edit" initial={initial} />
    </div>
  );
}
