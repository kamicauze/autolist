import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const NEWS_ARTICLES = [
  {
    id: 1,
    title: "Not Ready for a 2 Door? 880 Hybrid Unveiled",
    excerpt:
      "A new hybrid option for those who want practicality without compromising on efficiency.",
    image: "/sample-car-1.jpg",
    date: "Jan 25, 2026",
    category: "News",
  },
  {
    id: 2,
    title: "Not Ready for 5 2 Door? 880 Hybrid Unveiled",
    excerpt:
      "The latest in hybrid technology brings performance and sustainability together.",
    image: "/sample-car-2.jpg",
    date: "Jan 24, 2026",
    category: "Reviews",
  },
  {
    id: 3,
    title: "Not Ready for 4 2 Door? 880 Hybrid Unveiled",
    excerpt:
      "What you need to know about the newest hybrid vehicles hitting the market.",
    image: "/sample-car-3.jpg",
    date: "Jan 23, 2026",
    category: "Tips",
  },
];

export function NewsSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            News to help choose your car
          </h2>
          <Link
            href="/news"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NEWS_ARTICLES.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.id}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-2">{article.date}</p>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
