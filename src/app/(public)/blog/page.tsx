import Link from 'next/link';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BlogCard } from '@/components/BlogCard';
import { ABOUT_TEASER_IMAGE } from '@/lib/site-images';
import { cn } from '@/lib/utils';
import type { StickBlogPost } from '@/types/stick';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'News from the workshop, stickmaking techniques, member spotlights, and heritage craft stories from Durham Stick Makers.',
  alternates: { canonical: '/blog' },
};

interface PageProps {
  searchParams: { category?: string };
}

async function fetchPosts(category: string | null) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { posts: [] as StickBlogPost[], categories: [] as string[] };
  }
  try {
    const supabase = createSupabaseServerClient();

    let query = supabase
      .from('stick_blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: posts } = await query;

    // Distinct categories across all published posts — we show them as pills
    const { data: catRows } = await supabase
      .from('stick_blog_posts')
      .select('category')
      .eq('status', 'published')
      .not('category', 'is', null);

    const categories = Array.from(
      new Set(((catRows ?? []) as Array<{ category: string | null }>).map((r) => r.category).filter(Boolean) as string[])
    ).sort();

    return {
      posts: (posts as StickBlogPost[] | null) ?? [],
      categories,
    };
  } catch {
    return { posts: [], categories: [] };
  }
}

export default async function BlogPage({ searchParams }: PageProps) {
  const activeCategory = searchParams.category ?? null;
  const { posts, categories } = await fetchPosts(activeCategory);

  return (
    <section className="section">
      <div className="container-wide">
        <div className="max-w-2xl">
          <span className="label-caps">Journal</span>
          <h1 className="mt-2 font-heading text-hero">From the workshop</h1>
          <p className="mt-4 text-stick-shale text-lg">
            Notes on technique, member spotlights, shows we&rsquo;ve been to, and the slow
            business of keeping a heritage craft alive.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider no-underline transition-colors',
                !activeCategory
                  ? 'bg-stick-walnut text-stick-linen'
                  : 'bg-stick-cream text-stick-driftwood hover:bg-stick-stone'
              )}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider no-underline transition-colors',
                  activeCategory === cat
                    ? 'bg-stick-walnut text-stick-linen'
                    : 'bg-stick-cream text-stick-driftwood hover:bg-stick-stone'
                )}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10">
          {posts.length === 0 ? (
            <div className="rounded-card border border-dashed border-stick-stone bg-stick-cream/40 p-10 text-center text-stick-driftwood">
              <p className="font-heading text-h3 text-stick-walnut">
                {activeCategory ? 'Nothing in this category yet' : 'No posts yet'}
              </p>
              <p className="mt-2 text-small">
                {activeCategory
                  ? 'Try a different category, or check back soon.'
                  : 'Our first journal posts are being written — check back soon.'}
              </p>
              {activeCategory && (
                <Link href="/blog" className="btn-outline mt-5">See all posts</Link>
              )}
            </div>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} fallbackImage={ABOUT_TEASER_IMAGE.src} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
