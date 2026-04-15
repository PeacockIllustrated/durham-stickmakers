import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { BlogStatus } from '@/types/stick';

interface CreateBody {
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

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('stick_blog_posts')
    .insert({
      title: body.title.trim(),
      excerpt: body.excerpt,
      content: body.content,
      author: body.author,
      category: body.category,
      status: body.status,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      featured_image_path: body.featured_image_path,
      // First-publish timestamp — stamped on create only if publishing now
      published_at: body.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
