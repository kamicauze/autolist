"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import {
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  GitCompare,
  Heart,
  MapPin,
  Settings2,
  UserRound,
} from "lucide-react";
import { setListingWishlistState } from "@/lib/actions/favorites";
import { useCompare } from "@/lib/hooks/use-compare";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { IconFuel, IconGear, IconSpeedometer } from "./icons";

export interface CarCardProps {
  id: string;
  title: string;
  subtitle?: string;
  bodyType: string;
  year: number;
  mileage?: string;
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
  location?: string;
  sellerLabel?: string;
  contactLabel?: string;
  contactKind?: "message" | "call";
  price: number;
  originalPrice?: number;
  currency?: string;
  images: string[];
  isFeatured?: boolean;
  seller: {
    name: string;
    avatarUrl?: string;
  };
  initialIsFavorited?: boolean;
  href?: string;
  density?: "default" | "compact";
}

export function CarCard({
  id,
  title,
  subtitle,
  bodyType,
  mileage,
  fuelType,
  transmission,
  engineSize,
  location,
  sellerLabel,
  contactKind = "message",
  price,
  originalPrice,
  currency = "Ksh",
  images,
  isFeatured = false,
  seller: _seller,
  initialIsFavorited,
  href,
  density = "default",
}: CarCardProps) {
  const isCompact = density === "compact";
  const router = useRouter();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isLiked, setIsLiked] = React.useState(Boolean(initialIsFavorited));
  const [isWishlistPending, setIsWishlistPending] = React.useState(false);
  const { ids, isLoaded, isInCompare, toggleCompare, maxItems } = useCompare();

  const formattedPrice = new Intl.NumberFormat("en-KE").format(price);
  const formattedOriginalPrice = originalPrice
    ? new Intl.NumberFormat("en-KE").format(originalPrice)
    : null;

  const imageCount = images.length;
  const displayImages = imageCount > 0 ? images : ["/placeholder-car.jpg"];
  const indicatorCount = Math.min(imageCount, 5);
  const activeIndicatorIndex =
    indicatorCount > 0 ? Math.min(selectedIndex, indicatorCount - 1) : 0;
  const inCompare = isInCompare(id);
  const compareLimitReached = !inCompare && ids.length >= maxItems;
  const displaySellerLabel = (sellerLabel || _seller.name).replace(/\s+Unit$/i, "");

  React.useEffect(() => {
    if (typeof initialIsFavorited === "boolean") {
      setIsLiked(initialIsFavorited);
      return;
    }

    let active = true;

    const run = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) {
        return;
      }

      const { data, error } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error) {
        console.error("Unable to load favorite state:", error);
        return;
      }

      setIsLiked(Boolean(data));
    };

    void run();

    return () => {
      active = false;
    };
  }, [id, initialIsFavorited]);

  const scrollPrev = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      emblaApi?.scrollPrev();
    },
    [emblaApi]
  );

  const scrollNext = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      emblaApi?.scrollNext();
    },
    [emblaApi]
  );

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const onCompareClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!isLoaded || compareLimitReached) {
        return;
      }
      toggleCompare(id);
    },
    [compareLimitReached, id, isLoaded, toggleCompare]
  );

  const onLikeClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (isWishlistPending) {
        return;
      }

      const nextValue = !isLiked;
      setIsLiked(nextValue);
      setIsWishlistPending(true);

      void (async () => {
        const result = await setListingWishlistState(id, nextValue);

        if (result.error) {
          setIsLiked(!nextValue);
          setIsWishlistPending(false);

          if (result.error === "AUTH_REQUIRED") {
            const nextPath =
              typeof window !== "undefined"
                ? `${window.location.pathname}${window.location.search}`
                : href || "/search";
            router.push(`/login?next=${encodeURIComponent(nextPath)}`);
            return;
          }

          console.error("Unable to update favorites:", result.error);
          return;
        }

        setIsWishlistPending(false);
      })();
    },
    [href, id, isLiked, isWishlistPending, router]
  );

  const cardContent = (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className={cn("relative w-full overflow-hidden bg-muted", isCompact ? "h-60 sm:h-52" : "h-60")}>
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {displayImages.map((imageUrl, index) => (
              <div key={index} className="relative h-full min-w-0 flex-[0_0_100%]">
                <Image
                  src={imageUrl}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                />
              </div>
            ))}
          </div>
        </div>

        {imageCount > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 z-30 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-card/65 text-card-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-card/85"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 top-1/2 z-30 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-card/65 text-card-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-card/85"
              aria-label="Next image"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}

        <div className="absolute left-2.5 top-2.5 z-30 flex items-center gap-2">
          {isFeatured ? (
            <span className="inline-flex h-7 items-center rounded-[7px] bg-primary/90 px-2.5 text-[12px] font-semibold leading-none text-primary-foreground shadow-sm backdrop-blur-md">
              Featured
            </span>
          ) : null}
        </div>

        <div className="absolute right-2.5 top-2.5 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={onCompareClick}
            disabled={!isLoaded || compareLimitReached}
            aria-label={inCompare ? "Remove from compare" : "Add to compare"}
            title={
              compareLimitReached
                ? `You can compare up to ${maxItems} vehicles`
                : inCompare
                  ? "Remove from compare"
                  : "Add to compare"
            }
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-card/65 text-primary shadow-sm backdrop-blur-md transition-colors hover:bg-card/85",
              (!isLoaded || compareLimitReached) && "cursor-not-allowed opacity-60"
            )}
          >
            {inCompare ? <Check className="h-3.5 w-3.5" /> : <GitCompare className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={onLikeClick}
            disabled={isWishlistPending}
            aria-label={isLiked ? "Remove from favorites" : "Save to favorites"}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-card/65 text-primary shadow-sm backdrop-blur-md transition-colors hover:bg-card/85 hover:text-destructive",
              isLiked && "text-destructive",
              isWishlistPending && "cursor-wait opacity-80"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
          </button>
        </div>

        {imageCount > 1 && (
          <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
            {Array.from({ length: indicatorCount }).map((_, index) => (
              <button
                key={index}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  emblaApi?.scrollTo(index);
                }}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  activeIndicatorIndex === index ? "w-4 bg-white" : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col divide-y divide-border/70", isCompact ? "p-3.5" : "p-4")}>
        <div className={cn("flex items-start", isCompact ? "min-h-12 pb-2.5" : "min-h-14 pb-3")}>
          <h3
            className={cn(
              "line-clamp-2 break-words font-medium text-card-foreground",
              isCompact ? "text-[14px] leading-[20px]" : "text-[18px] leading-[25.2px]"
            )}
          >
            {title}
          </h3>
        </div>

        {fuelType || engineSize || bodyType || transmission || mileage ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-4 gap-y-2 font-medium text-muted-foreground",
            isCompact
              ? "py-3 text-[11px] leading-[17px]"
              : "py-3.5 text-[12px] leading-[19.6px]"
          )}
        >
          {fuelType ? (
            <div className="flex min-w-0 basis-[calc(50%-0.5rem)] items-center gap-1.5 whitespace-nowrap sm:basis-auto">
              <IconFuel className={cn("shrink-0", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
              <span>{fuelType}</span>
            </div>
          ) : null}
          {engineSize || bodyType ? (
            <div className="flex min-w-0 basis-[calc(50%-0.5rem)] items-center gap-1.5 whitespace-nowrap sm:basis-auto">
              <Settings2 className={cn("shrink-0", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
              <span>{engineSize || bodyType}</span>
            </div>
          ) : null}
          {transmission ? (
            <div className="flex min-w-0 basis-[calc(50%-0.5rem)] items-center gap-1.5 whitespace-nowrap sm:basis-auto">
              <IconGear className={cn("shrink-0", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
              <span>{transmission}</span>
            </div>
          ) : null}
          {mileage ? (
            <div className="flex min-w-0 basis-[calc(50%-0.5rem)] items-center gap-1.5 whitespace-nowrap sm:basis-auto">
              <IconSpeedometer className={cn("shrink-0", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
              <span>{mileage}</span>
            </div>
          ) : null}
        </div>
        ) : null}
        <div
          className={cn(
            "font-medium text-muted-foreground",
            isCompact ? "py-3 text-[11px] leading-[17px]" : "py-3.5 text-[12px] leading-[18px]"
          )}
        >
          <div className="flex min-w-0 items-start gap-1.5">
            <MapPin className={cn("shrink-0 text-primary", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
            <span className="min-w-0 break-words">{location || subtitle || "Kenya"}</span>
          </div>
        </div>

        <div className={cn("mt-auto flex items-center justify-between gap-3", isCompact ? "pt-3" : "pt-3.5")}>
          <div className="min-w-0">
            <span
              className={cn(
                "block truncate font-bold text-card-foreground",
                isCompact ? "text-[17px] leading-[24px]" : "text-[20px] leading-[28px]"
              )}
            >
              {currency}
              {formattedPrice}
            </span>
            {formattedOriginalPrice ? (
              <span
                className={cn(
                  "block font-medium text-muted-foreground line-through",
                  isCompact ? "text-[11px] leading-[16px]" : "text-[13px] leading-[19.6px]"
                )}
              >
                {currency}
                {formattedOriginalPrice}
              </span>
            ) : null}
          </div>
          <div
            className={cn(
              "flex shrink-0 items-center gap-1.5 font-medium text-muted-foreground",
              isCompact ? "text-[11px] leading-[16px]" : "text-[12px] leading-[18px]"
            )}
          >
            {contactKind === "call" ? (
              <BriefcaseBusiness className="h-3 w-3 shrink-0" />
            ) : (
              <UserRound className="h-3 w-3 shrink-0" />
            )}
            <span className="whitespace-nowrap">{displaySellerLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} scroll className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
