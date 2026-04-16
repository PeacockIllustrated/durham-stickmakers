import Image from 'next/image';
import Link from 'next/link';
import type { StickWorkshop } from '@/types/stick';
import { formatDate, formatPence, formatTime, stickImageUrl, cn } from '@/lib/utils';

export function WorkshopCard({
  workshop,
  fallbackImage,
}: {
  workshop: StickWorkshop;
  fallbackImage?: { src: string; alt: string };
}) {
  const imgUrl = workshop.featured_image_path
    ? stickImageUrl(workshop.featured_image_path)
    : fallbackImage?.src ?? null;
  const soldOut =
    workshop.status === 'fully_booked' || workshop.spots_remaining <= 0;
  const isPast = workshop.status === 'completed';
  const isCancelled = workshop.status === 'cancelled';

  return (
    <Link
      href={`/workshops/${workshop.slug}`}
      className={cn(
        'group block overflow-hidden rounded-card border border-stick-stone bg-stick-surface no-underline text-stick-walnut transition-colors hover:border-stick-brass',
        (isPast || isCancelled) && 'opacity-60'
      )}
    >
      <div className="relative aspect-[16/10] bg-stick-stone">
        {imgUrl && (
          <Image
            src={imgUrl}
            alt={fallbackImage?.alt ?? workshop.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {soldOut && !isPast && !isCancelled && (
            <span className="pill bg-stick-walnut text-stick-linen">Fully booked</span>
          )}
          {isCancelled && <span className="pill bg-red-100 text-red-800">Cancelled</span>}
          {isPast && <span className="pill bg-stick-stone text-stick-driftwood">Past</span>}
        </div>
      </div>

      <div className="p-5 space-y-2">
        <p className="label-caps">
          {formatDate(workshop.date)} · {formatTime(workshop.start_time)}–{formatTime(workshop.end_time)}
        </p>
        <h3 className="font-heading text-h3 leading-tight">{workshop.title}</h3>
        <p className="text-small text-stick-shale line-clamp-2">
          {workshop.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-medium text-stick-walnut">
            {workshop.price_pence === 0 ? 'Free' : formatPence(workshop.price_pence)}
          </span>
          <span className="text-small text-stick-driftwood">
            {soldOut
              ? '-'
              : `${workshop.spots_remaining} ${workshop.spots_remaining === 1 ? 'spot' : 'spots'} left`}
          </span>
        </div>
      </div>
    </Link>
  );
}
