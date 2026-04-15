'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ImageCategory, SiteImage } from '@/lib/site-images';
import { cn } from '@/lib/utils';

interface GalleryLightboxProps {
  images: SiteImage[];
  categories: ImageCategory[];
}

export function GalleryLightbox({ images, categories }: GalleryLightboxProps) {
  const [filter, setFilter] = useState<ImageCategory | 'all'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (filter === 'all' ? images : images.filter((i) => i.category === filter)),
    [filter, images]
  );

  const openAt = useCallback((filteredIndex: number) => {
    setLightboxIndex(filteredIndex);
  }, []);

  const close = useCallback(() => setLightboxIndex(null), []);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length));
  }, [filtered.length]);

  const prev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + filtered.length) % filtered.length
    );
  }, [filtered.length]);

  // Keyboard navigation — arrows, esc
  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, close, next, prev]);

  // Lock scroll while lightbox is open
  useEffect(() => {
    if (lightboxIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex]);

  // Reset lightbox if active image disappears after filter change
  useEffect(() => {
    if (lightboxIndex !== null && lightboxIndex >= filtered.length) {
      setLightboxIndex(null);
    }
  }, [filtered.length, lightboxIndex]);

  const activeImage = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
          All ({images.length})
        </FilterPill>
        {categories.map((cat) => {
          const count = images.filter((i) => i.category === cat).length;
          if (count === 0) return null;
          return (
            <FilterPill
              key={cat}
              active={filter === cat}
              onClick={() => setFilter(cat)}
            >
              {cat} ({count})
            </FilterPill>
          );
        })}
      </div>

      {/* Masonry-ish grid — CSS columns preserves natural heights */}
      {filtered.length === 0 ? (
        <p className="text-stick-driftwood">No images in this category yet.</p>
      ) : (
        <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>li]:break-inside-avoid [&>li]:mb-5">
          {filtered.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => openAt(i)}
                className={cn(
                  'group relative block w-full overflow-hidden rounded-card bg-stick-stone focus:outline-none focus:ring-2 focus:ring-stick-brass focus:ring-offset-2 focus:ring-offset-stick-linen',
                  img.aspect === 'wide' && 'aspect-[16/9]',
                  img.aspect === 'portrait' && 'aspect-[3/4]',
                  img.aspect === 'square' && 'aspect-square'
                )}
                aria-label={`Open ${img.caption}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 95vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stick-walnut/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="pill-brass bg-stick-linen/90 backdrop-blur text-xs">
                    {img.category}
                  </span>
                  <p className="mt-2 text-small font-medium text-stick-linen text-left">
                    {img.caption}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Lightbox */}
      {activeImage && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.caption}
          className="fixed inset-0 z-50 flex items-center justify-center bg-stick-walnut/95 backdrop-blur-sm"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close gallery"
            className="absolute top-5 right-5 rounded-full bg-stick-linen/10 p-3 text-stick-linen hover:bg-stick-linen/20 transition-colors focus:outline-none focus:ring-2 focus:ring-stick-brass"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous image"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 rounded-full bg-stick-linen/10 p-3 text-stick-linen hover:bg-stick-linen/20 transition-colors focus:outline-none focus:ring-2 focus:ring-stick-brass"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next image"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 rounded-full bg-stick-linen/10 p-3 text-stick-linen hover:bg-stick-linen/20 transition-colors focus:outline-none focus:ring-2 focus:ring-stick-brass"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <figure
            className="relative max-h-[85vh] max-w-[min(92vw,1100px)] w-full mx-auto p-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1 w-full">
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                width={1600}
                height={1200}
                sizes="90vw"
                priority
                className="mx-auto max-h-[75vh] w-auto h-auto object-contain rounded-md"
              />
            </div>
            <figcaption className="mt-4 text-center max-w-2xl">
              <p className="text-stick-linen font-heading text-h4">{activeImage.caption}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-stick-brass">
                {activeImage.category} · {lightboxIndex + 1} / {filtered.length}
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-stick-brass focus:ring-offset-2 focus:ring-offset-stick-linen',
        active
          ? 'bg-stick-walnut text-stick-linen'
          : 'bg-stick-cream text-stick-driftwood hover:bg-stick-stone hover:text-stick-walnut'
      )}
    >
      {children}
    </button>
  );
}
