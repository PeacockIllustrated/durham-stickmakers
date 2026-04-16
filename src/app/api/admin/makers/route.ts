import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface CreateBody {
  name: string;
  bio: string | null;
  photo_path: string | null;
  is_active: boolean;
  display_order: number;
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
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('stick_makers')
    .insert({
      name: body.name.trim(),
      bio: body.bio,
      photo_path: body.photo_path,
      is_active: body.is_active,
      display_order: body.display_order,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
