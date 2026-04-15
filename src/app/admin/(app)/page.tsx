import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function getStats() {
  const supabase = createSupabaseServerClient();
  const [products, drafts, orders, workshops] = await Promise.all([
    supabase.from('stick_products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('stick_products').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('stick_orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('stick_workshops').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
  ]);
  return {
    published: products.count ?? 0,
    drafts: drafts.count ?? 0,
    pendingOrders: orders.count ?? 0,
    upcomingWorkshops: workshops.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: 'Published products', value: stats.published, href: '/admin/products?status=published' },
    { label: 'Drafts', value: stats.drafts, href: '/admin/products?status=draft' },
    { label: 'Pending orders', value: stats.pendingOrders, href: '/admin/orders' },
    { label: 'Upcoming workshops', value: stats.upcomingWorkshops, href: '/admin/workshops' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1">Dashboard</h1>
          <p className="text-stick-driftwood text-small mt-1">Quick overview of the shop and workshop.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + New listing
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-card border border-stick-stone bg-white p-5 no-underline hover:border-stick-brass transition-colors"
          >
            <p className="label-caps">{c.label}</p>
            <p className="mt-2 font-heading text-[2.25rem] leading-none text-stick-walnut">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-card border border-stick-stone bg-white p-6">
          <h2 className="font-heading text-h3">Quick actions</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/admin/products/new" className="text-stick-walnut hover:text-stick-brass">→ Add a new stick listing</Link></li>
            <li><Link href="/admin/workshops" className="text-stick-walnut hover:text-stick-brass">→ Schedule a workshop</Link></li>
            <li><Link href="/admin/blog/new" className="text-stick-walnut hover:text-stick-brass">→ Write a blog post</Link></li>
            <li><Link href="/admin/settings" className="text-stick-walnut hover:text-stick-brass">→ Update site info</Link></li>
          </ul>
        </div>
        <div className="rounded-card border border-stick-stone bg-white p-6">
          <h2 className="font-heading text-h3">Tips</h2>
          <ul className="mt-4 space-y-2 text-sm text-stick-shale leading-relaxed">
            <li>· Upload multiple photos per stick — drag the first image to set it as primary.</li>
            <li>· Mark a stick as &ldquo;Featured&rdquo; to show it on the homepage.</li>
            <li>· Save as Draft to come back later — only Published items appear in the shop.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
