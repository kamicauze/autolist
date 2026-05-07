import Link from "next/link";
import { ArrowRight } from "lucide-react";

type PopularSearchesProps = {
  searches: Array<{
    label: string;
    href: string;
  }>;
};

export function PopularSearches({ searches }: PopularSearchesProps) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Most popular car searches
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 sm:text-base">
              Start with the makes buyers search most often on Autolist.
            </p>
          </div>
          <Link
            href="/search"
            className="hidden items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:inline-flex"
          >
            Browse all cars
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {searches.map((search) => (
            <Link
              key={search.label}
              href={search.href}
              className="group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 transition-all duration-200 hover:border-primary/30 hover:bg-white hover:shadow-sm"
            >
              <span className="text-sm font-medium text-gray-900 sm:text-base">
                {search.label}
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-primary" />
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Browse all cars
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
