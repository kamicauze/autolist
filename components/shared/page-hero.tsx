"use client";

import { cn } from "@/lib/utils";

interface PageHeroProps {
  label: string;
  heading: string;
  backgroundImage?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHero({
  label,
  heading,
  backgroundImage = "/hero-car.jpg",
  className,
  children,
}: PageHeroProps) {
  return (
    <section className={cn("relative", className)}>
      {/* Hero Image */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative h-[280px] sm:h-[320px] md:h-[340px] overflow-hidden rounded-2xl sm:rounded-3xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
          />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Text overlay */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3px] text-white">
              {label}
            </span>
            <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[40px] md:leading-[1.1]">
              {heading}
            </h1>
          </div>
        </div>

        {/* Overlapping content (form cards, etc.) */}
        {children && (
          <div className="relative z-10 -mt-10 sm:-mt-12">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
