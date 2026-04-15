'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/workshops', label: 'Workshops' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/donations', label: 'Donations' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/settings', label: 'Settings' },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-stick-stone bg-white">
      <div className="px-5 py-5 border-b border-stick-stone">
        <Link href="/admin" className="font-heading text-h4 leading-none text-stick-walnut no-underline">
          Durham Stick Makers
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.15em] text-stick-driftwood">Admin</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5" aria-label="Admin">
        {SECTIONS.map((s) => {
          const active = s.exact ? pathname === s.href : pathname.startsWith(s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors',
                active
                  ? 'bg-stick-walnut text-stick-linen'
                  : 'text-stick-walnut hover:bg-stick-stone'
              )}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-stick-stone p-4">
        <p className="truncate text-xs text-stick-driftwood">{userEmail}</p>
        <form action="/api/admin/signout" method="post" className="mt-2">
          <button type="submit" className="text-sm text-stick-walnut hover:text-stick-brass">
            Sign out
          </button>
        </form>
        <Link
          href="/"
          className="mt-3 block text-xs text-stick-driftwood no-underline hover:text-stick-brass"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
