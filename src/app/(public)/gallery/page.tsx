import type { Metadata } from 'next';
import { GalleryLightbox } from '@/components/GalleryLightbox';
import { GALLERY_IMAGES, GALLERY_CATEGORIES } from '@/lib/site-images';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Photographs of handmade walking sticks, horn handles, and workshop life at Durham Stick Makers.',
};

export default function GalleryPage() {
  return (
    <section className="section">
      <div className="container-wide">
        <div className="max-w-2xl mb-12">
          <span className="label-caps">Gallery</span>
          <h1 className="mt-2 font-heading text-hero">
            The work, up close
          </h1>
          <p className="mt-4 text-stick-shale text-lg">
            Finished sticks, horn handles, workshop life and collections — a growing record of
            what passes across our benches at Fencehouses. Click any image to view full size.
          </p>
        </div>

        <GalleryLightbox
          images={GALLERY_IMAGES}
          categories={GALLERY_CATEGORIES}
        />

        <div className="mt-16 text-center text-small text-stick-driftwood">
          All photographs © Durham Stick Makers.
        </div>
      </div>
    </section>
  );
}
