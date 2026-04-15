import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { stickImageUrl, cn } from '@/lib/utils';
import type { BlogStatus, StickBlogPost } from '@/types/stick';

export const metadata = { title: 'Blog' };

const STATUSES: Array<{ value: BlogStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
];

const STATUS_COLOURS: Record<BlogStatus, string> = {
  draft: 'bg-stick-cream text-stick-driftwood',
  published: 'bg-stick-fell/15 text-stick-fell',
};

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createSupabaseServerClient();
  const filter = (searchParams.status ?? 'all') as BlogStatus | 'all';

  let query = supabase
    .from('stick_blog_posts')
    .select('*')
    .order('updated_at', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('status', filter);
  }

  const { data, error } = await query;
  const posts = (data as StickBlogPost[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1">Journal</h1>
          <p className="text-stick-driftwood text-small mt-1">
            Write posts. Save drafts. Publish when you&rsquo;re ready.
          </p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary">
          + New post
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={s.value === 'all' ? '/admin/blog' : `/admin/blog?status=${s.value}`}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider no-underline transition-colors',
              filter === s.value
                ? 'bg-stick-walnut text-stick-linen'
                : 'bg-stick-cream text-stick-driftwood hover:bg-stick-stone'
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load posts: {error.message}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-card border border-dashed border-stick-stone bg-stick-surface p-10 text-center text-stick-driftwood">
          <p className="font-heading text-h3 text-stick-walnut">No posts yet</p>
          <p className="mt-2 text-small">Write the first journal entry to get the blog going.</p>
          <Link href="/admin/blog/new" className="btn-primary mt-5">+ New post</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-stick-stone bg-stick-surface">
          <table className="w-full text-sm">
            <thead className="bg-stick-cream/60 text-left text-xs uppercase tracking-wider text-stick-driftwood">
              <tr>
                <th className="px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stick-stone">
              {posts.map((p) => {
                const thumbUrl = p.featured_image_path
                  ? stickImageUrl(p.featured_image_path)
                  : null;
                return (
                  <tr key={p.id} className="hover:bg-stick-cream/40">
                    <td className="px-4 py-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-md bg-stick-stone">
                        {thumbUrl ? (
                          <Image src={thumbUrl} alt="" fill sizes="56px" className="object-cover" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-wider text-stick-driftwood">
                            No img
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/blog/${p.id}/edit`}
                        className="font-medium text-stick-walnut hover:text-stick-brass"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stick-shale">{p.category ?? '—'}</td>
                    <td className="px-4 py-3 text-stick-shale">{p.author ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize', STATUS_COLOURS[p.status])}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stick-driftwood text-xs">
                      {new Date(p.updated_at).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
