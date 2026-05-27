"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Play, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageGalleryProps {
  images: string[];
  title: string;
  videoUrl?: string | null;
}

export function ImageGallery({ images, title, videoUrl }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [showAllImages, setShowAllImages] = React.useState(false);
  const displayImages = images.length > 0 ? images : ["/placeholder-car.jpg"];
  const imageCount = displayImages.length;

  const handleImageSelect = (index: number) => {
    setSelectedIndex(index);
    setShowAllImages(false);
  };

  const scrollPrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
  };

  const scrollNext = () => {
    setSelectedIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={displayImages[selectedIndex]}
          alt={`${title} - Image ${selectedIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 600px"
          priority
        />

        {/* Navigation Arrows */}
        {imageCount > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
          </>
        )}

        {/* Action buttons overlay */}
        <div className="absolute bottom-4 left-4 z-10 flex gap-2">
          {videoUrl ? (
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="h-9 bg-white/90 text-black hover:bg-white"
            >
              <a href="#listing-video">
                <Play className="h-4 w-4" />
                Video
              </a>
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            className="h-9 bg-white/90 text-black hover:bg-white"
            onClick={() => setShowAllImages(true)}
          >
            <Images className="h-4 w-4" />
            View gallery
          </Button>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 overflow-x-auto py-2">
        {displayImages.slice(0, 8).map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg transition-all",
              selectedIndex === index
                ? "ring-2 ring-primary ring-offset-2"
                : "opacity-70 hover:opacity-100"
            )}
          >
            <Image
              src={image}
              alt={`${title} thumbnail ${index + 1}`}
              fill
              className="object-contain"
              sizes="80px"
            />
          </button>
        ))}
        {imageCount > 8 && (
          <button
            onClick={() => setShowAllImages(true)}
            className="relative flex h-20 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-200 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-300"
          >
            View all
          </button>
        )}
      </div>

      {/* All Images Dialog */}
      <Dialog open={showAllImages} onOpenChange={setShowAllImages}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title} gallery</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageSelect(index)}
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-lg transition-all hover:opacity-90",
                  selectedIndex === index && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <Image
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
