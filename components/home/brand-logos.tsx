"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const brands = [
  { name: "Land Rover", slug: "land-rover", logo: "/brands/land-rover.svg" },
  { name: "Kia", slug: "kia", logo: "/brands/kia.svg" },
  { name: "Toyota", slug: "toyota", logo: "/brands/toyota.svg" },
  { name: "Jeep", slug: "jeep", logo: "/brands/jeep.svg" },
  { name: "Nissan", slug: "nissan", logo: "/brands/nissan.svg" },
  { name: "Ford", slug: "ford", logo: "/brands/ford.svg" },
  { name: "BMW", slug: "bmw", logo: "/brands/bmw.svg" },
  { name: "Hyundai", slug: "hyundai", logo: "/brands/hyundai.svg" },
];

export function BrandLogos() {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            What would you like to find?
          </h2>
          <Link
            href="/search"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-2 py-4 -mx-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/search?make=${brand.slug}`}
                className="flex-shrink-0 group"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
                  {/* Brand Logo */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex items-center justify-center">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={48}
                      height={48}
                      className="object-contain"
                      onError={(e) => {
                        // Fallback to initials if logo fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-xl font-bold text-gray-600">${brand.name.slice(0, 2).toUpperCase()}</span>`;
                        }
                      }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                    {brand.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
