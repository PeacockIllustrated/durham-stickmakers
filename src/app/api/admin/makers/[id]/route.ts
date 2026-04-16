import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface UpdateBody {
  name: string;
  bio: string | null;
  photo_path: string | null;
  is_active: boolean;
  display_order: number;
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
    .from('stick_makers')
    .update({
      name: body.name.trim(),
      bio: body.bio,
      photo_path: body.photo_path,
      is_active: body.is_active,
      display_order: body.display_order,
    })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: params.id });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('stick_makers')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: params.id });
}
