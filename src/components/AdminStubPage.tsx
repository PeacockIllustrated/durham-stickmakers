export function AdminStubPage({ title, phase }: { title: string; phase: string }) {
  return (
    <div>
      <h1 className="font-heading text-h1">{title}</h1>
      <p className="text-stick-driftwood text-small mt-1">Comes online in {phase}.</p>
      <div className="mt-8 rounded-card border border-dashed border-stick-stone bg-white p-10 text-center text-stick-driftwood">
        Nothing here yet.
      </div>
    </div>
  );
}
