import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BlogForm, type BlogFormInitial } from '@/components/BlogForm';
import { parseContent } from '@/lib/blocks';
import type { StickBlogPost } from '@/types/stick';

export const metadata = { title: 'Edit post' };

async function fetchKnownCategories(excludeId: string): Promise<string[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('stick_blog_posts')
      .select('category')
      .neq('id', excludeId)
      .not('category', 'is', null);
    return Array.from(
      new Set(((data ?? []) as Array<{ category: string | null }>).map((r) => r.category).filter(Boolean) as string[])
    ).sort();
  } catch {
    return [];
  }
}

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: post } = await supabase
    .from('stick_blog_posts')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!post) notFound();
  const p = post as StickBlogPost;

  const knownCategories = await fetchKnownCategories(p.id);

  const initial: BlogFormInitial = {
    id: p.id,
    title: p.title,
    excerpt: p.excerpt ?? '',
    blocks: parseContent(p.content).blocks,
    author: p.author ?? '',
    category: p.category ?? '',
    status: p.status,
    meta_title: p.meta_title ?? '',
    meta_description: p.meta_description ?? '',
    featured_image_path: p.featured_image_path,
    published_at: p.published_at,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/blog" className="text-xs uppercase tracking-wider text-stick-driftwood hover:text-stick-brass">
          ← Journal
        </Link>
        <h1 className="mt-2 font-heading text-h1">{p.title || 'Untitled post'}</h1>
        <p className="text-stick-driftwood text-small mt-1">
          Status: {p.status}{p.status === 'published' && <> · <Link href={`/blog/${p.slug}`} className="hover:text-stick-brass">View live →</Link></>}
        </p>
      </div>
      <BlogForm mode="edit" initial={initial} knownCategories={knownCategories} />
    </div>
  );
}
