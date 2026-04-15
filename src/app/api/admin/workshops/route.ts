import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { WorkshopStatus } from '@/types/stick';

interface CreateBody {
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

export async function POST(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 });
  }
  if (!body.date) {
    return NextResponse.json({ error: 'Date required' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('stick_workshops')
    .insert({
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
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
