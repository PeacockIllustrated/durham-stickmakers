import Link from 'next/link';

export function PlaceholderPage({
  title,
  description,
  phase,
}: {
  title: string;
  description?: string;
  phase?: string;
}) {
  return (
    <section className="section">
      <div className="container-wide max-w-3xl">
        <span className="label-caps">{phase ?? 'Coming soon'}</span>
        <h1 className="mt-3 font-heading text-hero">{title}</h1>
        {description && (
          <p className="mt-4 text-lg text-stick-shale max-w-prose">{description}</p>
        )}
        <div className="mt-8">
          <Link href="/" className="btn-outline">← Back to the homepage</Link>
        </div>
      </div>
    </section>
  );
}
