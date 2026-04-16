/**
 * Canonical list of site-wide photography assets. Served from /public/images.
 * Every image has an alt text (accessibility) and a caption (for gallery display).
 */

export interface SiteImage {
  src: string;
  alt: string;
  caption: string;
  category: ImageCategory;
  /** Aspect hint - 'wide' for panoramic, 'portrait' for tall, 'square' otherwise. */
  aspect: 'wide' | 'portrait' | 'square';
}

export type ImageCategory =
  | 'Finished sticks'
  | 'Handles & dressing'
  | 'Workshop life'
  | 'Collections';

export const SERVICE_CARDS: Array<{
  image: SiteImage;
  title: string;
  description: string;
  href: string;
  cta: string;
}> = [
  {
    image: {
      src: '/images/homepage/bespoke-walking-sticks.jpg',
      alt: 'A finished bespoke walking stick with a carved horn handle',
      caption: 'Bespoke walking sticks',
      category: 'Finished sticks',
      aspect: 'square',
    },
    title: 'Bespoke walking sticks',
    description:
      'Commission a one-of-a-kind stick dressed to your height, grip, and choice of wood, horn, or antler.',
    href: '/shop',
    cta: 'Browse the shop',
  },
  {
    image: {
      src: '/images/homepage/repairs-and-restorations.jpg',
      alt: 'A weathered walking stick ready for restoration',
      caption: 'Repairs & restorations',
      category: 'Workshop life',
      aspect: 'square',
    },
    title: 'Repairs & restorations',
    description:
      'Bring us a tired stick - a broken ferrule, a split collar, a loose handle - and we will bring it back.',
    href: '/contact',
    cta: 'Ask about a repair',
  },
  {
    image: {
      src: '/images/homepage/workshops-shows-demos.jpg',
      alt: 'Stickmakers at a workshop demonstration',
      caption: 'Workshops, shows & demos',
      category: 'Workshop life',
      aspect: 'square',
    },
    title: 'Workshops, shows & demos',
    description:
      'Drop in to a Monday or Tuesday evening session, or book a taster workshop and make your own.',
    href: '/workshops',
    cta: 'See workshops',
  },
];

/** The lead image for the homepage hero - a close portrait of a dressed stick. */
export const HERO_IMAGE: SiteImage = {
  src: '/images/gallery/individual-stick-portrait.jpg',
  alt: 'A handmade walking stick with a carved horn crook, photographed against a warm background',
  caption: 'A dressed shepherds crook - hazel shank, ram horn handle',
  category: 'Finished sticks',
  aspect: 'portrait',
};

/** Image used on the homepage's "about" teaser block. */
export const ABOUT_TEASER_IMAGE: SiteImage = {
  src: '/images/showcase/workshop-experience.jpg',
  alt: 'Members of Durham Stick Makers at work at the bench',
  caption: 'Monday night at Fencehouses Community Centre',
  category: 'Workshop life',
  aspect: 'square',
};

/** The full gallery - aggregates gallery/ and showcase/ folders. */
export const GALLERY_IMAGES: SiteImage[] = [
  {
    src: '/images/gallery/collection-panoramic-wide.jpg',
    alt: 'A full display case of dressed walking sticks arranged in a row',
    caption: 'The collection - a seasons worth of bench time',
    category: 'Collections',
    aspect: 'wide',
  },
  {
    src: '/images/gallery/display-lineup-panoramic.jpg',
    alt: 'A long line of finished walking sticks on display at a show',
    caption: 'Displayed at the county show',
    category: 'Collections',
    aspect: 'wide',
  },
  {
    src: '/images/gallery/individual-stick-portrait.jpg',
    alt: 'A single dressed walking stick photographed in close detail',
    caption: 'Dressed stick - horn, brass collar, hazel shank',
    category: 'Finished sticks',
    aspect: 'portrait',
  },
  {
    src: '/images/gallery/mixed-styles-group.jpg',
    alt: 'A grouped photograph showing crooks, walkers, and staffs of different styles',
    caption: 'Crooks, walkers and staffs side by side',
    category: 'Collections',
    aspect: 'square',
  },
  {
    src: '/images/showcase/dressed-stick-collection.jpg',
    alt: 'A collection of dressed sticks arranged for viewing',
    caption: 'A weekends output, dressed and ready',
    category: 'Collections',
    aspect: 'square',
  },
  {
    src: '/images/showcase/gents-beech-derby-walker.jpg',
    alt: 'A gentlemans derby walker in beech with a polished handle',
    caption: 'Gents beech derby walker',
    category: 'Finished sticks',
    aspect: 'square',
  },
  {
    src: '/images/showcase/workshop-experience.jpg',
    alt: 'Stickmakers at a wooden bench shaping sticks',
    caption: 'The Fencehouses workshop - bench, vice, and kettle',
    category: 'Workshop life',
    aspect: 'square',
  },
  {
    src: '/images/showcase/horn-handles-group.jpg',
    alt: 'A group of detailed horn handles showing grain and polish',
    caption: 'Ram and buffalo horn - every handle unique',
    category: 'Handles & dressing',
    aspect: 'square',
  },
  {
    src: '/images/showcase/stick-variety-group.jpg',
    alt: 'A variety of walking stick styles shown together',
    caption: 'A variety of styles - thumbsticks, knobs, crooks',
    category: 'Finished sticks',
    aspect: 'square',
  },
  {
    src: '/images/showcase/crooks-walkers-group.jpg',
    alt: 'Shepherds crooks and walking sticks grouped for a showcase',
    caption: 'Shepherds crooks and market sticks',
    category: 'Finished sticks',
    aspect: 'square',
  },
];

export const GALLERY_CATEGORIES: ImageCategory[] = [
  'Finished sticks',
  'Handles & dressing',
  'Workshop life',
  'Collections',
];

/** A handful of showcase images used on the homepage when no DB products are featured. */
export const HOMEPAGE_SHOWCASE: SiteImage[] = [
  GALLERY_IMAGES[1], // display lineup
  GALLERY_IMAGES[5], // derby walker
  GALLERY_IMAGES[7], // horn handles
  GALLERY_IMAGES[9], // crooks walkers
];
