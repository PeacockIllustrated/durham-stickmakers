'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn, stickImageUrl } from '@/lib/utils';
import type { StickProductImage } from '@/types/stick';

/**
 * Primary image + thumbnail rail. Keyboard-friendly on thumbnails.
 * Used on the product detail page.
 */
export function ProductImageGallery({
  images,
  title,
}: {
  images: StickProductImage[];
  title: string;
}) {
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex] ?? sorted[0];

  if (!active) {
    return (
      <div className="aspect-[4/5] rounded-card bg-stick-stone flex items-center justify-center text-stick-driftwood text-small uppercase tracking-wider">
        No image
      </div>
    );
  }

  const activeUrl = stickImageUrl(active.storage_path);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-stick-stone">
        {activeUrl && (
          <Image
            src={activeUrl}
            alt={active.alt_text ?? title}
            fill
            sizes="(min-width: 1024px) 50vw, 90vw"
            priority
            className="object-cover"
          />
        )}
      </div>

      {sorted.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {sorted.map((img, i) => {
            const url = stickImageUrl(img.storage_path);
            return (
              <li key={img.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'relative block aspect-square w-full overflow-hidden rounded-md border-2 transition-colors',
                    i === activeIndex
                      ? 'border-stick-brass'
                      : 'border-transparent hover:border-stick-stone'
                  )}
                  aria-label={`View image ${i + 1} of ${sorted.length}`}
                  aria-current={i === activeIndex}
                >
                  {url && (
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
