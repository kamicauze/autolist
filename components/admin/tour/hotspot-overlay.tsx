"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type HotspotStep = {
  /**
   * Unique id for the step. Used for analytics and to scope localStorage keys.
   */
  id: string;
  /**
   * CSS selector for the element to spotlight. If omitted (or no element matches),
   * the tooltip renders centered on screen with no spotlight cutout.
   */
  selector?: string;
  /**
   * Short heading shown at the top of the tooltip.
   */
  title: string;
  /**
   * Body copy. Plain text only — keep it under ~30 words.
   */
  body: string;
  /**
   * Where to place the tooltip relative to the spotlight. Auto-flips when there
   * isn't enough room. Default: "bottom".
   */
  placement?: "top" | "bottom" | "left" | "right";
  /**
   * Padding around the spotlighted element (px). Default: 8.
   */
  padding?: number;
};

interface HotspotOverlayProps {
  open: boolean;
  steps: HotspotStep[];
  stepIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

type Rect = { top: number; left: number; width: number; height: number };

function getRectForSelector(selector?: string): Rect | null {
  if (!selector || typeof document === "undefined") return null;
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return {
    top: r.top + window.scrollY,
    left: r.left + window.scrollX,
    width: r.width,
    height: r.height,
  };
}

function scrollIntoViewIfNeeded(selector?: string) {
  if (!selector || typeof document === "undefined") return;
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  const r = el.getBoundingClientRect();
  const offscreen =
    r.top < 80 || r.bottom > window.innerHeight - 80 || r.left < 0 || r.right > window.innerWidth;
  if (offscreen) {
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }
}

/**
 * Computes a tooltip position that keeps the card on-screen. We don't bother
 * with a full positioning library here; the tour has a small fixed step count.
 */
function computeTooltipPosition(
  rect: Rect | null,
  placement: HotspotStep["placement"],
  cardSize: { width: number; height: number }
): { top: number; left: number; arrow: "top" | "bottom" | "left" | "right" | "none" } {
  const margin = 16;
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1280;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
  const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
  const scrollX = typeof window !== "undefined" ? window.scrollX : 0;

  // No anchor → center the card.
  if (!rect) {
    return {
      top: scrollY + viewportH / 2 - cardSize.height / 2,
      left: scrollX + viewportW / 2 - cardSize.width / 2,
      arrow: "none",
    };
  }

  const candidates: Record<NonNullable<HotspotStep["placement"]>, { top: number; left: number }> = {
    bottom: {
      top: rect.top + rect.height + margin,
      left: rect.left + rect.width / 2 - cardSize.width / 2,
    },
    top: {
      top: rect.top - cardSize.height - margin,
      left: rect.left + rect.width / 2 - cardSize.width / 2,
    },
    right: {
      top: rect.top + rect.height / 2 - cardSize.height / 2,
      left: rect.left + rect.width + margin,
    },
    left: {
      top: rect.top + rect.height / 2 - cardSize.height / 2,
      left: rect.left - cardSize.width - margin,
    },
  };

  const order: NonNullable<HotspotStep["placement"]>[] = (() => {
    const preferred = placement || "bottom";
    const rest: NonNullable<HotspotStep["placement"]>[] = ["bottom", "top", "right", "left"];
    return [preferred, ...rest.filter((p) => p !== preferred)];
  })();

  const fitsInViewport = (pos: { top: number; left: number }) => {
    const visibleTop = pos.top - scrollY;
    const visibleLeft = pos.left - scrollX;
    return (
      visibleTop >= margin &&
      visibleTop + cardSize.height <= viewportH - margin &&
      visibleLeft >= margin &&
      visibleLeft + cardSize.width <= viewportW - margin
    );
  };

  for (const p of order) {
    const pos = candidates[p];
    if (fitsInViewport(pos)) {
      return { ...pos, arrow: { bottom: "top", top: "bottom", left: "right", right: "left" }[p] as "top" | "bottom" | "left" | "right" };
    }
  }

  // Nothing fits — clamp the preferred candidate to viewport.
  const fallback = candidates[order[0]];
  return {
    top: Math.max(scrollY + margin, Math.min(fallback.top, scrollY + viewportH - cardSize.height - margin)),
    left: Math.max(scrollX + margin, Math.min(fallback.left, scrollX + viewportW - cardSize.width - margin)),
    arrow: "none",
  };
}

export function HotspotOverlay({
  open,
  steps,
  stepIndex,
  onPrev,
  onNext,
  onSkip,
  onFinish,
}: HotspotOverlayProps) {
  const [mounted, setMounted] = React.useState(false);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [cardSize, setCardSize] = React.useState({ width: 360, height: 200 });

  const step = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Recompute the spotlight rect whenever the step changes, the window resizes,
  // the page scrolls, or any layout-changing event fires.
  React.useEffect(() => {
    if (!open) return;
    const update = () => {
      scrollIntoViewIfNeeded(step?.selector);
      // Allow the smooth scroll a frame to settle before measuring.
      window.requestAnimationFrame(() => setRect(getRectForSelector(step?.selector)));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const interval = window.setInterval(update, 500); // catches re-renders
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      window.clearInterval(interval);
    };
  }, [open, step?.selector, stepIndex]);

  // Keep card size in sync so positioning is accurate on long copy.
  React.useLayoutEffect(() => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const observer = new ResizeObserver(() => {
      setCardSize({ width: el.offsetWidth, height: el.offsetHeight });
    });
    observer.observe(el);
    setCardSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => observer.disconnect();
  }, [open, stepIndex]);

  // Keyboard navigation.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (isLast) onFinish();
        else onNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isLast, onPrev, onNext, onSkip, onFinish]);

  if (!mounted || !open || !step) return null;

  const padding = step.padding ?? 8;
  const cutout = rect
    ? {
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }
    : null;

  const tooltipPos = computeTooltipPosition(
    cutout
      ? { top: cutout.top, left: cutout.left, width: cutout.width, height: cutout.height }
      : null,
    step.placement,
    cardSize
  );

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[1200]"
      role="dialog"
      aria-modal="true"
      aria-label={`Tour step ${stepIndex + 1} of ${steps.length}: ${step.title}`}
    >
      {/* Dim layer with a CSS spotlight hole. We use a single div with a huge
          box-shadow so the cutout is crisp without needing SVG masking. */}
      {cutout ? (
        <div
          className="pointer-events-auto absolute rounded-[12px] ring-2 ring-white/80 transition-all duration-200"
          style={{
            top: cutout.top,
            left: cutout.left,
            width: cutout.width,
            height: cutout.height,
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.65)",
          }}
          onClick={(e) => {
            // Clicks on the spotlight pass through to the highlighted element
            // visually, but we intercept here so a stray click doesn't dismiss
            // the tour. The user must use the buttons.
            e.stopPropagation();
          }}
        />
      ) : (
        <div
          className="pointer-events-auto absolute inset-0"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}
        />
      )}

      {/* Tooltip card. */}
      <div
        ref={cardRef}
        className="pointer-events-auto absolute w-[min(92vw,360px)] rounded-[14px] border border-[#e5e7eb] bg-white p-5 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)]"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow */}
        {tooltipPos.arrow !== "none" ? (
          <span
            aria-hidden
            className={cn(
              "absolute h-3 w-3 rotate-45 border bg-white",
              tooltipPos.arrow === "top" && "-top-1.5 left-1/2 -translate-x-1/2 border-l border-t border-r-0 border-b-0 border-[#e5e7eb]",
              tooltipPos.arrow === "bottom" && "-bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-t-0 border-l-0 border-[#e5e7eb]",
              tooltipPos.arrow === "left" && "-left-1.5 top-1/2 -translate-y-1/2 border-l border-b border-t-0 border-r-0 border-[#e5e7eb]",
              tooltipPos.arrow === "right" && "-right-1.5 top-1/2 -translate-y-1/2 border-r border-t border-b-0 border-l-0 border-[#e5e7eb]"
            )}
          />
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="-mr-2 -mt-1 rounded-md p-1 text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
            aria-label="Skip automatic tours"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mt-2 text-[16px] font-semibold leading-6 text-[#111827]">
          {step.title}
        </h3>
        <p className="mt-2 text-[13px] leading-5 text-[#4b5563]">{step.body}</p>

        {/* Progress dots */}
        <div className="mt-4 flex gap-1.5">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                i < stepIndex && "bg-[#2563eb]",
                i === stepIndex && "bg-[#2563eb]",
                i > stepIndex && "bg-[#e5e7eb]"
              )}
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onSkip}
            className="text-[13px] font-medium text-[#6b7280] transition hover:text-[#111827]"
          >
            Skip tours
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={stepIndex === 0}
              className="inline-flex h-9 items-center gap-1 rounded-[8px] border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <button
              type="button"
              onClick={isLast ? onFinish : onNext}
              className="inline-flex h-9 items-center gap-1 rounded-[8px] bg-[#2563eb] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              {isLast ? "Got it" : "Next"}
              {!isLast ? <ArrowRight className="h-3.5 w-3.5" /> : null}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
