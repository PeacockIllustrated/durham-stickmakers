import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { StickCategory, StickMaterial, MaterialType } from '@/types/stick';

export const metadata: Metadata = {
  title: 'The Craft',
  description:
    'An illustrated guide to stick making - stick types, materials (wood, horn, antler), and the process of dressing a stick from raw shank to finished piece.',
  alternates: { canonical: '/the-craft' },
};

// Hand-curated image mapping for each stick category. Fallbacks gracefully to
// a single default if a slug isn't listed. The source of truth for
// descriptions is the stick_categories table (seeded in migration 3).
const CATEGORY_IMAGE: Record<string, string> = {
  'shepherds-crooks':   '/images/showcase/crooks-walkers-group.jpg',
  'thumbsticks':        '/images/showcase/stick-variety-group.jpg',
  'derby-walkers':      '/images/showcase/gents-beech-derby-walker.jpg',
  'knob-sticks':        '/images/gallery/individual-stick-portrait.jpg',
  'market-sticks':      '/images/showcase/dressed-stick-collection.jpg',
  'walking-staffs':     '/images/gallery/display-lineup-panoramic.jpg',
  'carved-sticks':      '/images/showcase/horn-handles-group.jpg',
  'supplies':           '/images/showcase/workshop-experience.jpg',
};
const CATEGORY_FALLBACK = '/images/showcase/dressed-stick-collection.jpg';

const MATERIAL_LABEL: Record<MaterialType, string> = {
  shank: 'Shank woods',
  handle: 'Handle materials',
  collar: 'Collars',
};

const MATERIAL_INTRO: Record<MaterialType, string> = {
  shank:
    'The main length of the stick. Cut from coppiced hardwood, left to season for a year or more, then straightened with heat before dressing.',
  handle:
    'Where the hand meets the stick. Shaped from natural materials - each one unique in colour, grain, and character.',
  collar:
    'The joint between handle and shank. Adds strength, holds the handle in place, and finishes the stick with a quiet detail.',
};

// TODO (CMS follow-up): the "process" and "care" sections are hardcoded
// reasonable charity copy. Move to stick_pages when the admin editor ships.
const PROCESS_STEPS: Array<{ title: string; body: string }> = [
  {
    title: 'Cut and season',
    body:
      'Hazel, holly, chestnut or ash is cut in winter - when the sap is down - and stacked to season. Depending on the wood, that can be a year or more before it&rsquo;s ready for the bench.',
  },
  {
    title: 'Straighten',
    body:
      'Shanks are heated gently, clamped in a straightening jig, and left to cool. A knowing eye turns a kinked hazel branch into a true, strong stick.',
  },
  {
    title: 'Dress the handle',
    body:
      'Horn is boiled, pressed, and shaped over a former. Antler is selected for its curve and cut to fit. Wood handles are carved by hand - sometimes into animals, birds, or decorative forms.',
  },
  {
    title: 'Fit and finish',
    body:
      'The handle is bonded to the shank through a collar, the ferrule is fitted to the foot, and the whole stick is sanded, oiled, and polished. The maker&rsquo;s initials go on last.',
  },
];

const CARE_TIPS: string[] = [
  'Keep your stick out of direct heat and damp. A cool dry corner is ideal.',
  'If it gets wet, let it dry slowly at room temperature - never on a radiator or next to a fire.',
  'Wipe the shank and handle occasionally with a soft cloth. A very light rub of oil once a year keeps wood handles fed.',
  'The ferrule will wear over time - get in touch when it needs replacing and we&rsquo;ll fit a new one.',
];

async function fetchCraftData(): Promise<{
  categories: StickCategory[];
  materials: Record<MaterialType, StickMaterial[]>;
}> {
  const empty = {
    categories: [],
    materials: { shank: [], handle: [], collar: [] } as Record<MaterialType, StickMaterial[]>,
  };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return empty;

  try {
    const supabase = createSupabaseServerClient();
    const [catsRes, matsRes] = await Promise.all([
      supabase
        .from('stick_categories')
        .select('*')
        .neq('slug', 'supplies') // supplies is for the shop nav, not the craft guide
        .order('display_order', { ascending: true }),
      supabase
        .from('stick_materials')
        .select('*')
        .order('name', { ascending: true }),
    ]);

    const categories = (catsRes.data as StickCategory[] | null) ?? [];
    const materials = (matsRes.data as StickMaterial[] | null) ?? [];

    const grouped: Record<MaterialType, StickMaterial[]> = {
      shank: materials.filter((m) => m.material_type === 'shank'),
      handle: materials.filter((m) => m.material_type === 'handle'),
      collar: materials.filter((m) => m.material_type === 'collar'),
    };

    return { categories, materials: grouped };
  } catch {
    return empty;
  }
}

export default async function TheCraftPage() {
  const { categories, materials } = await fetchCraftData();

  return (
    <>
      {/* Hero */}
      <section className="section">
        <div className="container-wide">
          <div className="max-w-3xl">
            <span className="label-caps">The craft</span>
            <h1 className="mt-2 font-heading text-hero leading-tight">
              How a walking stick is made
            </h1>
            <p className="mt-5 text-stick-shale text-lg leading-relaxed">
              A short illustrated guide to stick types, the woods and horns we use, and the
              slow business of turning a cut branch into a stick somebody will walk with for
              decades.
            </p>
          </div>

          <div className="mt-10 relative aspect-[21/9] overflow-hidden rounded-card bg-stick-stone">
            <Image
              src="/images/gallery/display-lineup-panoramic.jpg"
              alt="A lineup of finished walking sticks at a display"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Anatomy callouts */}
      <section className="section pt-0">
        <div className="container-wide">
          <div className="max-w-2xl mb-10">
            <span className="label-caps">Anatomy of a stick</span>
            <h2 className="mt-2 font-heading text-h1">Four parts, one piece</h2>
            <p className="mt-3 text-stick-shale">
              Every finished stick is built from four components, each with its own materials
              and techniques.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Handle', desc: 'The head - horn, antler, or carved wood. The part your hand knows.' },
              { name: 'Collar', desc: 'The metal or horn ring that marries handle to shank.' },
              { name: 'Shank', desc: 'The length - hazel, holly, chestnut, or ash. Seasoned and straightened.' },
              { name: 'Ferrule', desc: 'The tip - brass or rubber - where the stick meets the ground.' },
            ].map((part) => (
              <div key={part.name} className="rounded-card border border-stick-stone bg-stick-surface p-5">
                <p className="label-caps">{part.name}</p>
                <p className="mt-2 text-small text-stick-shale leading-relaxed">{part.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types of sticks */}
      <section className="section pt-0">
        <div className="container-wide">
          <div className="max-w-2xl mb-10">
            <span className="label-caps">Types of sticks</span>
            <h2 className="mt-2 font-heading text-h1">A stick for every purpose</h2>
            <p className="mt-3 text-stick-shale">
              Walking sticks come in more shapes than most people realise. Here are the
              traditional forms we make.
            </p>
          </div>

          {categories.length === 0 ? (
            <p className="text-stick-driftwood">Types will appear here once the database is reachable.</p>
          ) : (
            <div className="space-y-6">
              {categories.map((cat, i) => {
                const imgSrc = CATEGORY_IMAGE[cat.slug] ?? CATEGORY_FALLBACK;
                const isEven = i % 2 === 0;
                return (
                  <article
                    key={cat.id}
                    className="grid gap-6 md:grid-cols-5 items-center rounded-card border border-stick-stone bg-stick-surface overflow-hidden"
                  >
                    <div className={`relative aspect-[4/3] md:aspect-auto md:h-full md:col-span-2 bg-stick-stone ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                      <Image
                        src={imgSrc}
                        alt={`${cat.name} - handmade by Durham Stick Makers`}
                        fill
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className={`p-6 md:p-8 md:col-span-3 space-y-3 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                      <h3 className="font-heading text-h2">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-stick-shale leading-relaxed">{cat.description}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Materials */}
      <section className="section pt-0">
        <div className="container-wide">
          <div className="max-w-2xl mb-10">
            <span className="label-caps">Materials</span>
            <h2 className="mt-2 font-heading text-h1">What a stick is made of</h2>
            <p className="mt-3 text-stick-shale">
              Every stick draws on three streams of material - a wood for the shank, a natural
              material for the handle, and a metal or horn collar to join them.
            </p>
          </div>

          <div className="space-y-10">
            {(['shank', 'handle', 'collar'] as MaterialType[]).map((type) => (
              <div key={type}>
                <h3 className="font-heading text-h2">{MATERIAL_LABEL[type]}</h3>
                <p className="mt-2 max-w-prose text-stick-shale">{MATERIAL_INTRO[type]}</p>

                {materials[type].length === 0 ? (
                  <p className="mt-4 text-stick-driftwood text-small">None listed yet.</p>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {materials[type].map((m) => (
                      <article
                        key={m.id}
                        className="rounded-card border border-stick-stone bg-stick-surface p-5"
                      >
                        <h4 className="font-heading text-h4 text-stick-walnut">{m.name}</h4>
                        {m.description && (
                          <p className="mt-2 text-small text-stick-shale leading-relaxed">
                            {m.description}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The making process */}
      <section className="section pt-0">
        <div className="container-wide">
          <div className="grid gap-10 md:grid-cols-2 items-start">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-stick-stone">
                <Image
                  src="/images/showcase/workshop-experience.jpg"
                  alt="Hands at work on a walking stick at the workshop bench"
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <span className="label-caps">The making process</span>
              <h2 className="mt-2 font-heading text-h1">From cut branch to finished stick</h2>
              <p className="mt-3 text-stick-shale">
                Every stick takes months of patient work. Here&rsquo;s the shape of it.
              </p>

              <ol className="mt-8 space-y-6">
                {PROCESS_STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-stick-brass/20 font-heading text-h4 text-stick-walnut">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-heading text-h3">{step.title}</h3>
                      <p className="mt-1 text-stick-shale leading-relaxed">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Care */}
      <section className="section pt-0">
        <div className="container-wide">
          <div className="rounded-card bg-stick-cream/50 p-6 md:p-10 grid gap-8 md:grid-cols-2 items-start">
            <div>
              <span className="label-caps">Care & maintenance</span>
              <h2 className="mt-2 font-heading text-h1">Looking after your stick</h2>
              <p className="mt-3 text-stick-shale max-w-prose">
                A well-made stick will last a lifetime, and outlast several of its ferrules.
                A few small habits keep it in good health.
              </p>
            </div>
            <ul className="space-y-4">
              {CARE_TIPS.map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stick-brass" />
                  <span className="text-stick-shale leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section pt-0">
        <div className="container-wide">
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/workshops"
              className="group block rounded-card border border-stick-stone bg-stick-surface p-8 no-underline hover:border-stick-brass transition-colors"
            >
              <span className="label-caps">Learn at the bench</span>
              <p className="mt-2 font-heading text-h2 text-stick-walnut">
                Come to a workshop →
              </p>
              <p className="mt-2 text-small text-stick-shale">
                Drop in to a Monday or Tuesday evening, or book a taster session.
              </p>
            </Link>
            <Link
              href="/shop"
              className="group block rounded-card border border-stick-stone bg-stick-surface p-8 no-underline hover:border-stick-brass transition-colors"
            >
              <span className="label-caps">Take one home</span>
              <p className="mt-2 font-heading text-h2 text-stick-walnut">
                Browse the shop →
              </p>
              <p className="mt-2 text-small text-stick-shale">
                Finished sticks made by members, one of a kind each.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
