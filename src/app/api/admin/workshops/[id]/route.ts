import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { WorkshopStatus } from '@/types/stick';

interface UpdateBody {
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  spots_remaining: number;
  price_pence: number;
  location: string;
  status: WorkshopStatus;
  featured_image_path: string | null;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('stick_workshops')
    .update({
      title: body.title.trim(),
      description: body.description,
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      capacity: body.capacity,
      spots_remaining: body.spots_remaining,
      price_pence: body.price_pence,
      location: body.location,
      status: body.status,
      featured_image_path: body.featured_image_path,
    })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: params.id });
}

/** Soft delete: set status to 'cancelled'. */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('stick_workshops')
    .update({ status: 'cancelled' })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: params.id });
}
