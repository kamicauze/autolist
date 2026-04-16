"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { IconSpeedometer, IconFuel, IconGear, IconCamera } from "./icons";
import { ChevronLeft, ChevronRight, Check, GitCompare, Heart } from "lucide-react";
import { useCompare } from "@/lib/hooks/use-compare";

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
  href,
}: CarCardProps) {
  void _seller;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isLiked, setIsLiked] = React.useState(false);
  const { ids, isLoaded, isInCompare, toggleCompare, maxItems } = useCompare();

  const formattedPrice = new Intl.NumberFormat("en-KE").format(price);
  const formattedOriginalPrice = originalPrice
    ? new Intl.NumberFormat("en-KE").format(originalPrice)
    : null;

  const imageCount = images.length;
  const displayImages = imageCount > 0 ? images : ["/placeholder-car.jpg"];
  const inCompare = isInCompare(id);
  const compareLimitReached = !inCompare && ids.length >= maxItems;

  const scrollPrev = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      emblaApi?.scrollPrev();
    },
    [emblaApi]
  );

  const scrollNext = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
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

  const onLikeClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLiked((prev) => !prev);
  }, []);

  const cardContent = (
    <div className="group overflow-hidden rounded-xl bg-white shadow-sm border border-gray-4 hover:shadow-md transition-shadow">
      {/* Image Section with Carousel */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-5">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {displayImages.map((imageUrl, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0 relative h-full"
              >
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

        {/* Navigation Arrows */}
        {imageCount > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-1" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-gray-1" />
            </button>
          </>
        )}

        {/* Badges overlay */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-2 z-30">
          {isFeatured && (
            <Badge variant="primary" size="sm">
              Featured
            </Badge>
          )}
          <Badge variant="default" size="sm" className="flex items-center gap-1">
            <IconCamera className="h-4 w-4" />
            <span>{imageCount}</span>
          </Badge>
        </div>

        {/* Year badge */}
        <div className="absolute right-2.5 top-2.5 z-30">
          <Badge variant="default" size="sm">
            {year}
          </Badge>
        </div>

        {/* Hover overlay actions (compare first, then favorite) */}
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
              aria-label={isLiked ? "Remove from favorites" : "Save to favorites"}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-md transition-colors hover:text-red-500",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            </button>
          </div>
        </div>

        {/* Image dots indicator */}
        {imageCount > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 z-30">
            {Array.from({ length: Math.min(imageCount, 5) }).map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  emblaApi?.scrollTo(i);
                }}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  selectedIndex === i
                    ? "bg-white w-4"
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
            {imageCount > 5 && (
              <span className="text-xs text-white font-medium ml-1">
                +{imageCount - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Body type */}
        <span className="text-[14px] font-normal leading-[19.6px] text-[#333333]">
          {bodyType}
        </span>

        {/* Title */}
        <h3 className="mt-1 text-[18px] font-medium leading-[25.2px] text-[#242720] line-clamp-1">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 line-clamp-1 text-[13px] font-medium leading-[18px] text-[#696665]">
            {subtitle}
          </p>
        ) : null}

        {/* Specs */}
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

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[20px] font-bold leading-[28px] text-[#333333]">
            {currency}
            {formattedPrice}
          </span>
          {formattedOriginalPrice && (
            <span className="text-[13px] font-medium leading-[19.6px] text-[#B6B6B6] line-through">
              {currency}
              {formattedOriginalPrice}
            </span>
          )}
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
