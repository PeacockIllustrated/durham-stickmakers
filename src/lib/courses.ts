/**
 * Standing courses that run on dates arranged directly with the tutor, so they
 * don't fit the dated stick_workshops table. Booked by phone rather than through
 * the site's booking form. Add another entry here to list a new course.
 */

export interface CourseStep {
  title: string;
  description: string;
}

export interface Course {
  slug: string;
  title: string;
  /** Short line for cards and meta descriptions. */
  summary: string;
  intro: string;
  duration: string;
  schedule: string;
  location: string;
  price_pence: number;
  priceNote: string;
  steps: CourseStep[];
  included: string[];
  giftVouchers: boolean;
  contact: {
    name: string;
    phone: string;
    email?: string;
  };
  image: { src: string; alt: string };
  /** Optional downloadable flyer in /public. */
  flyer?: { href: string; label: string };
}

export const COURSES: Course[] = [
  {
    slug: 'make-your-own-country-stick',
    title: 'Make your own country stick',
    summary:
      'A two-day, hands-on course. Straighten a shank, choose your handle, fix it and finish it, then take home a stick you made yourself.',
    intro:
      'No experience needed. You’ll work at the bench with an experienced stick maker, using proper tools, and go home with a one-of-a-kind country stick.',
    duration: 'Two days',
    schedule: 'Dates by arrangement',
    location: 'North Leeds',
    price_pence: 12000,
    priceNote: 'Per person, all inclusive',
    steps: [
      {
        title: 'Straighten your stick',
        description: 'Learn how to heat and set a natural shank so it runs true.',
      },
      {
        title: 'Choose your handle type',
        description: 'Look through the options and pick the handle style that suits you.',
      },
      {
        title: 'Fix handle to stick',
        description: 'Shape, fit and secure the joint the traditional way.',
      },
      {
        title: 'Finish and take home',
        description: 'Sand, seal and polish. Your stick leaves with you at the end of the course.',
      },
    ],
    included: [
      'Materials and use of equipment',
      'Morning coffee, lunch and drinks on both days',
      'Insurance',
    ],
    giftVouchers: true,
    contact: {
      name: 'Roger',
      phone: '07715 422651',
      email: 'rdwilliams471@gmail.com',
    },
    image: {
      src: '/images/gallery/display-lineup-panoramic.jpg',
      alt: 'A horn crook handle with a carved and painted great spotted woodpecker',
    },
    flyer: {
      href: '/downloads/stick-making-course-a5.pdf',
      label: 'Download the flyer (PDF)',
    },
  },
];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

/** "07715 422651" → "tel:+447715422651" (UK numbers). */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `tel:${digits.startsWith('0') ? `+44${digits.slice(1)}` : `+${digits}`}`;
}

/** Whole-pound prices without pence: 12000 → "£120". */
export function formatCoursePrice(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
  }).format(pence / 100);
}
