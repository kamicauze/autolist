"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Check, GitCompare, Heart } from "lucide-react";
import { setListingWishlistState } from "@/lib/actions/favorites";
import { useCompare } from "@/lib/hooks/use-compare";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { IconCamera, IconFuel, IconGear, IconSpeedometer } from "./icons";

export interface CarCardProps {
  id: string;
  title: string;
  subtitle?: string;
  bodyType: string;
  year: number;
  mileage: string;
  fuelType: string;
  transmission: string;
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
}

export function CarCard({
  id,
  title,
  subtitle,
  bodyType,
  year,
  mileage,
  fuelType,
  transmission,
  price,
  originalPrice,
  currency = "Ksh",
  images,
  isFeatured = false,
  seller: _seller,
  initialIsFavorited,
  href,
}: CarCardProps) {
  void _seller;

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
  const inCompare = isInCompare(id);
  const compareLimitReached = !inCompare && ids.length >= maxItems;

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
    <div className="group overflow-hidden rounded-xl border border-gray-4 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-56 w-full overflow-hidden bg-gray-5">
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {displayImages.map((imageUrl, index) => (
              <div key={index} className="relative h-full min-w-0 flex-[0_0_100%]">
                <Image
                  src={imageUrl}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
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
              className="absolute left-2 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-1" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-gray-1" />
            </button>
          </>
        )}

        <div className="absolute left-2.5 top-2.5 z-30 flex items-center gap-2">
          {isFeatured ? (
            <Badge variant="primary" size="sm">
              Featured
            </Badge>
          ) : null}
          <Badge variant="default" size="sm" className="flex items-center gap-1">
            <IconCamera className="h-4 w-4" />
            <span>{imageCount}</span>
          </Badge>
        </div>

        <div className="absolute right-2.5 top-2.5 z-30">
          <Badge variant="default" size="sm">
            {year}
          </Badge>
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <div className="flex items-center gap-2.5">
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
                "flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-md transition-colors",
                (!isLoaded || compareLimitReached) && "cursor-not-allowed opacity-60"
              )}
            >
              {inCompare ? <Check className="h-5 w-5" /> : <GitCompare className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={onLikeClick}
              disabled={isWishlistPending}
              aria-label={isLiked ? "Remove from favorites" : "Save to favorites"}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-md transition-colors hover:text-red-500",
                isLiked && "text-red-500",
                isWishlistPending && "cursor-wait opacity-80"
              )}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            </button>
          </div>
        </div>

        {imageCount > 1 && (
          <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
            {Array.from({ length: Math.min(imageCount, 5) }).map((_, index) => (
              <button
                key={index}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  emblaApi?.scrollTo(index);
                }}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  selectedIndex === index ? "w-4 bg-white" : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
            {imageCount > 5 ? (
              <span className="ml-1 text-xs font-medium text-white">+{imageCount - 5}</span>
            ) : null}
          </div>
        )}
      </div>

      <div className="p-4">
        <span className="text-[14px] font-normal leading-[19.6px] text-[#333333]">{bodyType}</span>

        <h3 className="mt-1 line-clamp-1 text-[18px] font-medium leading-[25.2px] text-[#242720]">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 line-clamp-1 text-[13px] font-medium leading-[18px] text-[#696665]">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium leading-[19.6px] text-[#696665]">
          <div className="flex items-center gap-1.5">
            <IconSpeedometer className="h-4 w-4" />
            <span>{mileage}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconFuel className="h-4 w-4" />
            <span>{fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconGear className="h-4 w-4" />
            <span>{transmission}</span>
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[20px] font-bold leading-[28px] text-[#333333]">
            {currency}
            {formattedPrice}
          </span>
          {formattedOriginalPrice ? (
            <span className="text-[13px] font-medium leading-[19.6px] text-[#B6B6B6] line-through">
              {currency}
              {formattedOriginalPrice}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
