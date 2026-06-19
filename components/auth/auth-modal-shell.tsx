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
  eyebrow?: string;
  description?: string;
  className?: string;
}

export function AuthModalShell({
  title,
  imageAlt,
  imageSrc,
  children,
  eyebrow = "Autolist account",
  description,
  className,
}: AuthModalShellProps) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#f6f4ef] px-4 py-8 sm:py-10">
      <div className="absolute inset-x-0 top-0 h-40 bg-white/70" />
      <section
        className={cn(
          "relative z-10 w-full max-w-5xl overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0px_24px_70px_rgba(32,34,36,0.16)] md:grid md:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]",
          className
        )}
      >
        <div className="relative min-h-60 md:min-h-full">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.08),rgba(17,24,39,0.76))]" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
              {eyebrow}
            </p>
            <p className="mt-3 max-w-sm font-heading text-[26px] font-semibold leading-tight">
              Manage saved cars, listings, and seller conversations from one account.
            </p>
          </div>
        </div>

        <div className="relative bg-white p-6 sm:p-8 md:p-10">
          <Link
            href="/"
            aria-label="Close"
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ededed] bg-white text-gray-500 transition hover:border-[#d9d9d9] hover:text-gray-800 active:translate-y-px"
          >
            <IconX className="h-5 w-5" />
          </Link>
          <div className="max-w-[520px] pr-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-heading text-[32px] font-semibold leading-tight text-[#24272C] sm:text-[36px]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 text-[14px] leading-6 text-[#696665]">{description}</p>
            ) : null}
          </div>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  );
}
