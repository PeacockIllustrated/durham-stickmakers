import Link from 'next/link';
import { MakerForm, DEFAULT_MAKER_FORM } from '@/components/MakerForm';

export const metadata = { title: 'Add member' };

export default function NewMakerPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/makers" className="text-xs uppercase tracking-wider text-stick-driftwood hover:text-stick-brass">
          ← Members
        </Link>
        <h1 className="mt-2 font-heading text-h1">Add member</h1>
        <p className="text-stick-driftwood text-small mt-1">
          They&rsquo;ll appear on the About page and can be selected as the maker on product listings.
        </p>
      </div>
      <MakerForm mode="create" initial={DEFAULT_MAKER_FORM} />
    </div>
  );
}
