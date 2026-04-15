import { PublicNav } from '@/components/PublicNav';
import { PublicFooter } from '@/components/PublicFooter';
import { getSiteConfig } from '@/lib/site-config';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter config={config} />
    </div>
  );
}
