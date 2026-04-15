import Image from 'next/image';
import Link from 'next/link';
import type { StickBlogPost } from '@/types/stick';
import { stickImageUrl } from '@/lib/utils';

export function BlogCard({
  post,
  fallbackImage,
}: {
  post: StickBlogPost;
  fallbackImage?: string;
}) {
  const imgUrl = post.featured_image_path
    ? stickImageUrl(post.featured_image_path)
    : fallbackImage ?? null;
  const date = post.published_at ?? post.created_at;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block no-underline text-stick-walnut"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-stick-stone">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stick-driftwood text-xs tracking-wider uppercase">
            No image
          </div>
        )}
        {post.category && (
          <span className="absolute left-3 top-3 pill-brass bg-stick-linen/95 backdrop-blur">
            {post.category}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <p className="label-caps">
          {new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {post.author && <> · {post.author}</>}
        </p>
        <h3 className="font-heading text-h3 leading-tight">{post.title}</h3>
        {post.excerpt && (
          <p className="text-small text-stick-shale leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
