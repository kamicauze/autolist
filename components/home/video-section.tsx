import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const REVIEW_ARTICLES = [
  {
    id: 1,
    title: "2019 Mercedes Benz Premium Review",
    excerpt:
      "A closer look at comfort, ownership costs, and features that matter for Kenyan buyers.",
    category: "Expert Review",
    image: "/sample-car-1.jpg",
    date: "Jan 25, 2026",
    href: "/reviews/1",
  },
  {
    id: 2,
    title: "2024 BMW X5 Full Test Drive",
    excerpt:
      "What stands out in performance, cabin space, fuel use, and everyday drivability.",
    category: "Test Drive",
    image: "/sample-car-2.jpg",
    date: "Jan 24, 2026",
    href: "/reviews/2",
  },
  {
    id: 3,
    title: "Toyota Land Cruiser 300 Series Review",
    excerpt:
      "A practical review of capability, reliability, and value for long-distance driving.",
    category: "Expert Review",
    image: "/sample-car-3.jpg",
    date: "Jan 23, 2026",
    href: "/reviews/3",
  },
  {
    id: 4,
    title: "Electric vs Hybrid: Which is Better?",
    excerpt:
      "Key differences in running costs, charging, resale value, and ownership fit.",
    category: "Comparison",
    image: "/sample-car-4.jpg",
    date: "Jan 22, 2026",
    href: "/reviews/4",
  },
];

export function VideoSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1285px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Car reviews and blogs
          </h2>
          <Link
            href="/reviews"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex snap-x snap-mandatory gap-6">
            {REVIEW_ARTICLES.map((article) => (
              <Link
                key={article.id}
                href={article.href}
                className="group w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:w-[320px] lg:w-[360px]"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="mb-2 text-sm text-gray-500">{article.date}</p>
                  <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-primary">
                    {article.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-gray-600">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
