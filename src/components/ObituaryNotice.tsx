import Image from 'next/image';

/**
 * In-memoriam notice for the homepage — a slate-and-brass plaque carrying the
 * tribute to Tom Keers, founder member and Chairman of Durham Stick Makers.
 *
 * Layout: a symmetric headpiece over an asymmetric body over a symmetric foot.
 * On desktop the body splits into two columns — a framed portrait on the left,
 * the tribute on the right, divided by a brass rule. Below `lg` the two columns
 * stack, portrait first.
 *
 * The ornament is drawn entirely from his craft: paired shepherds crooks at the
 * head, a memorial oval holding a crossed crook and knob stick where the
 * photograph will go, a brass collar rule above the tribute, and a standing row
 * of stick types — crook, thumbstick, knob stick, market stick, staff — as a
 * guard of honour at the foot. Every ornament is decorative and hidden from
 * assistive technology; only the tribute text is announced.
 *
 * The tribute is reproduced verbatim as supplied by the charity, including its
 * own spelling of "Durham Stickmakers".
 *
 * To retire the notice later, remove <ObituaryNotice /> from
 * src/app/(public)/page.tsx — nothing else references it.
 */

/**
 * The portrait slot. It ships empty: while `src` is null the framed memorial
 * oval below stands in for the photograph.
 *
 * To drop the real photograph in, set `src` to either
 *   - a file placed in /public — e.g. '/images/tom-keers.jpg', or
 *   - a Supabase storage URL (that host is already allowed in next.config.js).
 *
 * Nothing else needs changing — the frame, corner ticks and caption stay put.
 * A portrait crop close to 4:5 fills the frame without cropping surprises.
 */
const PORTRAIT = {
  src: null as string | null,
  alt: 'Tom Keers',
  /** Shown under the frame once a photograph is in place. */
  caption: 'Tom Keers',
};

const TRIBUTE_PARAGRAPHS = [
  'It is with great sadness that Tom Keers, one of the founder members of Durham Stickmakers, has passed away after a long battle against continuing health problems and illness. Tom was a renowned stickmaker, well respected in the world of stickmaking and widely involved throughout the North East, the Borders and the wider stickmaking community. He was Chairman of Durham Stickmakers until his passing, and an active member and committee member of Border Stickmakers.',
  'His quality of sticks was up there with the best, and over the years his knowledge has been passed onto many others, so his legacy continues. He has made sticks for many famous and renowned people including the Churchill family and our own Royal family.',
] as const;

const CONDOLENCE =
  'Tom will be sadly missed, and all the members of Durham Stickmakers send his family our sincere condolences on this sad occasion.';

/** Paired shepherds crooks rising from a rule, a brass lozenge between them. */
function CrookMasthead({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 64"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Rules running into the foot of each crook, diamond terminals at the ends */}
      <path d="M14 52H124" strokeWidth="1" strokeOpacity=".75" />
      <path d="M196 52H306" strokeWidth="1" strokeOpacity=".75" />
      <path d="M6 52 10 48 14 52 10 56Z" fill="currentColor" stroke="none" />
      <path d="M306 52 310 48 314 52 310 56Z" fill="currentColor" stroke="none" />

      {/* Right crook — shank rises at x=196, head curls inward over the top */}
      <g strokeWidth="2" strokeLinecap="round">
        <path d="M196 52V24" />
        <path d="M196 24A11 11 0 0 0 174 24" />
        <path d="M174 24V33" />
        <path d="M174 33A6.5 6.5 0 0 0 187 33" />
        <path d="M187 33Q189 28 185 26.5" />
      </g>
      {/* Left crook — the same glyph mirrored about the centre line */}
      <g strokeWidth="2" strokeLinecap="round" transform="translate(320,0) scale(-1,1)">
        <path d="M196 52V24" />
        <path d="M196 24A11 11 0 0 0 174 24" />
        <path d="M174 24V33" />
        <path d="M174 33A6.5 6.5 0 0 0 187 33" />
        <path d="M187 33Q189 28 185 26.5" />
      </g>

      {/* Centre: a brass lozenge flanked by a pair of hazel leaves */}
      <path d="M160 21 165.5 30 160 39 154.5 30Z" fill="currentColor" fillOpacity=".9" stroke="none" />
      <path
        d="M151 30C146 30 142 34 141 40 147 40 151 36 151 30Z"
        fill="currentColor"
        fillOpacity=".3"
        strokeWidth=".9"
      />
      <path
        d="M169 30C174 30 178 34 179 40 173 40 169 36 169 30Z"
        fill="currentColor"
        fillOpacity=".3"
        strokeWidth=".9"
      />
    </svg>
  );
}

/** A quarter-corner bracket with a single hazel leaf, drawn for the top-left. */
function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M0 46C0 22 22 0 46 0" strokeWidth="1.25" />
      <path d="M0 38C0 20 20 0 38 0" strokeWidth=".75" strokeOpacity=".5" />
      <path
        d="M17 32C19.5 26 24 21.5 30 19 27.5 25.5 23 30 17 32Z"
        fill="currentColor"
        fillOpacity=".28"
        strokeWidth=".8"
      />
      <path d="M17 32C21.5 29 26 25 30 19" strokeWidth=".65" strokeOpacity=".6" />
      <circle cx="0.6" cy="46" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="46" cy="0.6" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** A rule broken by a brass collar — the band that joins handle to shank. */
function CollarRule({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 20"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M6 10H94" strokeWidth="1" strokeOpacity=".45" />
      <path d="M146 10H234" strokeWidth="1" strokeOpacity=".45" />
      <path d="M0 10 3 7 6 10 3 13Z" fill="currentColor" fillOpacity=".7" stroke="none" />
      <path d="M234 10 237 7 240 10 237 13Z" fill="currentColor" fillOpacity=".7" stroke="none" />
      <rect x="101" y="2" width="38" height="16" rx="3.5" strokeWidth="1.15" />
      <path d="M109 2.6V17.4" strokeWidth=".75" strokeOpacity=".6" />
      <path d="M131 2.6V17.4" strokeWidth=".75" strokeOpacity=".6" />
      <path d="M120 6V14" strokeWidth="1.1" strokeOpacity=".9" />
    </svg>
  );
}

/**
 * The empty portrait frame — a memorial oval holding a crossed shepherds crook
 * and knob stick, with a brass lozenge at the crown and foot of the oval.
 * Stands in for the photograph until one is supplied.
 *
 * The clip path id is fixed rather than generated because the notice renders
 * once per page; if this component is ever repeated, make the id unique.
 */
function PortraitVignette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 376"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <clipPath id="stick-memoriam-oval">
          <ellipse cx="160" cy="188" rx="116" ry="148" />
        </clipPath>
      </defs>

      {/* Crossed sticks, held inside the oval — both drawn upright about x=160,
          then rotated in opposite directions so they cross at the oval's heart */}
      <g clipPath="url(#stick-memoriam-oval)" strokeLinecap="round" strokeOpacity=".5">
        {/* Shepherds crook, leaning left */}
        <g transform="rotate(-18 160 200)" strokeWidth="3">
          <path d="M160 366V104" />
          <path d="M160 104A16 16 0 0 0 128 104" />
          <path d="M128 104V117" />
          <path d="M128 117A9 9 0 0 0 146 117" />
          <path d="M146 117Q148.5 110 144 108" />
        </g>
        {/* Knob stick, leaning right */}
        <g transform="rotate(18 160 200)" strokeWidth="3">
          <path d="M160 366V118" />
          <circle cx="160" cy="105" r="13" />
          <rect x="154.5" y="118" width="11" height="8.5" rx="1.5" strokeWidth="1.6" />
        </g>
      </g>

      {/* The oval itself, double-ruled */}
      <ellipse cx="160" cy="188" rx="116" ry="148" strokeWidth="1.5" strokeOpacity=".6" />
      <ellipse cx="160" cy="188" rx="108" ry="140" strokeWidth=".75" strokeOpacity=".32" />

      {/* Brass lozenges at the crown and foot of the oval */}
      <path d="M160 32 165.5 40 160 48 154.5 40Z" fill="currentColor" fillOpacity=".85" stroke="none" />
      <path d="M160 328 165.5 336 160 344 154.5 336Z" fill="currentColor" fillOpacity=".85" stroke="none" />

      {/* Hazel leaves either side of the foot lozenge */}
      <path
        d="M148 336C142 336 137 340.5 136 347 143 347 148 342.5 148 336Z"
        fill="currentColor"
        fillOpacity=".3"
        strokeWidth=".9"
      />
      <path
        d="M172 336C178 336 183 340.5 184 347 177 347 172 342.5 172 336Z"
        fill="currentColor"
        fillOpacity=".3"
        strokeWidth=".9"
      />
    </svg>
  );
}

/**
 * Five stick types standing on a common ground line — a shepherds crook,
 * a thumbstick, a knob stick, a market stick and a staff.
 */
function GuardOfHonour({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 232 134"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Shepherds crook */}
      <g>
        <path d="M34 128V34" />
        <path d="M34 34A13 13 0 0 0 8 34" />
        <path d="M8 34V44" />
        <path d="M8 44A7.5 7.5 0 0 0 23 44" />
        <path d="M23 44Q25 39 21 37" />
      </g>
      {/* Thumbstick */}
      <g transform="translate(58,0)">
        <path d="M14 128V46" />
        <path d="M14 46C14 36 8 32 5 25" />
        <path d="M14 46C14 36 20 32 23 25" />
        <rect x="10" y="50" width="8" height="7" rx="1.5" strokeWidth="1" />
      </g>
      {/* Knob stick */}
      <g transform="translate(102,0)">
        <path d="M14 128V42" />
        <circle cx="14" cy="32" r="9.5" />
        <rect x="10" y="42" width="8" height="7" rx="1.5" strokeWidth="1" />
      </g>
      {/* Market stick */}
      <g transform="translate(146,0)">
        <path d="M25 128V46" />
        <path d="M25 46A11.5 11.5 0 0 0 2 46" />
        <path d="M2 46V54" />
      </g>
      {/* Staff */}
      <g transform="translate(204,0)">
        <path d="M14 128V32" />
        <path d="M8 32C8 23.5 20 23.5 20 32" strokeWidth="1.5" />
        <rect x="10" y="42" width="8" height="7" rx="1.5" strokeWidth="1" />
      </g>
      <path d="M0 130H232" strokeWidth=".75" strokeOpacity=".35" />
    </svg>
  );
}

export function ObituaryNotice() {
  return (
    <section
      id="in-memoriam"
      aria-labelledby="in-memoriam-heading"
      className="bg-gradient-to-b from-stick-cream to-stick-linen py-14 md:py-20"
    >
      <div className="container-wide">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-card bg-walnut-gradient text-stick-linen shadow-[0_24px_60px_-24px_rgba(47,56,66,0.6)]">
          {/* Warm brass light falling from the head of the plaque */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(196,162,101,0.13),transparent_62%)]"
          />

          {/* Ornate double rule with a flourish at each corner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-3 rounded-lg border border-stick-brass/25 md:inset-5"
          >
            <div className="absolute inset-[6px] rounded-md border border-stick-brass/10" />
            <span className="absolute -left-px -top-px block h-9 w-9 text-stick-brass/45 md:h-11 md:w-11">
              <CornerFlourish className="h-full w-full" />
            </span>
            <span className="absolute -right-px -top-px block h-9 w-9 -scale-x-100 text-stick-brass/45 md:h-11 md:w-11">
              <CornerFlourish className="h-full w-full" />
            </span>
            <span className="absolute -bottom-px -left-px block h-9 w-9 -scale-y-100 text-stick-brass/45 md:h-11 md:w-11">
              <CornerFlourish className="h-full w-full" />
            </span>
            <span className="absolute -bottom-px -right-px block h-9 w-9 -scale-100 text-stick-brass/45 md:h-11 md:w-11">
              <CornerFlourish className="h-full w-full" />
            </span>
          </div>

          <div className="relative px-7 py-12 sm:px-10 md:px-14 md:py-16">
            {/* Headpiece — spans the full width above both columns */}
            <CrookMasthead className="mx-auto h-auto w-full max-w-[300px] text-stick-brass md:max-w-[400px]" />

            <div className="mt-10 grid gap-y-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start lg:gap-x-10 md:mt-12">
              {/* Left column — the portrait */}
              <figure className="mx-auto w-full max-w-[300px] lg:mx-0 lg:max-w-none">
                {/* Mount — the photograph sits inside a slate mat, so the brass
                    corner ticks always fall on dark ground however pale the
                    photograph's own edges happen to be */}
                <div className="relative rounded-md border border-stick-brass/30 bg-stick-walnut/70 p-3">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                    {PORTRAIT.src ? (
                      <Image
                        src={PORTRAIT.src}
                        alt={PORTRAIT.alt}
                        fill
                        sizes="(min-width: 1024px) 340px, 300px"
                        className="object-cover"
                      />
                    ) : (
                      <>
                        {/* Light falling into the empty niche */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(196,162,101,0.1),transparent_65%)]"
                        />
                        <PortraitVignette className="absolute inset-0 h-full w-full p-3 text-stick-brass/65" />
                      </>
                    )}
                  </div>

                  {/* Brass ticks set into the mat at each corner of the mount */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-1.5"
                  >
                    <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-stick-brass/45" />
                    <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-stick-brass/45" />
                    <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-stick-brass/45" />
                    <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-stick-brass/45" />
                  </span>
                </div>

                <figcaption className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-stick-linen/65">
                  {PORTRAIT.src ? PORTRAIT.caption : 'Photograph to follow'}
                </figcaption>
              </figure>

              {/* Right column — the tribute, divided from the portrait by a brass rule */}
              <div className="lg:border-l lg:border-stick-brass/20 lg:pl-10">
                <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-stick-brass lg:text-left">
                  In memoriam
                </p>

                <h2
                  id="in-memoriam-heading"
                  className="mt-3 text-center font-heading text-[clamp(2.25rem,5.5vw,3.25rem)] leading-tight tracking-[0.01em] text-stick-linen [text-shadow:0_2px_10px_rgba(20,26,33,0.55)] lg:text-left"
                >
                  <span className="sr-only">In memoriam: </span>Tom Keers
                </h2>

                <p className="mt-3 text-center text-small text-stick-linen/70 lg:text-left">
                  Founder member and Chairman of Durham Stickmakers
                </p>

                <CollarRule className="mx-auto mt-7 h-auto w-full max-w-[240px] text-stick-brass/70 lg:mx-0" />

                {/* max-w-prose only bites in the stacked layout — the desktop
                    column is already narrower than it */}
                <div className="mx-auto mt-7 max-w-prose space-y-5 text-stick-linen/85 lg:mx-0">
                  {TRIBUTE_PARAGRAPHS.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Foot — spans the full width below both columns */}
            <blockquote className="mx-auto mt-12 max-w-2xl border-t border-stick-brass/25 pt-8">
              <p className="text-center font-heading text-[clamp(1.25rem,2.6vw,1.5rem)] leading-snug text-stick-linen">
                {CONDOLENCE}
              </p>
            </blockquote>

            <GuardOfHonour className="mx-auto mt-10 h-auto w-full max-w-[236px] text-stick-brass/55 md:max-w-[300px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
