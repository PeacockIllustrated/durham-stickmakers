import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BlogCard } from '@/components/BlogCard';
import { ABOUT_TEASER_IMAGE } from '@/lib/site-images';
import { stickImageUrl } from '@/lib/utils';
import { parseContent } from '@/lib/blocks';
import { BlockRenderer } from '@/components/BlockRenderer';
import type { StickBlogPost } from '@/types/stick';

interface PageProps {
  params: { slug: string };
}

async function fetchPost(slug: string): Promise<StickBlogPost | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('stick_blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    return (data as StickBlogPost | null) ?? null;
  } catch {
    return null;
  }
}

async function fetchRelated(
  category: string | null,
  excludeId: string
): Promise<StickBlogPost[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createSupabaseServerClient();

    // Prefer same-category, fall back to most recent overall
    let query = supabase
      .from('stick_blog_posts')
      .select('*')
      .eq('status', 'published')
      .neq('id', excludeId)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(3);

    if (category) {
      query = query.eq('category', category);
    }

    const { data } = await query;
    const rows = (data as StickBlogPost[] | null) ?? [];

    if (rows.length > 0 || !category) return rows;

    // No same-category posts - fetch any 3 recent posts
    const { data: anyData } = await supabase
      .from('stick_blog_posts')
      .select('*')
      .eq('status', 'published')
      .neq('id', excludeId)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(3);
    return (anyData as StickBlogPost[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  if (!post) return { title: 'Post not found' };

  const imgUrl = post.featured_image_path ? stickImageUrl(post.featured_image_path) : null;

  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.published_at ?? undefined,
      authors: post.author ? [post.author] : undefined,
      images: imgUrl ? [{ url: imgUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await fetchPost(params.slug);
  if (!post) notFound();

  const related = await fetchRelated(post.category, post.id);
  const { blocks } = parseContent(post.content);
  const imgUrl = post.featured_image_path ? stickImageUrl(post.featured_image_path) : null;
  const publishedDate = post.published_at ?? post.created_at;

  return (
    <>
      <article className="section">
        <div className="container-wide">
          <nav className="text-small text-stick-driftwood mb-6">
            <Link href="/blog" className="hover:text-stick-brass">Journal</Link>
            {' / '}
            {post.category && (
              <>
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="hover:text-stick-brass"
                >
                  {post.category}
                </Link>
                {' / '}
              </>
            )}
            <span className="text-stick-shale">{post.title}</span>
          </nav>

          <header className="max-w-prose">
            {post.category && <span className="pill-brass">{post.category}</span>}
            <h1 className="mt-4 font-heading text-hero leading-tight">{post.title}</h1>
            <p className="mt-4 text-small text-stick-driftwood">
              {new Date(publishedDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {post.author && <> · by {post.author}</>}
            </p>
            {post.excerpt && (
              <p className="mt-6 text-lg text-stick-shale leading-relaxed border-l-2 border-stick-brass pl-4">
                {post.excerpt}
              </p>
            )}
          </header>

          {imgUrl && (
            <div className="mt-10 relative aspect-[16/9] overflow-hidden rounded-card bg-stick-stone">
              <Image
                src={imgUrl}
                alt={post.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-10 max-w-prose mx-auto">
            <BlockRenderer blocks={blocks} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section pt-0">
          <div className="container-wide">
            <h2 className="font-heading text-h1 mb-8">More from the journal</h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <BlogCard key={r.id} post={r} fallbackImage={ABOUT_TEASER_IMAGE.src} />
              ))}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildArticleJsonLd(post) }}
      />
    </>
  );
}

function buildArticleJsonLd(post: StickBlogPost): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? /^https?:\/\//.test(process.env.NEXT_PUBLIC_SITE_URL)
      ? process.env.NEXT_PUBLIC_SITE_URL
      : `https://${process.env.NEXT_PUBLIC_SITE_URL}`
    : 'http://localhost:3000';
  const img = post.featured_image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/stick-images/${post.featured_image_path}`
    : undefined;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: img ? [img] : undefined,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: post.author ? { '@type': 'Person', name: post.author } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Durham Stick Makers',
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };
  return JSON.stringify(data);
}
