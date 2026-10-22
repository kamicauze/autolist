"use client";

import { cn } from "@/lib/utils";

interface PageHeroProps {
  label: string;
  heading: string;
  backgroundImage?: string;
  align?: "center" | "left";
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHero({
  label,
  heading,
  backgroundImage = "/hero-car.jpg",
  align = "center",
  description,
  className,
  children,
}: PageHeroProps) {
  return (
    <section className={cn("relative", className)}>
      {/* Hero Image */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className={cn("relative overflow-hidden rounded-xl", align === "left" ? "min-h-[320px] sm:min-h-[360px] md:min-h-[400px]" : "h-[280px] sm:h-[320px] md:h-[340px]")}>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
          />
          {/* Dark overlay for text legibility */}
          <div className={cn("absolute inset-0", align === "left" ? "bg-gradient-to-r from-black/75 via-black/30 to-transparent" : "bg-black/40")} />

          {/* Text overlay */}
          <div className={cn("relative z-10 flex flex-col justify-center px-6", align === "left" ? "min-h-[320px] items-start py-12 text-left sm:min-h-[360px] sm:px-10 md:min-h-[400px] lg:px-12" : "h-full items-center text-center")}>
            <span className="text-xs font-bold uppercase tracking-[0.3px] text-white">
              {label}
            </span>
            <h1 className={cn("mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[40px] md:leading-[1.1]", align === "left" ? "max-w-lg md:max-w-[48%]" : "max-w-2xl")}>
              {heading}
            </h1>
            {description && <p className="mt-4 max-w-md text-sm leading-6 text-white/90 sm:text-base">{description}</p>}
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
