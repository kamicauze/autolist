"use client";

import * as React from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Play, Images, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageGalleryProps {
  images: string[];
  title: string;
  videoUrl?: string | null;
}

type ZoomView = { scale: number; x: number; y: number };
type Point = { x: number; y: number };
type Size = { width: number; height: number };

const MAX_ZOOM = 4;
const CLICK_ZOOM = 2.5;
const INITIAL_VIEW: ZoomView = { scale: 1, x: 0, y: 0 };

const clampScale = (scale: number) => Math.min(MAX_ZOOM, Math.max(1, scale));

const toStagePoint = (rect: DOMRect, clientX: number, clientY: number): Point => ({
  x: clientX - rect.left - rect.width / 2,
  y: clientY - rect.top - rect.height / 2,
});

const zoomAt = (view: ZoomView, scale: number, point: Point): ZoomView => {
  const ratio = scale / view.scale;
  return {
    scale,
    x: point.x - (point.x - view.x) * ratio,
    y: point.y - (point.y - view.y) * ratio,
  };
};

// Keeps the rendered (object-contain) image edges from being panned past the stage.
const clampView = (view: ZoomView, rect: DOMRect, natural: Size | null): ZoomView => {
  const scale = clampScale(view.scale);
  const fit = natural
    ? Math.min(rect.width / natural.width, rect.height / natural.height)
    : 1;
  const width = natural ? natural.width * fit : rect.width;
  const height = natural ? natural.height * fit : rect.height;
  const maxX = Math.max(0, (width * scale - rect.width) / 2);
  const maxY = Math.max(0, (height * scale - rect.height) / 2);
  return {
    scale,
    x: Math.min(maxX, Math.max(-maxX, view.x)),
    y: Math.min(maxY, Math.max(-maxY, view.y)),
  };
};

function LightboxImage({
  src,
  alt,
  onSwipe,
}: {
  src: string;
  alt: string;
  onSwipe: (direction: 1 | -1) => void;
}) {
  const [view, setView] = React.useState<ZoomView>(INITIAL_VIEW);
  const [isGesturing, setIsGesturing] = React.useState(false);
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null);
  const viewRef = React.useRef<ZoomView>(INITIAL_VIEW);
  const naturalSize = React.useRef<Size | null>(null);
  const pointers = React.useRef(new Map<number, Point>());
  const gesture = React.useRef<{ view: ZoomView; origin: Point; distance: number } | null>(null);
  const session = React.useRef({ start: { x: 0, y: 0 }, moved: false, pinched: false });

  const commit = React.useCallback((next: ZoomView) => {
    viewRef.current = next;
    setView(next);
  }, []);

  React.useEffect(() => {
    if (!stage) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      const rect = stage.getBoundingClientRect();
      const current = viewRef.current;
      const scale = clampScale(current.scale * Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.002)));
      commit(
        clampView(
          zoomAt(current, scale, toStagePoint(rect, event.clientX, event.clientY)),
          rect,
          naturalSize.current
        )
      );
    };
    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, [stage, commit]);

  const getGesturePoints = () => {
    const [a, b] = [...pointers.current.values()];
    return {
      origin: b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : a,
      distance: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
    };
  };

  const startGesture = () => {
    gesture.current = { view: viewRef.current, ...getGesturePoints() };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) {
      session.current = {
        start: { x: event.clientX, y: event.clientY },
        moved: false,
        pinched: false,
      };
    } else {
      session.current.pinched = true;
    }
    startGesture();
    setIsGesturing(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (!stage || !start || !pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const { origin, distance } = getGesturePoints();
    if (Math.hypot(origin.x - start.origin.x, origin.y - start.origin.y) > 4) {
      session.current.moved = true;
    }

    const rect = stage.getBoundingClientRect();
    if (distance > 0 && start.distance > 0) {
      const scale = clampScale((start.view.scale * distance) / start.distance);
      const anchor = toStagePoint(rect, start.origin.x, start.origin.y);
      const current = toStagePoint(rect, origin.x, origin.y);
      const ratio = scale / start.view.scale;
      commit(
        clampView(
          {
            scale,
            x: current.x - (anchor.x - start.view.x) * ratio,
            y: current.y - (anchor.y - start.view.y) * ratio,
          },
          rect,
          naturalSize.current
        )
      );
    } else if (start.view.scale > 1) {
      commit(
        clampView(
          {
            scale: start.view.scale,
            x: start.view.x + origin.x - start.origin.x,
            y: start.view.y + origin.y - start.origin.y,
          },
          rect,
          naturalSize.current
        )
      );
    }
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(event.pointerId)) return;
    if (pointers.current.size > 0) {
      startGesture();
      return;
    }
    gesture.current = null;
    setIsGesturing(false);

    const { start, pinched } = session.current;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const isSwipe = Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5;
    if (!pinched && viewRef.current.scale === 1 && isSwipe) {
      onSwipe(dx < 0 ? 1 : -1);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!stage || session.current.moved || session.current.pinched) return;
    if (viewRef.current.scale > 1) {
      commit(INITIAL_VIEW);
      return;
    }
    const rect = stage.getBoundingClientRect();
    commit(
      clampView(
        zoomAt(viewRef.current, CLICK_ZOOM, toStagePoint(rect, event.clientX, event.clientY)),
        rect,
        naturalSize.current
      )
    );
  };

  return (
    <div
      ref={setStage}
      className={cn(
        "absolute inset-0 touch-none select-none overflow-hidden",
        view.scale > 1
          ? isGesturing
            ? "cursor-grabbing"
            : "cursor-grab"
          : "cursor-zoom-in"
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onClick={handleClick}
    >
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        className="scale-110 object-cover blur-2xl"
        sizes="100vw"
      />
      <div aria-hidden className="absolute inset-0 bg-black/60" />
      <div
        className={cn(
          "absolute inset-0 will-change-transform",
          !isGesturing && "transition-transform duration-200 ease-out"
        )}
        style={{
          transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          draggable={false}
          className="object-contain"
          sizes="100vw"
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (naturalWidth && naturalHeight) {
              naturalSize.current = { width: naturalWidth, height: naturalHeight };
            }
          }}
        />
      </div>
    </div>
  );
}

export function ImageGallery({ images, title, videoUrl }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [showAllImages, setShowAllImages] = React.useState(false);
  const [showLightbox, setShowLightbox] = React.useState(false);
  const displayImages = images.length > 0 ? images : ["/placeholder-car.jpg"];
  const imageCount = displayImages.length;

  // Gallery grid opens the full-screen viewer on top; closing it returns to the grid.
  const handleImageSelect = (index: number) => {
    setSelectedIndex(index);
    setShowLightbox(true);
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
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-900">
        <Image
          src={displayImages[selectedIndex]}
          alt=""
          aria-hidden
          fill
          className="scale-110 object-cover blur-2xl"
          sizes="(max-width: 768px) 100vw, 600px"
        />
        <div aria-hidden className="absolute inset-0 bg-black/25" />
        <Image
          src={displayImages[selectedIndex]}
          alt={`${title} - Image ${selectedIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 600px"
          priority
        />
        <button
          type="button"
          onClick={() => setShowLightbox(true)}
          className="absolute inset-0 cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
          aria-label={`Open image ${selectedIndex + 1} of ${imageCount} full screen`}
        />

        {/* Navigation Arrows */}
        {imageCount > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/55 text-gray-800 shadow-sm backdrop-blur-md transition-colors hover:bg-white/70 sm:left-4 sm:h-9 sm:w-9"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/55 text-gray-800 shadow-sm backdrop-blur-md transition-colors hover:bg-white/70 sm:right-4 sm:h-9 sm:w-9"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </>
        )}
        {/* Action buttons overlay */}
        <div className="absolute bottom-3 left-3 z-10 flex gap-2 sm:bottom-4 sm:left-4">
          {videoUrl ? (
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="h-8 rounded-full border border-white/25 bg-black/35 px-3 text-xs text-white shadow-sm backdrop-blur-md hover:bg-black/45"
            >
              <a href="#listing-video">
                <Play className="h-3.5 w-3.5" />
                Video
              </a>
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            className="h-8 rounded-full border border-white/25 bg-black/35 px-3 text-xs text-white shadow-sm backdrop-blur-md hover:bg-black/45"
            onClick={() => setShowAllImages(true)}
          >
            <Images className="h-3.5 w-3.5" />
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
              className="object-cover"
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
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogPortal>
          <DialogOverlay className="bg-black" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-[60] bg-black outline-none"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                scrollPrev();
              } else if (event.key === "ArrowRight") {
                event.preventDefault();
                scrollNext();
              }
            }}
          >
            <DialogTitle className="sr-only">{title} photos</DialogTitle>
            <LightboxImage
              key={selectedIndex}
              src={displayImages[selectedIndex]}
              alt={`${title} - Image ${selectedIndex + 1}`}
              onSwipe={(direction) => (direction > 0 ? scrollNext() : scrollPrev())}
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3 sm:p-4">
              <span className="rounded-full bg-black/50 px-3 py-1 text-sm font-medium tabular-nums text-white backdrop-blur-md">
                {selectedIndex + 1} / {imageCount}
              </span>
              <DialogClose
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </DialogClose>
            </div>

            {imageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={scrollPrev}
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:left-6 sm:h-12 sm:w-12"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:right-6 sm:h-12 sm:w-12"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
