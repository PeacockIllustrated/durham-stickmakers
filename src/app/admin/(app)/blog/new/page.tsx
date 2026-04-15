import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BlogForm, DEFAULT_BLOG_FORM } from '@/components/BlogForm';

export const metadata = { title: 'New post' };

async function fetchKnownCategories(): Promise<string[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('stick_blog_posts')
      .select('category')
      .not('category', 'is', null);
    return Array.from(
      new Set(((data ?? []) as Array<{ category: string | null }>).map((r) => r.category).filter(Boolean) as string[])
    ).sort();
  } catch {
    return [];
  }
}

export default async function NewBlogPostPage() {
  const knownCategories = await fetchKnownCategories();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/blog" className="text-xs uppercase tracking-wider text-stick-driftwood hover:text-stick-brass">
          ← Journal
        </Link>
        <h1 className="mt-2 font-heading text-h1">New post</h1>
        <p className="text-stick-driftwood text-small mt-1">
          Write it, save as draft, publish when ready.
        </p>
      </div>
      <BlogForm mode="create" initial={DEFAULT_BLOG_FORM} knownCategories={knownCategories} />
    </div>
  );
}
