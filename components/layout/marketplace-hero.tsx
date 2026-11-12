import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const MARKETPLACE_PAGE_WIDTH = "mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:w-[88%] lg:px-0";

export function MarketplaceHero({
  imageSrc,
  imageClassName,
  className,
  children,
}: {
  imageSrc: string;
  imageClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-[#f0f6ff] text-[#0f1b31]", className)}>
      <div className={MARKETPLACE_PAGE_WIDTH}>{children}</div>
      <div
        aria-hidden="true"
        className={cn("pointer-events-none relative -z-10 h-28 w-full sm:h-44 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[60%]", imageClassName)}
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover object-right-bottom [mask-image:linear-gradient(to_bottom,transparent,black_23%)] lg:object-right lg:[mask-image:linear-gradient(to_right,transparent,black_26%)]"
        />
      </div>
    </section>
  );
}
