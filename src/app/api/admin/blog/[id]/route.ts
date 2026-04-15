import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { BlogStatus } from '@/types/stick';

interface UpdateBody {
  title: string;
  excerpt: string | null;
  content: string | null;
  author: string | null;
  category: string | null;
  status: BlogStatus;
  meta_title: string | null;
  meta_description: string | null;
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

  const { data: existing } = await supabase
    .from('stick_blog_posts')
    .select('status, published_at')
    .eq('id', params.id)
    .maybeSingle();

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const wasUnpublished = (existing as { status: BlogStatus; published_at: string | null }).status !== 'published';
  const existingPublishedAt = (existing as { status: BlogStatus; published_at: string | null }).published_at;

  // Stamp published_at the first time a post goes live, but preserve the
  // original timestamp on subsequent republishes.
  const nextPublishedAt =
    body.status === 'published'
      ? existingPublishedAt ?? new Date().toISOString()
      : existingPublishedAt;

  const { error } = await supabase
    .from('stick_blog_posts')
    .update({
      title: body.title.trim(),
      excerpt: body.excerpt,
      content: body.content,
      author: body.author,
      category: body.category,
      status: body.status,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      featured_image_path: body.featured_image_path,
      published_at: nextPublishedAt,
    })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: params.id, firstPublish: wasUnpublished && body.status === 'published' });
}

/** Hard delete — blog posts don't need archive history. */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('stick_blog_posts')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: params.id });
}
