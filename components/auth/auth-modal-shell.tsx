import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { IconX } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface AuthModalShellProps {
  title: string;
  imageAlt: string;
  imageSrc: string;
  children: ReactNode;
  className?: string;
}

export function AuthModalShell({
  title,
  imageAlt,
  imageSrc,
  children,
  className,
}: AuthModalShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-black/30 via-black/20 to-black/30 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
      <section
        className={cn(
          "relative z-10 w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-[0px_24px_60px_rgba(0,0,0,0.2)] md:grid md:grid-cols-[380px_1fr]",
          className
        )}
      >
        <div className="relative h-52 md:h-full">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover"
          />
        </div>

        <div className="relative bg-white p-6 md:p-10">
          <Link
            href="/"
            aria-label="Close"
            className="absolute right-6 top-6 text-gray-500 transition-colors hover:text-gray-800"
          >
            <IconX className="h-5 w-5" />
          </Link>
          <h1 className="text-[36px] font-semibold leading-[1.2] text-[#24272C]">{title}</h1>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
