import Link from 'next/link';
import { WorkshopForm, DEFAULT_WORKSHOP_FORM } from '@/components/WorkshopForm';

export const metadata = { title: 'New workshop' };

export default function NewWorkshopPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/workshops" className="text-xs uppercase tracking-wider text-stick-driftwood hover:text-stick-brass">
          ← Workshops
        </Link>
        <h1 className="mt-2 font-heading text-h1">New workshop</h1>
        <p className="text-stick-driftwood text-small mt-1">
          Schedule a single session, a taster, or a course date.
        </p>
      </div>
      <WorkshopForm mode="create" initial={DEFAULT_WORKSHOP_FORM} />
    </div>
  );
}
