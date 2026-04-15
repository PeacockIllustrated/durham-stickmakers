import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSiteConfig } from '@/lib/site-config';
import { stickImageUrl } from '@/lib/utils';
import type { StickMaker } from '@/types/stick';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Durham Stick Makers is a small charity preserving the heritage craft of stick making in County Durham. Read about our story, members, and mission.',
  alternates: { canonical: '/about' },
};

// TODO (CMS follow-up): these paragraphs are written as a reasonable placeholder
// drawn from the project brief and the current site. Owner can replace the copy
// in-place, or we can move it to `stick_pages` and build an admin editor.
const STORY_PARAGRAPHS: string[] = [
  'Durham Stick Makers is a small community of heritage craftspeople based in County Durham. We meet every Monday and Tuesday evening to make and dress walking sticks using the same woods, horns and antlers our predecessors worked with — hazel, holly, ram horn, buffalo horn, roe antler — and the same slow, hand-shaped techniques.',
  'The charity was formed to keep an endangered craft alive. Stick making appears on the Heritage Crafts Association Red List of Endangered Crafts — fewer and fewer people learn to do it, and the skills quietly disappear with the people who hold them. We teach, we make, and we give sticks away to people who need them.',
];

const MISSION_POINTS: Array<{ title: string; body: string }> = [
  {
    title: 'Preserve the craft',
    body:
      'Pass the skills on. Host drop-in nights, run introductory workshops, and keep a bench of makers working regularly enough that the techniques stay in living memory.',
  },
  {
    title: 'Put sticks in hands',
    body:
      'Provide walking sticks free of charge to people who need them — after illness, injury, or simply because a good stick is out of reach. Nobody who wants a stick should go without one.',
  },
  {
    title: 'Welcome everybody',
    body:
      'The workshop is open. Come to learn, come for company, come because you want a stick of your own. No experience needed. The kettle is always on.',
  },
];

async function fetchMakers(): Promise<StickMaker[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('stick_makers')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return (data as StickMaker[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function AboutPage() {
  const [config, makers] = await Promise.all([getSiteConfig(), fetchMakers()]);

  return (
    <>
      {/* Hero */}
      <section className="section">
        <div className="container-wide grid gap-10 md:grid-cols-5 items-center">
          <div className="md:col-span-3">
            <span className="label-caps">About us</span>
            <h1 className="mt-2 font-heading text-hero leading-tight">
              A small charity, a small workshop, a very old craft
            </h1>
            <p className="mt-5 text-stick-shale text-lg leading-relaxed">
              We&rsquo;re a group of heritage craftspeople in County Durham, keeping stick
              making alive one bench-night at a time.
            </p>
            <p className="mt-3 text-small text-stick-driftwood">
              Registered Charity Number {config.charity_number}
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-stick-stone">
              <Image
                src="/images/showcase/horn-handles-group.jpg"
                alt="A group of handmade horn walking-stick handles"
                fill
                priority
                sizes="(min-width: 768px) 35vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="section pt-0">
        <div className="container-wide grid gap-10 md:grid-cols-2 items-start">
          <div>
            <span className="label-caps">Our story</span>
            <h2 className="mt-2 font-heading text-h1">How it started</h2>
          </div>
          <div className="space-y-4 text-stick-shale leading-relaxed">
            {STORY_PARAGRAPHS.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Mission — three pillars */}
      <section className="section pt-0">
        <div className="container-wide">
          <div className="max-w-2xl">
            <span className="label-caps">Our mission</span>
            <h2 className="mt-2 font-heading text-h1">What we&rsquo;re here to do</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {MISSION_POINTS.map((point) => (
              <article
                key={point.title}
                className="rounded-card border border-stick-stone bg-stick-surface p-6 space-y-3"
              >
                <h3 className="font-heading text-h3">{point.title}</h3>
                <p className="text-stick-shale leading-relaxed">{point.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Our people */}
      <section className="section pt-0">
        <div className="container-wide">
          <div className="max-w-2xl mb-10">
            <span className="label-caps">Our people</span>
            <h2 className="mt-2 font-heading text-h1">The makers</h2>
            <p className="mt-3 text-stick-shale">
              The sticks we sell are made by members of the charity. Every one has a maker&rsquo;s
              name on it.
            </p>
          </div>

          {makers.length === 0 ? (
            <div className="rounded-card border border-dashed border-stick-stone bg-stick-cream/40 p-10 text-center text-stick-driftwood">
              <p className="font-heading text-h3 text-stick-walnut">Member profiles coming soon</p>
              <p className="mt-2 text-small">
                We&rsquo;ll introduce our members here shortly, with photographs and short bios.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {makers.map((maker) => {
                const photoUrl = maker.photo_path ? stickImageUrl(maker.photo_path) : null;
                return (
                  <article
                    key={maker.id}
                    className="rounded-card border border-stick-stone bg-stick-surface overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] bg-stick-stone">
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={`Portrait of ${maker.name}`}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stick-driftwood text-xs tracking-wider uppercase">
                          No photo yet
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="font-heading text-h3">{maker.name}</h3>
                      {maker.bio && (
                        <p className="text-small text-stick-shale leading-relaxed">
                          {maker.bio}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* The workshop */}
      <section className="section pt-0">
        <div className="container-wide grid gap-10 md:grid-cols-2 items-center">
          <div className="relative aspect-[5/4] overflow-hidden rounded-card bg-stick-stone">
            <Image
              src="/images/showcase/workshop-experience.jpg"
              alt="Members of Durham Stick Makers at work at the bench"
              fill
              sizes="(min-width: 768px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
          <div>
            <span className="label-caps">The workshop</span>
            <h2 className="mt-2 font-heading text-h1">Fencehouses Community Centre</h2>
            <address className="mt-4 not-italic text-stick-shale leading-relaxed">
              {config.workshop_address.line1}<br />
              {config.workshop_address.line2 && (<>{config.workshop_address.line2}<br /></>)}
              {config.workshop_address.town}<br />
              {config.workshop_address.county} · {config.workshop_address.postcode}
            </address>
            <p className="mt-4 text-stick-shale leading-relaxed">
              We meet every Monday and Tuesday evening through the year. Drop in at any point —
              whether you&rsquo;ve a stick to finish, one to start, or you just want to watch.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/workshops" className="btn-primary">Upcoming workshops</Link>
              <Link href="/contact" className="btn-outline">Plan a visit</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Crafts affiliation */}
      <section className="section pt-0">
        <div className="container-wide">
          <div className="rounded-card bg-stick-walnut px-6 py-12 md:px-16 md:py-16 text-stick-linen">
            <div className="max-w-3xl">
              <span className="label-caps text-stick-brass">Heritage Crafts</span>
              <h2 className="mt-3 font-heading text-h1 text-stick-linen">
                A craft on the Red List
              </h2>
              <p className="mt-4 text-stick-linen/85 leading-relaxed max-w-prose">
                Stick making is one of the traditional British crafts on the Heritage Crafts
                Association Red List of Endangered Crafts — the techniques are at real risk of
                being lost. We work to keep them in practice, in public view, and in the hands
                of people who&rsquo;ll carry them forward.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://heritagecrafts.org.uk/redlist/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary bg-stick-brass text-stick-walnut hover:bg-stick-linen"
                >
                  Read about the Red List
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
