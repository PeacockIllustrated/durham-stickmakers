import Image from 'next/image';
import Link from 'next/link';
import type { Block } from '@/lib/blocks';
import { stickImageUrl, cn } from '@/lib/utils';

/**
 * Server component that renders a list of blocks with Tailwind styling
 * consistent with the rest of the site. Each block type gets its own layout.
 */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) {
    return <p className="text-stick-driftwood italic">No content yet.</p>;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="whitespace-pre-line text-stick-shale text-[1.05rem] leading-relaxed">
          {block.text}
        </p>
      );

    case 'heading':
      return (
        <h2 className="font-heading text-h1 text-stick-walnut mt-10 first:mt-0">
          {block.text}
        </h2>
      );

    case 'subheading':
      return (
        <h3 className="font-heading text-h2 text-stick-walnut mt-8">
          {block.text}
        </h3>
      );

    case 'quote':
      return (
        <blockquote className="my-8 border-l-2 border-stick-brass pl-6 py-1">
          <p className="font-heading text-h3 text-stick-walnut leading-snug italic">
            &ldquo;{block.text}&rdquo;
          </p>
          {block.attribution && (
            <footer className="mt-3 text-small text-stick-driftwood">
              - {block.attribution}
            </footer>
          )}
        </blockquote>
      );

    case 'image': {
      const url = stickImageUrl(block.storage_path);
      if (!url) return null;
      return (
        <figure className="my-8 -mx-4 sm:mx-0">
          <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-stick-stone">
            <Image
              src={url}
              alt={block.alt ?? block.caption ?? ''}
              fill
              sizes="(min-width: 1024px) 720px, 100vw"
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-center text-small text-stick-driftwood italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'list':
      if (block.ordered) {
        return (
          <ol className="list-decimal pl-6 space-y-2 text-stick-shale text-[1.05rem] leading-relaxed marker:text-stick-brass marker:font-medium">
            {block.items.map((item, i) => <li key={i}>{item}</li>)}
          </ol>
        );
      }
      return (
        <ul className="space-y-2 text-stick-shale text-[1.05rem] leading-relaxed">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stick-brass" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'divider':
      return (
        <hr className="my-10 border-0 flex items-center justify-center before:content-['◆'] before:text-stick-brass before:text-sm before:tracking-[1em]" />
      );

    case 'cta': {
      if (!block.href || !block.label) return null;
      const isExternal = /^https?:\/\//i.test(block.href);
      const isBrass = block.variant === 'brass';

      const Shell = ({ children, className }: { children: React.ReactNode; className?: string }) =>
        isExternal ? (
          <a
            href={block.href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {children}
          </a>
        ) : (
          <Link href={block.href} className={className}>{children}</Link>
        );

      return (
        <div className="my-10 not-prose">
          <Shell
            className={cn(
              'group block no-underline rounded-card px-6 py-8 md:px-10 md:py-10 transition-colors',
              isBrass
                ? 'bg-stick-brass/15 border border-stick-brass/40 text-stick-walnut hover:bg-stick-brass/25'
                : 'bg-stick-walnut text-stick-linen hover:bg-stick-walnut/95'
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="min-w-0 flex-1 space-y-2">
                <p
                  className={cn(
                    'font-heading text-h2 leading-tight',
                    isBrass ? 'text-stick-walnut' : 'text-stick-linen'
                  )}
                >
                  {block.heading}
                </p>
                {block.body && (
                  <p className={cn('max-w-prose', isBrass ? 'text-stick-shale' : 'text-stick-linen/80')}>
                    {block.body}
                  </p>
                )}
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium tracking-wide shrink-0 transition-colors',
                  isBrass
                    ? 'bg-stick-walnut text-stick-linen group-hover:bg-stick-walnut/90'
                    : 'bg-stick-brass text-stick-walnut group-hover:bg-stick-linen'
                )}
              >
                {block.label}
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </Shell>
        </div>
      );
    }
  }
}
