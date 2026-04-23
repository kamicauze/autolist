import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getGoogleMapsEmbedUrl } from "@/lib/google-maps";

interface GoogleMapEmbedProps {
  apiKey?: string | null;
  query?: string | null;
  title: string;
  className?: string;
  fallback?: ReactNode;
}

export function GoogleMapEmbed({
  apiKey,
  query,
  title,
  className,
  fallback = null,
}: GoogleMapEmbedProps) {
  const embedUrl = getGoogleMapsEmbedUrl(apiKey, query);

  if (!embedUrl) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <iframe
        title={title}
        src={embedUrl}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0"
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
        <div className="absolute left-1/2 top-[82%] h-7 w-7 -translate-x-1/2 rounded-full bg-[#ef4444]/25 blur-md" />
        <div className="relative h-11 w-11 rounded-full bg-[#ef4444] shadow-[0_14px_24px_rgba(15,23,42,0.22)] ring-4 ring-white/85">
          <div className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-[70%] rotate-45 bg-[#ef4444]" />
          <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95" />
        </div>
      </div>
    </div>
  );
}
