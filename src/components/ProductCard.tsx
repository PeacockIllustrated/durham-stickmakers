import Image from 'next/image';
import Link from 'next/link';
import type { StickProduct } from '@/types/stick';
import { formatPence, stickImageUrl, cn } from '@/lib/utils';

interface ProductCardProps {
  product: StickProduct;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const primary =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0] ?? null;
  const imgUrl = primary ? stickImageUrl(primary.storage_path) : null;
  const sold = product.status === 'sold';
  const isOneOfAKind = product.product_type === 'one_of_a_kind';

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn(
        'group block no-underline text-stick-walnut',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-stick-stone">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={primary?.alt_text ?? product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              'object-cover transition-transform duration-500 group-hover:scale-[1.03]',
              sold && 'opacity-70'
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stick-driftwood text-xs tracking-wider uppercase">
            No image
          </div>
        )}

        {isOneOfAKind && (
          <span className="absolute left-3 top-3 pill-brass bg-stick-linen/95 backdrop-blur">
            One of a kind
          </span>
        )}
        {sold && (
          <span className="absolute right-3 top-3 pill bg-stick-walnut text-stick-linen">
            Sold
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="font-heading text-h4 leading-tight">{product.title}</h3>
        {product.maker?.name && (
          <p className="text-small text-stick-driftwood">Made by {product.maker.name}</p>
        )}
        <p className="font-body text-small font-semibold text-stick-walnut">
          {formatPence(product.price_pence)}
        </p>
      </div>
    </Link>
  );
}
