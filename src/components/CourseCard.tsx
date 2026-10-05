import Image from 'next/image';
import Link from 'next/link';
import { formatCoursePrice, type Course } from '@/lib/courses';

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/workshops/courses/${course.slug}`}
      className="group grid overflow-hidden rounded-card border border-stick-stone bg-stick-surface no-underline text-stick-walnut transition-colors hover:border-stick-brass md:grid-cols-5"
    >
      <div className="relative aspect-[16/10] bg-stick-stone md:col-span-2 md:aspect-auto md:min-h-[18rem]">
        <Image
          src={course.image.src}
          alt={course.image.alt}
          fill
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center rounded-full bg-stick-linen/95 px-3 py-1 text-xs font-medium uppercase tracking-wider text-stick-walnut shadow-sm">
            {course.schedule}
          </span>
        </div>
      </div>

      <div className="flex flex-col p-6 md:col-span-3 md:p-8">
        <p className="label-caps">
          {course.duration} course · {course.location}
        </p>
        <h3 className="mt-2 font-heading text-h2 leading-tight">{course.title}</h3>
        <p className="mt-3 text-stick-shale leading-relaxed">{course.summary}</p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {course.included.map((item) => (
            <li key={item} className="pill">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
          <div>
            <span className="font-heading text-h2 text-stick-walnut">
              {formatCoursePrice(course.price_pence)}
            </span>
            <span className="ml-2 text-small text-stick-driftwood">{course.priceNote}</span>
          </div>
          <span className="text-small font-medium text-stick-walnut group-hover:text-stick-brass">
            Course details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
