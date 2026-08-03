/**
 * In-memoriam notice for the homepage — a slate-and-brass plaque carrying the
 * tribute to Tom Keers, founder member and Chairman of Durham Stick Makers.
 *
 * The ornament is drawn entirely from his craft: paired shepherds crooks at the
 * head, a brass collar rule between the name and the tribute, and a standing row
 * of stick types — crook, thumbstick, knob stick, market stick, staff — as a
 * guard of honour at the foot. Every ornament is decorative and hidden from
 * assistive technology; the tribute text is the only thing announced.
 *
 * The tribute is reproduced verbatim as supplied by the charity, including its
 * own spelling of "Durham Stickmakers".
 *
 * To retire the notice later, remove <ObituaryNotice /> from
 * src/app/(public)/page.tsx — nothing else references it.
 */

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
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-card bg-walnut-gradient text-stick-linen shadow-[0_24px_60px_-24px_rgba(47,56,66,0.6)]">
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

          <div className="relative px-7 py-12 sm:px-12 md:px-16 md:py-16">
            <CrookMasthead className="mx-auto h-auto w-full max-w-[300px] text-stick-brass md:max-w-[368px]" />

            <p className="mt-6 text-center text-xs font-medium uppercase tracking-[0.28em] text-stick-brass">
              In memoriam
            </p>

            <h2
              id="in-memoriam-heading"
              className="mt-3 text-center font-heading text-[clamp(2.25rem,6vw,3.25rem)] leading-tight tracking-[0.01em] text-stick-linen [text-shadow:0_2px_10px_rgba(20,26,33,0.55)]"
            >
              <span className="sr-only">In memoriam: </span>Tom Keers
            </h2>

            <p className="mt-3 text-center text-small text-stick-linen/70">
              Founder member and Chairman of Durham Stickmakers
            </p>

            <CollarRule className="mx-auto mt-8 h-auto w-full max-w-[240px] text-stick-brass/70" />

            <div className="mx-auto mt-8 max-w-prose space-y-5 text-stick-linen/85">
              {TRIBUTE_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <blockquote className="mx-auto mt-10 max-w-prose border-t border-stick-brass/25 pt-8">
              <p className="text-center font-heading text-[clamp(1.25rem,2.6vw,1.5rem)] leading-snug text-stick-linen">
                {CONDOLENCE}
              </p>
            </blockquote>

            <GuardOfHonour className="mx-auto mt-10 h-auto w-full max-w-[236px] text-stick-brass/55 md:max-w-[268px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
