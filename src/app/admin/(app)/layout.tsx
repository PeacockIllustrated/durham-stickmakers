import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/AdminSidebar';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  return (
    <div className="flex min-h-screen bg-stick-cream/30">
      <AdminSidebar userEmail={user.email ?? 'Signed in'} />
      <div className="flex-1 min-w-0">
        <main className="p-6 md:p-10 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
